'use client';

import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { Download, Share2, Clipboard } from 'lucide-react';

interface ReportViewerProps {
  report: string;
}

export default function ReportViewer({ report }: ReportViewerProps) {
  if (!report) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden"
    >
      <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-gradient flex items-center justify-center text-white">
            <Share2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary font-headline">AI 分析报告</h2>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">基于 Reddit 实时数据的深度挖掘</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="复制到剪切板">
            <Clipboard size={18} />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="下载 PDF">
            <Download size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div className="prose prose-sm md:prose-base max-w-none">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      </div>
      
      <div className="px-8 py-4 bg-primary text-white/90 text-xs font-bold text-center tracking-tight">
        此报告由 Reddit Insight AI 引擎生成 • 仅供参考
      </div>
    </motion.div>
  );
}
