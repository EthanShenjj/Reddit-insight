'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  BarChart3, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: '控制面板', icon: LayoutDashboard },
    { id: 'searches', label: '新搜索', icon: Search },
    { id: 'reports', label: '分析报告', icon: BarChart3 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-surface-container-low z-50 border-r border-outline-variant/10">
      <div className="flex flex-col h-full py-6 px-4">
        {/* Brand Section */}
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold tracking-tight text-primary font-headline">REDDIT INSIGHT</h1>
          <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest mt-1">AI 洞察分析平台</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-headline font-semibold text-sm",
                activeTab === item.id 
                  ? "bg-surface-container-lowest text-primary shadow-sm" 
                  : "text-on-surface-variant hover:text-primary hover:bg-white/50"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="mt-auto pt-6 px-2">
          <button 
            onClick={() => setActiveTab('searches')}
            className="w-full bg-primary-gradient text-white py-3 rounded-lg font-semibold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            开始新搜索
          </button>
        </div>

        {/* Footer Tabs */}
        <div className="mt-6 pt-6 border-t border-outline-variant/20 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors text-sm">
            <HelpCircle size={18} />
            <span>帮助支持</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-secondary transition-colors text-sm">
            <LogOut size={18} />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
