'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiLogin } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface LoginPageProps {
  onLogin: (username: string) => void;
  sessionExpired?: boolean;
}

export default function LoginPage({ onLogin, sessionExpired = false }: LoginPageProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  // Password strength calculation
  useEffect(() => {
    const calculatePasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      return Math.min(strength, 100);
    };

    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  // Handle form input changes
  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  // Login process via backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.username.trim()) {
      setError('Username is required');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiLogin(formData.username, formData.password);
      const { user, tokens } = res.data;
      // If MFA were required, we'd branch here; for now proceed to set tokens
      login(user.username, tokens);
      const loginTime = new Date();
      localStorage.setItem('secureBank_lastLogin', loginTime.toISOString());
      localStorage.setItem('secureBank_sessionTime', (Math.floor(Date.now() / 1000) + 30 * 60).toString());
      onLogin(user.username);
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MFA verification (demo only)
  const handleMFAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate MFA verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mfaCode === '123456') {
      // Successful login
      const loginTime = new Date();
      localStorage.setItem('secureBank_lastLogin', loginTime.toISOString());
      localStorage.setItem('secureBank_sessionTime', (Math.floor(Date.now() / 1000) + 30 * 60).toString());
      localStorage.setItem('secureBank_user', formData.username);
      
      onLogin(formData.username);
      router.push('/');
    } else {
      setError('Invalid MFA code. Please try again.');
      setIsLoading(false);
    }
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  if (showMFA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Multi-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your registered device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMFAVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Verification Code</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-sm text-slate-500 text-center">
                  Demo code: <span className="font-mono font-bold">123456</span>
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || mfaCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify & Login
                  </>
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setShowMFA(false)}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SecureBank Pro</h1>
          <p className="text-slate-600">Secure Financial Management Platform</p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpired && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your session has expired. Please log in again to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your secure banking account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Password Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength < 25 ? 'text-red-600' :
                        passwordStrength < 50 ? 'text-orange-600' :
                        passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="remember-me" className="text-sm text-slate-600">
                    Remember me
                  </Label>
                </div>
                <Button type="button" variant="link" className="text-sm text-blue-600 p-0 h-auto">
                  Forgot password?
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In Securely
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Demo Credentials:</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p><span className="font-mono">Username:</span> admin</p>
                <p><span className="font-mono">Password:</span> SecureBank2025!</p>
                <p><span className="font-mono">MFA Code:</span> 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>© 2025 SecureBank Pro. All rights reserved.</p>
          <p className="mt-1">Designed by Swaraj Jadhav</p>
        </div>
      </div>
    </div>
  );
}
