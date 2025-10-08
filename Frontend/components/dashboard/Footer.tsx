import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>Designed by</span>
            <span className="font-semibold">Swaraj Jadhav</span>
          </div>
          <div className="text-slate-400">
            © 2025 SecureBank Pro. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}