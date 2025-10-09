const User = require('../models/User');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { username, email, password, firstName, lastName, phone, dateOfBirth } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmailOrUsername(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email or username',
          code: 'USER_EXISTS'
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        dateOfBirth: new Date(dateOfBirth)
      });

      await user.save();

      // Generate tokens
      const tokens = jwtUtils.generateTokenPair(user);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`New user registered: ${user.username}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isMFAEnabled: user.isMFAEnabled,
            lastLogin: user.lastLogin
          },
          tokens
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        code: 'REGISTRATION_FAILED'
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { identifier, password } = req.body;

      // Find user by email or username
      const user = await User.findByEmailOrUsername(identifier);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(401).json({
          success: false,
          message: 'Account is locked due to multiple failed login attempts',
          code: 'ACCOUNT_LOCKED'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate tokens
      const tokens = jwtUtils.generateTokenPair(user);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Add refresh token to user's tokens array
      user.refreshTokens.push({ token: tokens.refreshToken });
      await user.save();

      logger.info(`User logged in: ${user.username}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isMFAEnabled: user.isMFAEnabled,
            lastLogin: user.lastLogin
          },
          tokens
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        code: 'LOGIN_FAILED'
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Remove refresh token from user's tokens array
        await User.findByIdAndUpdate(req.userId, {
          $pull: { refreshTokens: { token: refreshToken } }
        });
      }

      logger.info(`User logged out: ${req.user.username}`);

      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        code: 'LOGOUT_FAILED'
      });
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      // Verify refresh token
      const decoded = jwtUtils.verifyRefreshToken(refreshToken);
      
      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      const tokenExists = user.refreshTokens.some(token => token.token === refreshToken);
      if (!tokenExists) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      // Generate new access token
      const newAccessToken = jwtUtils.generateAccessToken({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '30m'
        }
      });

    } catch (error) {
      logger.error('Token refresh error:', error);
      
      if (error.message === 'Refresh token expired') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        code: 'TOKEN_REFRESH_FAILED'
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId).select('-password -mfaSecret -refreshTokens');
      
      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        code: 'PROFILE_FETCH_FAILED'
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'preferences'];
      const updates = {};

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.userId,
        updates,
        { new: true, runValidators: true }
      ).select('-password -mfaSecret -refreshTokens');

      logger.info(`User profile updated: ${user.username}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Profile update failed',
        code: 'PROFILE_UPDATE_FAILED'
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Invalidate all refresh tokens
      user.refreshTokens = [];
      await user.save();

      logger.info(`Password changed for user: ${user.username}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password change failed',
        code: 'PASSWORD_CHANGE_FAILED'
      });
    }
  }

  // Verify MFA code
  async verifyMFA(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'MFA code required',
          code: 'MISSING_MFA_CODE'
        });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify MFA code
      const isCodeValid = user.verifyMFACode(code);
      if (!isCodeValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid MFA code',
          code: 'INVALID_MFA_CODE'
        });
      }

      res.json({
        success: true,
        message: 'MFA verification successful'
      });

    } catch (error) {
      logger.error('MFA verification error:', error);
      res.status(500).json({
        success: false,
        message: 'MFA verification failed',
        code: 'MFA_VERIFICATION_FAILED'
      });
    }
  }
}

module.exports = new AuthController();
