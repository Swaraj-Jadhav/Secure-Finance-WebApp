import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Clock, Monitor } from 'lucide-react';

export default function SecurityBar() {
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
              <span>Session expires in: 27:51</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Monitor className="w-4 h-4" />
              <span>Last login: Today, 09:15 AM from Chrome</span>
            </div>
          </div>
          <Button variant="link" className="text-blue-700 h-auto p-0">
            Security Settings
          </Button>
        </div>
      </div>
    </div>
  );
}