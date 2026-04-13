'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Cpu, 
  Globe, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  X,
  Bolt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface LLMSettings {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature: number;
}

const DEFAULT_SETTINGS: LLMSettings = {
  id: 'default',
  name: '默认配置',
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-1.5-flash',
  baseUrl: '',
  temperature: 0.7,
};

export const Settings: React.FC = () => {
  const [profiles, setProfiles] = useState<LLMSettings[]>([DEFAULT_SETTINGS]);
  const [activeProfileId, setActiveProfileId] = useState<string>('default');
  const [editingProfile, setEditingProfile] = useState<LLMSettings>(DEFAULT_SETTINGS);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfileData, setNewProfileData] = useState<LLMSettings>(DEFAULT_SETTINGS);
  
  const [showKey, setShowKey] = useState(false);
  const [apifyToken, setApifyToken] = useState('');
  const [showApifyToken, setShowApifyToken] = useState(false);
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [defaultSource, setDefaultSource] = useState<'tavily' | 'apify'>('tavily');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const savedProfiles = localStorage.getItem('llm_profiles');
    const savedActiveId = localStorage.getItem('active_llm_profile_id');
    const savedApifyToken = localStorage.getItem('apify_api_token');
    const savedTavilyKey = localStorage.getItem('tavily_api_key');
    const savedSource = localStorage.getItem('default_data_source') as 'tavily' | 'apify';
    
    if (savedApifyToken) setApifyToken(savedApifyToken);
    if (savedTavilyKey) setTavilyApiKey(savedTavilyKey);
    if (savedSource) setDefaultSource(savedSource);
    
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles).map((p: any) => ({
          ...DEFAULT_SETTINGS,
          ...p
        }));
        setProfiles(parsed);
        
        const activeId = savedActiveId || parsed[0]?.id || 'default';
        setActiveProfileId(activeId);
        
        const activeProfile = parsed.find((p: LLMSettings) => p.id === activeId) || parsed[0] || DEFAULT_SETTINGS;
        setEditingProfile({ ...activeProfile });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    setTimeout(() => {
      const updatedProfiles = profiles.map(p => 
        p.id === editingProfile.id ? { ...editingProfile } : p
      );
      
      setProfiles(updatedProfiles);
      localStorage.setItem('llm_profiles', JSON.stringify(updatedProfiles));
      localStorage.setItem('active_llm_profile_id', activeProfileId);
      localStorage.setItem('apify_api_token', apifyToken);
      localStorage.setItem('tavily_api_key', tavilyApiKey);
      localStorage.setItem('default_data_source', defaultSource);
      
      setIsSaving(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const handleOpenAddModal = () => {
    setNewProfileData({
      ...DEFAULT_SETTINGS,
      id: Math.random().toString(36).substr(2, 9),
      name: `新配置方案 ${profiles.length + 1}`,
    });
    setIsModalOpen(true);
  };

  const confirmAddProfile = () => {
    const updated = [...profiles, newProfileData];
    setProfiles(updated);
    setEditingProfile(newProfileData);
    setActiveProfileId(newProfileData.id);
    localStorage.setItem('llm_profiles', JSON.stringify(updated));
    localStorage.setItem('active_llm_profile_id', newProfileData.id);
    setIsModalOpen(false);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    
    if (activeProfileId === id) {
      const nextActive = updated[0].id;
      setActiveProfileId(nextActive);
      setEditingProfile({ ...updated[0] });
      localStorage.setItem('active_llm_profile_id', nextActive);
    }
    
    localStorage.setItem('llm_profiles', JSON.stringify(updated));
  };

  const handleActivateProfile = (id: string) => {
    setActiveProfileId(id);
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      setEditingProfile({ ...profile });
    }
    localStorage.setItem('active_llm_profile_id', id);
  };

  const providers = [
    { id: 'gemini', name: 'Google Gemini', models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'] },
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
    { id: 'custom', name: '自定义 (OpenAI 兼容)', models: [] },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <SettingsIcon size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight font-headline">系统设置</h2>
        </div>
        <p className="text-on-surface-variant">配置您的 AI 引擎、API 密钥以及系统运行参数。</p>
      </header>

      <div className="space-y-8">
        {/* Profiles Section */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold font-headline text-primary flex items-center gap-2">
                <Cpu size={20} className="text-secondary" />
                配置方案
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">您可以创建多个配置方案，并在不同任务间切换。</p>
            </div>
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 shadow-md transition-all"
            >
              <Plus size={16} />
              添加预设
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profiles.map((profile) => (
              <div 
                key={profile.id}
                onClick={() => handleActivateProfile(profile.id)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group relative overflow-hidden",
                  activeProfileId === profile.id 
                    ? "border-primary bg-primary/5" 
                    : "border-outline-variant/30 bg-surface-container-low hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    activeProfileId === profile.id ? "bg-primary" : "bg-outline-variant"
                  )} />
                  <div>
                    <p className="text-sm font-bold text-primary">{profile.name}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{profile.provider} • {profile.model}</p>
                  </div>
                </div>
                
                {activeProfileId === profile.id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
                )}

                {profiles.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(profile.id);
                    }}
                    className="p-2 text-on-surface-variant hover:text-secondary opacity-0 group-hover:opacity-100 transition-all relative z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Data Source Configuration */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-tertiary-container" />
          <h3 className="text-xl font-bold font-headline text-primary mb-6 flex items-center gap-2">
            <Globe size={20} className="text-tertiary-container" />
            数据源配置 (Data Source)
          </h3>

          <div className="space-y-6">
            {/* Default Source Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                默认数据源
              </label>
              <div className="flex gap-3">
                {[
                  { id: 'tavily', name: 'Tavily (推荐)', desc: 'AI 优化搜索，无需 API 凭证，速度快' },
                  { id: 'apify', name: 'Apify Scraper', desc: '深度 Reddit 爬虫，支持复杂筛选' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setDefaultSource(s.id as 'tavily' | 'apify')}
                    className={cn(
                      "flex-1 p-4 rounded-xl border-2 text-left transition-all",
                      defaultSource === s.id 
                        ? "border-primary bg-primary/5" 
                        : "border-outline-variant/30 bg-surface-container-low hover:border-primary/40"
                    )}
                  >
                    <p className="text-sm font-bold text-primary">{s.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10">
              {/* Tavily Key */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                  Tavily API Key
                </label>
                <div className="relative">
                  <input 
                    type={showTavilyKey ? "text" : "password"}
                    value={tavilyApiKey}
                    onChange={(e) => setTavilyApiKey(e.target.value)}
                    placeholder="tvly-..."
                    className="w-full pl-4 pr-12 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-mono"
                  />
                  <button 
                    onClick={() => setShowTavilyKey(!showTavilyKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showTavilyKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Apify Token */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                  Apify Token (可选)
                </label>
                <div className="relative">
                  <input 
                    type={showApifyToken ? "text" : "password"}
                    value={apifyToken}
                    onChange={(e) => setApifyToken(e.target.value)}
                    placeholder="apify_api_..."
                    className="w-full pl-4 pr-12 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-mono"
                  />
                  <button 
                    onClick={() => setShowApifyToken(!showApifyToken)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showApifyToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-on-surface-variant opacity-60 italic leading-relaxed">
              Tavily 通过搜索技术获取数据（site:reddit.com），绕过 Reddit API 限制，自动提取核心网页内容，非常适合 AI 分析。
            </p>
          </div>
        </section>

        {/* API Configuration Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
          <h3 className="text-xl font-bold font-headline text-primary mb-6 flex items-center gap-2">
            <Key size={20} className="text-secondary" />
            API 配置 — {editingProfile.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Name */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                方案名称
              </label>
              <input 
                type="text"
                value={editingProfile.name}
                onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
              />
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                服务商
              </label>
              <select 
                value={editingProfile.provider}
                onChange={(e) => {
                  const provider = e.target.value;
                  const models = providers.find(p => p.id === provider)?.models || [];
                  setEditingProfile({ 
                    ...editingProfile, 
                    provider, 
                    model: models[0] || '' 
                  });
                }}
                className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                模型选择
              </label>
              {editingProfile.provider === 'custom' ? (
                <input 
                  type="text"
                  value={editingProfile.model}
                  onChange={(e) => setEditingProfile({ ...editingProfile, model: e.target.value })}
                  placeholder="例如: llama-3-70b"
                  className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
                />
              ) : (
                <select 
                  value={editingProfile.model}
                  onChange={(e) => setEditingProfile({ ...editingProfile, model: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
                >
                  {providers.find(p => p.id === editingProfile.provider)?.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>

            {/* API Key */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                API 密钥 (API Key)
              </label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"}
                  value={editingProfile.apiKey}
                  onChange={(e) => setEditingProfile({ ...editingProfile, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full pl-4 pr-12 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-mono"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant opacity-60 italic">
                您的 API Key 将仅保存在本地浏览器缓存中。
              </p>
            </div>

            {/* Base URL (for custom) */}
            {(editingProfile.provider === 'custom' || editingProfile.provider === 'openai') && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                  自定义基础路径 (Base URL)
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <input 
                    type="text"
                    value={editingProfile.baseUrl}
                    onChange={(e) => setEditingProfile({ ...editingProfile, baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Temperature */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block flex justify-between">
                <span>采样温度 (Temperature): {editingProfile.temperature}</span>
                <span className="text-[10px] lowercase text-primary italic">0.0 (精确) - 2.0 (离散)</span>
              </label>
              <input 
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={editingProfile.temperature}
                onChange={(e) => setEditingProfile({ ...editingProfile, temperature: parseFloat(e.target.value) })}
                className="w-full h-2 bg-surface-container-low rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[10px] text-on-surface-variant opacity-60 italic leading-relaxed">
                控制输出的随机性。部分模型（如 O1）可能要求固定为 1.0。
              </p>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button 
            onClick={() => {
              setEditingProfile({ ...DEFAULT_SETTINGS });
              setProfiles([DEFAULT_SETTINGS]);
              setActiveProfileId('default');
              localStorage.removeItem('llm_profiles');
              localStorage.removeItem('active_llm_profile_id');
            }}
            className="px-6 py-3 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            重置默认
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "px-10 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2",
              saveStatus === 'success' ? "bg-green-100 text-green-700" : "bg-primary text-white hover:opacity-90"
            )}
          >
            {isSaving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? '正在保存...' : saveStatus === 'success' ? '保存成功' : '部署更改'}
          </button>
        </div>

        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-secondary/10 text-secondary rounded-xl text-sm font-medium">
            <AlertCircle size={18} />
            保存失败，请检查输入项。
          </div>
        )}
      </div>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/20"
            >
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">新配置方案</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                    方案名称
                  </label>
                  <input 
                    type="text"
                    value={newProfileData.name}
                    onChange={(e) => setNewProfileData({ ...newProfileData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
                    placeholder="例如: 研究助手"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                      服务商
                    </label>
                    <select 
                      value={newProfileData.provider}
                      onChange={(e) => {
                        const provider = e.target.value;
                        const models = providers.find(p => p.id === provider)?.models || [];
                        setNewProfileData({ 
                          ...newProfileData, 
                          provider, 
                          model: models[0] || '' 
                        });
                      }}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none transition-colors"
                    >
                      {providers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                      模型选择
                    </label>
                    {newProfileData.provider === 'custom' ? (
                      <input 
                        type="text"
                        value={newProfileData.model}
                        onChange={(e) => setNewProfileData({ ...newProfileData, model: e.target.value })}
                        placeholder="例如: llama-3"
                        className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
                      />
                    ) : (
                      <select 
                        value={newProfileData.model}
                        onChange={(e) => setNewProfileData({ ...newProfileData, model: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
                      >
                        {providers.find(p => p.id === newProfileData.provider)?.models.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">
                    API 密钥
                  </label>
                  <input 
                    type="password"
                    value={newProfileData.apiKey}
                    onChange={(e) => setNewProfileData({ ...newProfileData, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block flex justify-between">
                    <span>采样温度: {newProfileData.temperature}</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={newProfileData.temperature}
                    onChange={(e) => setNewProfileData({ ...newProfileData, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-surface-container-low rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="p-6 bg-surface-container-low flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmAddProfile}
                  className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all"
                >
                  创建配置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
