'use client';

import { useState, useEffect } from 'react';
import SearchForm from '@/components/SearchForm';
import { SearchConfig } from '@/components/SearchConfig';
import { Settings } from '@/components/Settings';
import ReportViewer from '@/components/ReportViewer';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { 
  History, 
  LayoutDashboard, 
  TrendingUp, 
  Search, 
  ChevronRight, 
  Activity,
  Cpu,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5001/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSearch = async (payload: any) => {
    setIsLoading(true);
    setReport('');
    
    const apifyToken = localStorage.getItem('apify_api_token') || '';
    const tavilyApiKey = localStorage.getItem('tavily_api_key') || '';
    const defaultSource = localStorage.getItem('default_data_source') || 'tavily';
    const source = payload.source || defaultSource;
    
    const profiles = JSON.parse(localStorage.getItem('llm_profiles') || '[]');
    const activeId = localStorage.getItem('active_llm_profile_id');
    const activeProfile = profiles.find((p: any) => p.id === activeId) || profiles[0];

    try {
      const res = await fetch('http://127.0.0.1:5001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source,
          apifyToken,
          tavilyApiKey,
          llmConfig: activeProfile
        }),
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        setSelectedReportId(null); // Clear selected if it was from history
        setActiveTab('reports');
      }
      fetchHistory();
    } catch (error) {
      console.error('Analysis failed', error);
      alert('分析失败，请检查后端是否启动及 API 配置。');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReport = async (searchId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/insight/${searchId}`);
      const data = await res.json();
      setReport(data.report);
      setSelectedReportId(searchId);
      setActiveTab('reports');
    } catch (error) {
      console.error('Failed to load report', error);
    }
  };

  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Hero Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2 font-headline">欢迎回来，Ethan</h2>
        <p className="text-on-surface-variant max-w-2xl">今天想从 Reddit 中挖掘哪些潜在的产品需求和用户痛点？</p>
      </div>

      {/* Bento Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">分析趋势度</span>
            <TrendingUp size={20} className="text-tertiary-container" />
          </div>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-6xl font-extrabold font-headline text-primary tracking-tighter">82.1%</span>
            <span className="text-primary font-bold text-sm bg-tertiary-fixed px-2 py-1 rounded">较上周 +5.4%</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-on-surface-variant">
              <span>高价值痛点</span>
              <span>17.9% 低相关讨论</span>
            </div>
            <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden flex">
              <div className="h-full bg-primary" style={{ width: '82.1%' }}></div>
              <div className="h-full bg-secondary" style={{ width: '17.9%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase block mb-2">累计搜索</span>
            <span className="text-4xl font-extrabold font-headline text-primary">{history.length}</span>
          </div>
          <div className="h-16 w-full flex items-end gap-1 overflow-hidden mt-4">
            {[40, 60, 30, 80, 50, 90, 100].map((h, i) => (
              <div 
                key={i} 
                className={cn("w-full rounded-t-sm", i === 6 ? "bg-primary" : "bg-primary/20")} 
                style={{ height: `${h}%` }} 
              />
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase block mb-2">痛点识别</span>
            <span className="text-4xl font-extrabold font-headline text-primary">124</span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-xs text-on-surface-variant font-medium">58 关键痛点</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs text-on-surface-variant font-medium">66 功能建议</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-headline text-primary">最近分析历史</h3>
            <button 
              onClick={() => setActiveTab('reports')}
              className="text-sm font-bold text-primary hover:underline"
            >
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                onClick={() => loadReport(item.id)}
                className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low transition-colors rounded-xl border border-outline-variant/5 group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Activity size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary truncate max-w-[200px]">
                      {item.scenario === 'B' ? `r/${item.subreddit}` : item.query}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest mt-0.5">
                      {new Date(item.created_at).toLocaleDateString()} • {item.scenario === 'A' ? '全站' : item.scenario === 'B' ? '版块' : '组合'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className={cn("badge", `badge-${item.status.toLowerCase()}`)}>
                    {item.status}
                  </span>
                  <ChevronRight size={20} className="text-outline-variant group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30">
                <p className="text-sm text-on-surface-variant italic">暂无记录，开启你的第一次需求挖掘吧</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold font-headline text-primary mb-8">系统动态</h3>
          <div className="bg-surface-container-low/50 rounded-xl p-6 border border-outline-variant/10">
            <div className="space-y-6">
              {[
                { title: '引擎更新', desc: 'LLM 语义分析模型已升级到最新版本。', time: '10 分钟前', color: 'bg-primary' },
                { title: 'API 连接', desc: 'Reddit API 响应速度目前处于最佳状态。', time: '1 小时前', color: 'bg-green-500' },
                { title: '安全提醒', desc: '检测到新的登录 IP，如非本人请及时检查。', time: '3 小时前', color: 'bg-secondary' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={cn("w-1 h-10 rounded-full flex-shrink-0", item.color)}></div>
                  <div>
                    <p className="text-sm font-bold text-primary">{item.title}</p>
                    <p className="text-xs text-on-surface-variant mb-1">{item.desc}</p>
                    <p className="text-[10px] font-medium text-on-surface-variant opacity-60">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-2.5 text-xs font-bold text-on-surface-variant border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-colors">
              清空通知
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSearches = () => (
    <SearchConfig onSearch={handleSearch} isLoading={isLoading} />
  );

  const renderReports = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-8"
    >
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-lg font-bold font-headline text-primary mb-4 flex items-center gap-2">
          <History size={18} />
          历史报告
        </h3>
        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => loadReport(item.id)}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer",
                selectedReportId === item.id 
                  ? "bg-primary text-white border-primary shadow-md" 
                  : "bg-surface-container-lowest border-outline-variant/10 text-on-surface hover:border-primary/50"
              )}
            >
              <p className="text-sm font-bold truncate">
                {item.scenario === 'B' ? `r/${item.subreddit}` : item.query}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-70")}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                {selectedReportId !== item.id && (
                  <span className={cn("badge", `badge-${item.status.toLowerCase()}`, "px-1.5 py-0.5")}>
                    {item.status[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-xs text-on-surface-variant italic p-4">暂无历史报告</p>
          )}
        </div>
      </div>

      <div className="lg:col-span-3">
        {report ? (
          <ReportViewer report={report} />
        ) : (
          <div className="h-full min-h-[400px] bg-surface-container-low/30 rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-primary/30 mb-4">
              <BarChart3 size={32} />
            </div>
            <h4 className="text-xl font-bold text-primary mb-2">未选择报告</h4>
            <p className="text-on-surface-variant max-w-xs mx-auto">请从左侧列表选择一份历史报告，或者前往“新搜索”页面生成新的分析报告。</p>
            <button 
              onClick={() => setActiveTab('searches')}
              className="mt-6 px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
            >
              去发起搜索
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'searches': return renderSearches();
      case 'reports': return renderReports();
      case 'settings': return <Settings />;
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="ml-64 min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 pt-24 px-8 pb-12 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {renderContent()}
            </div>
          </AnimatePresence>
        </main>
      </div>

      {/* Background decoration */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="fixed bottom-0 left-64 -z-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
    </div>
  );
}
