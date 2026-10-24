import React from 'react';
import { 
  GitBranch, 
  Terminal, 
  Globe, 
  FolderGit2, 
  FileEdit, 
  Sparkles, 
  Loader2 
} from 'lucide-react';

export default function SessionHero({ 
  context, 
  onGenerate, 
  isGenerating, 
  stepStage, 
  userNotes, 
  setUserNotes 
}) {
  const git = context?.git || {};
  const status = git?.status || {};
  const stagedCount = status.staged?.length || 0;
  const unstagedCount = status.unstaged?.length || 0;
  const untrackedCount = status.untracked?.length || 0;

  return (
    <div className="card">
      <div className="flex flex-col lg-flex-row justify-between items-start gap-6">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <span className="pill pill-green" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
              ● Ready
            </span>
            <span className="text-xs text-muted">
              Local AI Engine (No cloud transmission)
            </span>
          </div>

          <h1 className="header-title flex items-center gap-2" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>
            <FolderGit2 size={24} style={{ color: 'var(--accent-blue)' }} />
            <span>{git.repo_name ? git.repo_name : "Active Project Workspace"}</span>
          </h1>

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
