'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Clock, Monitor, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SecurityBar() {
  const { user, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // 30 minutes in seconds
  const [lastLogin, setLastLogin] = useState<string>('');
  const [isSessionExtended, setIsSessionExtended] = useState<boolean>(false);

  // Initialize session data
  useEffect(() => {
    // Get or set last login time
    const savedLastLogin = localStorage.getItem('secureBank_lastLogin');
    const savedSessionTime = localStorage.getItem('secureBank_sessionTime');
    
    if (savedLastLogin) {
      setLastLogin(savedLastLogin);
    } else {
      const now = new Date();
      const formattedTime = formatLastLoginTime(now);
      setLastLogin(formattedTime);
      localStorage.setItem('secureBank_lastLogin', formattedTime);
    }

    // Restore session time if exists and not expired
    if (savedSessionTime) {
      const sessionEndTime = parseInt(savedSessionTime);
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = sessionEndTime - currentTime;
      
      if (remainingTime > 0) {
        setTimeLeft(remainingTime);
      }
    }
  }, []);

  // Session countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSessionExpired();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Save session time to localStorage when it changes
  useEffect(() => {
    if (timeLeft > 0) {
      const sessionEndTime = Math.floor(Date.now() / 1000) + timeLeft;
      localStorage.setItem('secureBank_sessionTime', sessionEndTime.toString());
    }
  }, [timeLeft]);

  // Format time left as MM:SS
  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format last login time
  const formatLastLoginTime = (date: Date): string => {
    const now = new Date();
    const diffInMs: number = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Get browser and platform info
  const getBrowserInfo = (): { browser: string; platform: string } => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown Browser';
    let platform = 'Unknown Platform';

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
    }

    // Detect platform
    if (userAgent.includes('Windows')) {
      platform = 'Windows';
    } else if (userAgent.includes('Mac')) {
      platform = 'macOS';
    } else if (userAgent.includes('Linux')) {
      platform = 'Linux';
    } else if (userAgent.includes('Android')) {
      platform = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      platform = 'iOS';
    }

    return { browser, platform };
  };

  // Handle session expiration
  const handleSessionExpired = (): void => {
    // Clear session data
    localStorage.removeItem('secureBank_sessionTime');
    
    // Logout user and redirect to login
    console.log('Session expired - redirecting to login...');
    logout();
  };

  // Extend session function
  const extendSession = (): void => {
    setTimeLeft(30 * 60); // Reset to 30 minutes
    setIsSessionExtended(true);
    
    // Reset the extended state after 2 seconds
    setTimeout(() => setIsSessionExtended(false), 2000);
  };

  // Refresh last login time
  const refreshLastLogin = (): void => {
    const now = new Date();
    const formattedTime = formatLastLoginTime(now);
    setLastLogin(formattedTime);
    localStorage.setItem('secureBank_lastLogin', formattedTime);
  };

  // Get dynamic last login info
  const getLastLoginInfo = (): string => {
    const { browser, platform } = getBrowserInfo();
    return `Last login: ${lastLogin} from ${browser} on ${platform}`;
  };

  // Get session warning level
  const getSessionWarningLevel = (): 'critical' | 'warning' | 'normal' => {
    if (timeLeft < 60) return 'critical';
    if (timeLeft < 300) return 'warning';
    return 'normal';
  };

  const warningLevel = getSessionWarningLevel();

  return (
    <div className="bg-blue-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-blue-700">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Biometric Login Enabled</span>
            </div>
            
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <span>Session expires in:</span>
                <span 
                  className={`font-mono font-bold ${
                    warningLevel === 'critical' 
                      ? 'text-red-600 animate-pulse' 
                      : warningLevel === 'warning'
                      ? 'text-orange-600'
                      : 'text-blue-700'
                  }`}
                >
                  {formatTimeLeft(timeLeft)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-blue-700">
              <Monitor className="w-4 h-4" />
              <span>{user ? `Logged in as: ${user.username}` : getLastLoginInfo()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="link" className="text-blue-700 h-auto p-0 text-sm">
              Security Settings
            </Button>
            <Button 
              variant="link" 
              className="text-red-600 h-auto p-0 text-sm flex items-center gap-1"
              onClick={logout}
            >
              <LogOut className="w-3 h-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}