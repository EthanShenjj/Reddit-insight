'use client';

import React from 'react';
import { Bell, Search, User, Globe } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <header className="h-16 border-b border-outline-variant/10 bg-surface/80 backdrop-blur-md fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="搜索报告或记录..." 
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all mb-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
          <Globe size={18} />
          <span>中文 (简体)</span>
        </button>
        
        <div className="h-8 w-px bg-outline-variant/20"></div>
        
        <button className="relative text-on-surface-variant hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full border-2 border-surface"></span>
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-primary">Ethan Shen</p>
            <p className="text-[10px] text-on-surface-variant font-medium">高级分析师</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-gradient flex items-center justify-center text-white shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};
