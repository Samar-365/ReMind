import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  ShieldCheck, 
  GitCommit, 
  Terminal, 
  Globe, 
  FileDiff 
} from 'lucide-react';

export default function ContextInspector({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('diff');

  if (!context) return null;

  const git = context?.git || {};
  const terminal = context?.terminal || {};
  const browser = context?.browser || {};

  return (
    <div className="glass-panel mb-8 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Raw Context & Sanitization Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Review scrubbed Git diffs, terminal session logs, and research tabs before/after AI processing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secrets Scrubbed
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-800 p-6 bg-slate-950/60">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800/80 pb-3">
            <button
              onClick={() => setActiveTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'diff' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileDiff className="w-3.5 h-3.5" />
              <span>Git Diff ({git.diff_stat ? 'Active' : 'Clean'})</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'terminal' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal ({terminal.commands?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('browser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'browser' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Browser Tabs ({browser.tabs?.length || 0})</span>
            </button>
          </div>

          {/* Tab Panes */}
          {activeTab === 'diff' && (
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2">
                {git.diff_stat || "Working tree is clean. No uncommitted diffs."}
              </div>
              {git.diff_content ? (
                <pre className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-72">
                  {git.diff_content}
                </pre>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No active code changes detected in this branch.
                </div>
              )}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div>
              {terminal.commands && terminal.commands.length > 0 ? (
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 max-h-72 overflow-y-auto">
                  {terminal.commands.map((cmd, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-indigo-400 select-none">$</span>
                      <span>{cmd}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No terminal command history captured.
                </div>
              )}
            </div>
          )}

          {activeTab === 'browser' && (
            <div>
              {browser.tabs && browser.tabs.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {browser.tabs.map((tab, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-slate-200">{tab.title}</p>
                        <p className="font-mono text-indigo-400 text-[11px] truncate max-w-lg">{tab.url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No browser research tabs submitted. Submit tabs via POST /api/context/browser/tabs.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
