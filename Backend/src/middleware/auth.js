const jwtUtils = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const token = jwtUtils.extractTokenFromHeader(authHeader);
    const decoded = jwtUtils.verifyAccessToken(token);

    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select('-password -mfaSecret');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is locked due to multiple failed login attempts',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = jwtUtils.extractTokenFromHeader(authHeader);
    const decoded = jwtUtils.verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password -mfaSecret');
    
    if (user && user.isActive && !user.isLocked) {
      req.user = user;
      req.userId = user._id;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Resource ownership middleware
const checkResourceOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check if user owns the resource
      if (resource.userId && resource.userId.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource',
          code: 'ACCESS_DENIED'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Resource ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// MFA verification middleware
const requireMFA = (req, res, next) => {
  if (!req.user.isMFAEnabled) {
    return next();
  }

  const mfaVerified = req.headers['x-mfa-verified'];
  
  if (!mfaVerified || mfaVerified !== 'true') {
    return res.status(403).json({
      success: false,
      message: 'MFA verification required',
      code: 'MFA_REQUIRED'
    });
  }

  next();
};

// Rate limiting for sensitive operations
const sensitiveOperationRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.userId}-${req.ip}`;
    const now = Date.now();
    const userAttempts = attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < windowMs);
    attempts.set(key, validAttempts);

    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many sensitive operations attempted. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    // Add current attempt
    validAttempts.push(now);
    attempts.set(key, validAttempts);

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkResourceOwnership,
  requireMFA,
  sensitiveOperationRateLimit
};
