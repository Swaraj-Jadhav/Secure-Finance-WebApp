import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, User, Send, FileText, Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">SecureBank Pro</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Money
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Pay Bills
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              MFA Active
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}