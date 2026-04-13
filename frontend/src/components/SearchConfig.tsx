'use client';

import React, { useState } from 'react';
import { Globe, MessageSquare, Layers, X, Bolt, ChevronDown, Search, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SearchConfigProps {
  onSearch: (data: any) => void;
  isLoading: boolean;
}

export const SearchConfig: React.FC<SearchConfigProps> = ({ onSearch, isLoading }) => {
  const [mode, setMode] = useState<'A' | 'B' | 'C'>('A');
  const [query, setQuery] = useState('');
  const [subreddit, setSubreddit] = useState('');
  
  const [intensity, setIntensity] = useState(500);
  const [layers, setLayers] = useState(3);
  const [timeRange, setTimeRange] = useState('过去一周');
  const [source, setSource] = useState<'tavily' | 'apify'>('tavily');

  React.useEffect(() => {
    const savedSource = localStorage.getItem('default_data_source') as 'tavily' | 'apify';
    if (savedSource) setSource(savedSource);
  }, []);

  const handleSubmit = () => {
    onSearch({ 
      scenario: mode, 
      query, 
      subreddit,
      source,
      config: {
        intensity,
        layers,
        timeRange
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto"
    >
      <header className="mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2 font-headline">需求挖掘配置</h2>
        <p className="text-on-surface-variant text-lg">设置搜索范围、深度及时间维度，AI 将精准提取用户痛点。</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          {/* Scope Definition */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-6">搜索范围</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'A', label: '全站搜索', icon: Globe },
                { id: 'B', label: '版块深挖', icon: MessageSquare },
                { id: 'C', label: '组合搜索', icon: Layers },
              ].map((type) => (
                <label key={type.id} className="cursor-pointer">
                  <input 
                    checked={mode === type.id} 
                    onChange={() => setMode(type.id as any)}
                    className="peer hidden" 
                    name="search_type" 
                    type="radio" 
                  />
                  <div className="p-4 border border-outline-variant/20 rounded-lg text-center transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-lg hover:bg-surface-container-low h-full flex flex-col justify-center">
                    <type.icon size={24} className="mx-auto mb-2" />
                    <span className="text-xs font-bold">{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Query Parameters */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">查询关键词 & 目标</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant">智能增强</span>
                <button className="w-10 h-5 bg-primary/10 rounded-full relative p-0.5 flex items-center">
                  <div className="w-4 h-4 bg-primary rounded-full translate-x-5"></div>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {mode !== 'B' && (
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary transition-all resize-none" 
                  placeholder="输入您想挖掘的产品、话题或痛点关键词..." 
                  rows={3}
                />
              )}
              {mode !== 'A' && (
                <div className="flex items-center gap-3 bg-surface-container-low px-4 py-3 rounded-xl">
                  <span className="text-on-surface-variant font-bold text-sm">r/</span>
                  <input 
                    type="text"
                    value={subreddit}
                    onChange={(e) => setSubreddit(e.target.value)}
                    placeholder="输入子版块名称 (例如: gamedev)"
                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Data Engine Selection */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-6">数据分析引擎</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'tavily', name: 'Tavily Fast', desc: 'AI 优化 / 超快 / 降噪', color: 'bg-primary' },
                { id: 'apify', name: 'Apify Deep', desc: '深度爬取 / 评论详情', color: 'bg-secondary' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSource(s.id as any)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group",
                    source === s.id 
                      ? "border-primary bg-primary/5" 
                      : "border-outline-variant/20 bg-surface-container-low hover:border-primary/30"
                  )}
                >
                  <div className="relative z-10">
                    <p className={cn("text-xs font-bold mb-1", source === s.id ? "text-primary" : "text-on-surface-variant")}>{s.name}</p>
                    <p className="text-[10px] text-on-surface-variant opacity-70">{s.desc}</p>
                  </div>
                  {source === s.id && (
                    <div className="absolute right-2 top-2">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mining Intensity */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-8">挖掘强度</h3>
            <div className="space-y-10">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-bold text-primary">抓取帖子数量</label>
                  <span className="text-xl font-extrabold text-primary font-headline">{intensity}</span>
                </div>
                <input 
                  max="2000" min="50" step="50" type="range" 
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-1 bg-outline-variant/20 rounded-full appearance-none accent-primary cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-bold">
                  <span>快速扫描</span>
                  <span>深度审计</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-bold text-primary">评论穿透层数</label>
                  <span className="text-xl font-extrabold text-primary font-headline">{layers} 层</span>
                </div>
                <input 
                  max="10" min="1" step="1" type="range" 
                  value={layers}
                  onChange={(e) => setLayers(Number(e.target.value))}
                  className="w-full h-1 bg-outline-variant/20 rounded-full appearance-none accent-primary cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-bold">
                  <span>表面摘要</span>
                  <span>全线程追踪</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          {/* Time Filter */}
          <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-6">时间维度</h3>
            <div className="relative">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full appearance-none bg-white border-none rounded-xl py-4 px-5 text-sm font-bold text-primary shadow-sm focus:ring-2 focus:ring-primary"
              >
                <option>最近 24 小时</option>
                <option>过去一周</option>
                <option>过去一月</option>
                <option>过去一年</option>
                <option>不限时间</option>
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
            </div>
            <p className="text-[11px] text-on-surface-variant mt-4 leading-relaxed italic">
              选择合适的时间跨度以过滤已失效或过于陈旧的需求反馈。
            </p>
          </div>

          {/* Estimate Extraction */}
          <div className="bg-primary text-white p-8 rounded-xl relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">资源预估</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">预计扫描评论</span>
                  <span className="text-lg font-headline font-bold">~{intensity * layers * 5}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">AI 算力消耗</span>
                  <span className="text-lg font-headline font-bold">{(intensity / 100).toFixed(1)}k Token</span>
                </div>
                <div className="pt-4 border-t border-white/10 mt-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Bolt size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">极速模式已开启</p>
                      <p className="text-[10px] opacity-60">使用分布式爬虫加速数据并行采集。</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-white text-primary py-4 rounded-xl font-extrabold text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Search size={18} />
                    )}
                    {isLoading ? '正在初始化...' : '立即开始数据挖掘'}
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>
          </div>

          {/* Pro-Tip */}
          <div className="bg-surface-container-low p-6 rounded-xl flex items-start gap-4 border border-outline-variant/5">
            <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex-shrink-0 flex items-center justify-center border border-outline-variant/10">
              <Bolt size={24} className="text-secondary" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-primary mb-1">专业技巧</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                使用组合搜索 (Combined) 并将挖掘强度设置为 500+，可以获得更具统计学意义的用户反馈深度分析。
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
