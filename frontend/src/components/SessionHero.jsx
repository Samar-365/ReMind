import React from 'react';
import { 
  GitBranch, 
  Terminal, 
  Globe, 
  FolderGit2, 
  FileEdit, 
  Sparkles, 
  Loader2,
  Layers
} from 'lucide-react';

export default function SessionHero({ 
  context, 
  onGenerate, 
  isGenerating, 
  stepStage, 
  userNotes, 
  setUserNotes,
  onSelectWorkspace,
  selectedRepoPath
}) {
  const git = context?.git || {};
  const status = git?.status || {};
  const stagedCount = status.staged?.length || 0;
  const unstagedCount = status.unstaged?.length || 0;
  const untrackedCount = status.untracked?.length || 0;
  const workspaces = context?.workspaces || [];

  return (
    <div className="card">
      <div className="flex flex-col lg-flex-row justify-between items-start gap-6">
        <div style={{ width: '100%' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <span className="pill pill-green" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
              ● Ready
            </span>
            <span className="text-xs text-muted">
              Local AI Engine (No cloud transmission)
            </span>
          </div>

          {/* All Projects Worked On Before Signing Off */}
          {workspaces.length > 0 && (
            <div style={{ marginTop: '0.85rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <span className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Projects Worked On Today (Pre-Sign-Off Overview):
                </span>
                <span className="text-xs text-muted">
                  {workspaces.length} repositories detected
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {workspaces.map((ws, i) => {
                  const isActive = (selectedRepoPath || context?.repo_path)?.toLowerCase() === ws.path?.toLowerCase();
                  const hasChanges = (ws.modified > 0 || ws.staged > 0 || ws.untracked > 0);
                  return (
                    <button
                      key={i}
                      onClick={() => onSelectWorkspace && onSelectWorkspace(ws.path)}
                      className="btn-secondary"
                      style={{
                        background: isActive ? '#FFFFFF' : '#F1F5F9',
                        borderColor: isActive ? 'var(--accent-blue)' : 'var(--border-light)',
                        boxShadow: isActive ? '0 0 0 2px rgba(37, 99, 235, 0.15)' : 'none',
                        padding: '0.45rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.15s ease'
                      }}
                      title={ws.path}
                    >
                      <FolderGit2 size={15} style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {ws.name}
                          </span>
                          <span className="font-mono text-xs text-muted">({ws.branch})</span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      {hasChanges ? (
                        <span className="pill pill-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginLeft: '0.25rem' }}>
                          {ws.staged > 0 ? `${ws.staged} staged` : ''}
                          {ws.staged > 0 && ws.modified > 0 ? ', ' : ''}
                          {ws.modified > 0 ? `${ws.modified} uncommitted` : ''}
                          {ws.staged === 0 && ws.modified === 0 && ws.untracked > 0 ? `${ws.untracked} untracked` : ''}
                        </span>
                      ) : (
                        <span className="pill pill-default" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginLeft: '0.25rem', color: '#16A34A', background: '#DCFCE7' }}>
                          ✓ Clean
                        </span>
                      )}

                      {isActive && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)', marginLeft: '0.2rem' }}></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <h1 className="header-title flex items-center gap-2" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
            <FolderGit2 size={24} style={{ color: 'var(--accent-blue)' }} />
            <span>{git.repo_name ? git.repo_name : "Active Project Workspace"}</span>
          </h1>
          {context?.repo_path && (
            <p className="text-xs font-mono text-muted" style={{ marginTop: '0.15rem' }}>
              Path: {context.repo_path}
            </p>
          )}

          {/* Context Metrics Summary */}
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ marginTop: '0.75rem' }}>
            <div className="pill pill-default">
              <GitBranch size={13} style={{ color: 'var(--text-secondary)' }} />
              <span className="font-mono">{git.branch || 'main'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="pill pill-blue">
                {stagedCount} staged
              </span>
              <span className="pill pill-amber">
                {unstagedCount} modified
              </span>
              <span className="pill pill-default">
                {untrackedCount} untracked
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted">
              <Terminal size={13} />
              <span>{context?.terminal?.commands?.length || 0} recent commands</span>
            </div>

            <div className="flex items-center gap-1.5 text-muted">
              <Globe size={13} />
              <span>{context?.browser?.tabs?.length || 0} reference tabs</span>
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="flex flex-col items-start gap-2" style={{ minWidth: '240px' }}>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{stepStage || "Creating note..."}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Handoff Note</span>
              </>
            )}
          </button>

          {isGenerating && (
            <p className="text-xs text-muted" style={{ textAlign: 'center', width: '100%' }}>
              Inspecting diffs & drafting resume checklist...
            </p>
          )}
        </div>
      </div>

      {/* Developer Context Note Input */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
        <label className="section-label" style={{ marginBottom: '0.4rem' }}>
          <FileEdit size={14} style={{ color: 'var(--accent-blue)' }} />
          <span>Add session note or goal (Optional)</span>
        </label>
        <input
          type="text"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="e.g. Worked on payment webhook and stopped before handling timeouts"
          className="form-input"
        />
      </div>
    </div>
  );
}
