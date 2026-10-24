import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  ShieldCheck, 
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
    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between"
        style={{
          width: '100%',
          padding: '1.25rem 1.75rem',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div className="flex items-center gap-3">
          <Eye size={20} style={{ color: '#818CF8' }} />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
              Raw Context & Sanitization Inspector
            </h3>
            <p className="text-xs text-muted">
              Review scrubbed Git diffs, terminal session logs, and research tabs before/after AI processing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge badge-emerald">
            <ShieldCheck size={14} />
            Secrets Scrubbed
          </span>
          {isOpen ? <ChevronUp size={16} style={{ color: '#94A3B8' }} /> : <ChevronDown size={16} style={{ color: '#94A3B8' }} />}
        </div>
      </button>

      {isOpen && (
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem', background: 'rgba(2, 6, 23, 0.6)' }}>
          {/* Sub Navigation */}
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('diff')}
              className={activeTab === 'diff' ? 'btn-secondary' : 'btn-icon'}
              style={{
                color: activeTab === 'diff' ? '#FFFFFF' : '#94A3B8',
                borderColor: activeTab === 'diff' ? '#6366F1' : 'transparent',
                background: activeTab === 'diff' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FileDiff size={14} />
              <span>Git Diff ({git.diff_stat ? 'Active' : 'Clean'})</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              style={{
                color: activeTab === 'terminal' ? '#FFFFFF' : '#94A3B8',
                borderColor: activeTab === 'terminal' ? '#6366F1' : 'transparent',
                background: activeTab === 'terminal' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                borderRadius: '8px',
                border: '1px solid ' + (activeTab === 'terminal' ? '#6366F1' : 'transparent'),
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Terminal size={14} />
              <span>Terminal ({terminal.commands?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('browser')}
              style={{
                color: activeTab === 'browser' ? '#FFFFFF' : '#94A3B8',
                borderColor: activeTab === 'browser' ? '#6366F1' : 'transparent',
                background: activeTab === 'browser' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                borderRadius: '8px',
                border: '1px solid ' + (activeTab === 'browser' ? '#6366F1' : 'transparent'),
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Globe size={14} />
              <span>Browser Tabs ({browser.tabs?.length || 0})</span>
            </button>
          </div>

          {/* Tab Panes */}
          {activeTab === 'diff' && (
            <div>
              <div className="text-xs font-mono text-muted" style={{ marginBottom: '0.5rem' }}>
                {git.diff_stat || "Working tree is clean. No uncommitted diffs."}
              </div>
              {git.diff_content ? (
                <pre style={{ padding: '1rem', borderRadius: '8px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#CBD5E1', overflowX: 'auto', maxHeight: '18rem' }}>
                  {git.diff_content}
                </pre>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748B', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  No active code changes detected in this branch.
                </div>
              )}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div>
              {terminal.commands && terminal.commands.length > 0 ? (
                <div style={{ padding: '1rem', borderRadius: '8px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#CBD5E1', maxHeight: '18rem', overflowY: 'auto' }}>
                  {terminal.commands.map((cmd, i) => (
                    <div key={i} className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                      <span style={{ color: '#818CF8' }}>$</span>
                      <span className="font-mono">{cmd}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748B', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  No terminal command history captured.
                </div>
              )}
            </div>
          )}

          {activeTab === 'browser' && (
            <div>
              {browser.tabs && browser.tabs.length > 0 ? (
                <div className="space-y-2" style={{ maxHeight: '18rem', overflowY: 'auto' }}>
                  {browser.tabs.map((tab, i) => (
                    <div key={i} style={{ padding: '0.75rem', borderRadius: '8px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <p className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>{tab.title}</p>
                      <p className="font-mono text-xs" style={{ color: '#818CF8' }}>{tab.url}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748B', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
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
