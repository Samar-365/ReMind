import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Terminal, 
  Globe, 
  FileDiff,
  AppWindow 
} from 'lucide-react';

export default function ContextInspector({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('diff');

  if (!context) return null;

  const git = context?.git || {};
  const terminal = context?.terminal || {};
  const browser = context?.browser || {};
  const windows = context?.windows || {};

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
          <Eye size={18} style={{ color: 'var(--accent-blue)' }} />
          <div>
            <h3 className="section-label" style={{ fontSize: '0.875rem', marginBottom: '0.1rem', color: 'var(--text-primary)' }}>
              Context & Sanitization Inspector
            </h3>
            <p className="text-xs text-muted">
              Inspect git diffs, terminal history, and browser tabs before and after AI synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      {isOpen && (
        <div style={{ borderTop: '1px solid var(--border-light)', padding: '1.25rem', background: 'var(--bg-subtle)' }}>
          {/* Sub Navigation */}
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('diff')}
              className={activeTab === 'diff' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <FileDiff size={13} />
              <span>Git Diff ({git.diff_stat ? 'Active changes' : 'Clean'})</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={activeTab === 'terminal' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Terminal size={13} />
              <span>Terminal Commands ({terminal.commands?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('browser')}
              className={activeTab === 'browser' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Globe size={13} />
              <span>Reference Tabs ({browser.tabs?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('windows')}
              className={activeTab === 'windows' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <AppWindow size={13} />
              <span>Active Windows ({windows.windows?.length || 0})</span>
            </button>
          </div>

          {/* Tab Panes */}
          {activeTab === 'diff' && (
            <div>
              <div className="text-xs font-mono text-muted" style={{ marginBottom: '0.5rem' }}>
                {git.diff_stat ? git.diff_stat : "Working tree is clean. No uncommitted modifications."}
              </div>
              {git.diff_content ? (
                <pre style={{ padding: '1rem', background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-primary)', overflowX: 'auto', maxHeight: '18rem' }}>
                  {git.diff_content}
                </pre>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: '#FFFFFF', border: '1px dashed var(--border-light)', borderRadius: '6px' }}>
                  No active code changes detected in this branch.
                </div>
              )}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div>
              {terminal.commands && terminal.commands.length > 0 ? (
                <div style={{ padding: '1rem', background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.75rem', maxHeight: '18rem', overflowY: 'auto' }}>
                  {terminal.commands.map((cmd, i) => (
                    <div key={i} className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--accent-blue)' }}>$</span>
                      <code className="font-mono text-secondary">{cmd}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: '#FFFFFF', border: '1px dashed var(--border-light)', borderRadius: '6px' }}>
                  No recent terminal command history found.
                </div>
              )}
            </div>
          )}

          {activeTab === 'browser' && (
            <div>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Add Active Reference Tab:</p>
                <div className="flex gap-2">
                  <input
                    id="new-tab-title"
                    type="text"
                    placeholder="Page Title (e.g. FastAPI Documentation)"
                    className="form-input"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                  />
                  <input
                    id="new-tab-url"
                    type="text"
                    placeholder="https://..."
                    className="form-input"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                  />
                  <button
                    onClick={async () => {
                      const tInput = document.getElementById('new-tab-title');
                      const uInput = document.getElementById('new-tab-url');
                      if (uInput && uInput.value) {
                        await fetch('http://localhost:8001/api/context/browser/tabs', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify([{ title: tInput.value || uInput.value, url: uInput.value, selected: true }])
                        });
                        window.location.reload();
                      }
                    }}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    Add Tab
                  </button>
                </div>
              </div>

              {browser.tabs && browser.tabs.length > 0 ? (
                <div className="space-y-2" style={{ maxHeight: '18rem', overflowY: 'auto' }}>
                  {browser.tabs.map((tab, i) => (
                    <div key={i} style={{ padding: '0.6rem 0.8rem', background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tab.title}</p>
                      <a href={tab.url} target="_blank" rel="noreferrer" className="text-xs" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>{tab.url}</a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: '#FFFFFF', border: '1px dashed var(--border-light)', borderRadius: '6px' }}>
                  No reference tabs added yet. Use the inputs above to save reference links for tomorrow's brief.
                </div>
              )}
            </div>
          )}

          {activeTab === 'windows' && (
            <div>
              {windows.windows && windows.windows.length > 0 ? (
                <div className="space-y-2" style={{ maxHeight: '18rem', overflowY: 'auto' }}>
                  {windows.windows.map((win, i) => (
                    <div key={i} style={{ 
                      padding: '0.6rem 0.85rem', 
                      background: '#FFFFFF', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                            {win.app_name}
                          </span>
                          <span className="pill pill-default" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                            {win.category}
                          </span>
                          <span className="text-xs text-muted" style={{ fontSize: '0.65rem' }}>
                            PID {win.pid}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-secondary truncate" style={{ fontSize: '0.78rem', margin: 0 }}>
                          {win.title}
                        </p>
                      </div>
                      <span className="pill pill-green" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', flexShrink: 0 }}>
                        Scrubbed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: '#FFFFFF', border: '1px dashed var(--border-light)', borderRadius: '6px' }}>
                  No active desktop windows detected.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
