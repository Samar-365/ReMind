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
    <div className="cyber-panel" style={{ padding: 0 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between"
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div className="flex items-center gap-3">
          <Eye size={18} style={{ color: 'var(--neon-cyan)' }} />
          <div>
            <h3 className="cyber-label" style={{ fontSize: '0.85rem' }}>
              CONTEXT_INSPECTOR // SCRUBBED_DIFFS_&_TERMINAL_LOGS
            </h3>
            <p className="text-xs text-muted">
              Inspect sanitized AST changes and bash/powershell session telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="cyber-badge badge-emerald">
            <ShieldCheck size={12} />
            SCRUBBED // 100%
          </span>
          {isOpen ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      {isOpen && (
        <div style={{ borderTop: '1px solid var(--border-dim)', padding: '1.25rem', background: '#04070b' }}>
          {/* Sub Navigation */}
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('diff')}
              className={activeTab === 'diff' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <FileDiff size={13} />
              <span>GIT_DIFF ({git.diff_stat ? 'ACTIVE' : 'CLEAN'})</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={activeTab === 'terminal' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Terminal size={13} />
              <span>TERMINAL ({terminal.commands?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('browser')}
              className={activeTab === 'browser' ? 'btn-cyber-primary' : 'btn-cyber-secondary'}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Globe size={13} />
              <span>BROWSER_TABS ({browser.tabs?.length || 0})</span>
            </button>
          </div>

          {/* Tab Panes */}
          {activeTab === 'diff' && (
            <div>
              <div className="text-xs font-mono text-muted" style={{ marginBottom: '0.5rem' }}>
                {git.diff_stat ? `> ${git.diff_stat}` : "> Working tree clean. No uncommitted modifications detected."}
              </div>
              {git.diff_content ? (
                <pre style={{ padding: '1rem', background: '#020407', border: '1px solid var(--border-dim)', fontSize: '0.75rem', color: 'var(--neon-cyan)', overflowX: 'auto', maxHeight: '18rem' }}>
                  {git.diff_content}
                </pre>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', border: '1px dashed var(--border-dim)' }}>
                  NO PENDING CODE MODIFICATIONS FOUND
                </div>
              )}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div>
              {terminal.commands && terminal.commands.length > 0 ? (
                <div style={{ padding: '1rem', background: '#020407', border: '1px solid var(--border-dim)', fontSize: '0.75rem', color: 'var(--text-main)', maxHeight: '18rem', overflowY: 'auto' }}>
                  {terminal.commands.map((cmd, i) => (
                    <div key={i} className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--neon-cyan)' }}>&gt;</span>
                      <code>{cmd}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', border: '1px dashed var(--border-dim)' }}>
                  NO TERMINAL SESSION LOGS DETECTED
                </div>
              )}
            </div>
          )}

          {activeTab === 'browser' && (
            <div>
              {browser.tabs && browser.tabs.length > 0 ? (
                <div className="space-y-2" style={{ maxHeight: '18rem', overflowY: 'auto' }}>
                  {browser.tabs.map((tab, i) => (
                    <div key={i} style={{ padding: '0.6rem 0.8rem', background: '#020407', border: '1px solid var(--border-dim)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-main)' }}>{tab.title}</p>
                      <p className="text-xs" style={{ color: 'var(--neon-cyan)' }}>{tab.url}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', border: '1px dashed var(--border-dim)' }}>
                  NO BROWSER RESEARCH TABS LOGGED
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
