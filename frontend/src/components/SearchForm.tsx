'use client';

import { useState } from 'react';
import { Search, Loader2, Zap, Target, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface SearchFormProps {
  onSearch: (data: any) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [mode, setMode] = useState<'A' | 'B' | 'C'>('A');
  const [query, setQuery] = useState('');
  const [subreddit, setSubreddit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ scenario: mode, query, subreddit });
  };

  const tabs = [
    { id: 'A', label: '全站搜索', icon: GlobeIcon },
    { id: 'B', label: '版块深挖', icon: Target },
    { id: 'C', label: '组合搜索', icon: Layers },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            type="button"
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200",
              mode === tab.id 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            )}
            onClick={() => setMode(tab.id as any)}
          >
            {tab.id === 'A' ? <GlobeIcon size={16} /> : <tab.icon size={16} />}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode !== 'B' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
              核心关键词
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="例如: AI code assistant, fitness tracking..." 
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl py-4 px-5 text-sm transition-all focus:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-primary/5 rounded-lg text-primary">
                <Zap size={18} />
              </div>
            </div>
          </motion.div>
        )}

        {mode !== 'A' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="block text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
              Reddit 子版块
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">r/</span>
              <input 
                type="text" 
                placeholder="例如: startup, programming..." 
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl py-4 pl-10 pr-5 text-sm transition-all focus:ring-0"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                required
              />
            </div>
          </motion.div>
        )}

        <button 
          type="submit" 
          className="w-full bg-primary-gradient text-white py-4 rounded-xl font-bold tracking-tight shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 mt-4" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              AI 正在深度挖掘 Reddit 痛点...
            </>
          ) : (
            <>
              <Search size={20} />
              开始需求挖掘
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function GlobeIcon({ size = 20, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
