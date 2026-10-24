import React from 'react';
import { 
  GitBranch, 
  Terminal, 
  Globe, 
  FolderGit2, 
  FileEdit, 
  Sparkles, 
  Loader2, 
  ShieldCheck 
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
    <div className="glass-panel" style={{ borderColor: 'rgba(99, 102, 241, 0.25)' }}>
      <div className="flex flex-col lg-flex-row justify-between items-start gap-6" style={{ position: 'relative', zIndex: 10 }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <span className="badge badge-emerald">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', display: 'inline-block' }} className="animate-pulse"></span>
              Live Daemon Active
            </span>
            <span className="badge badge-slate">
              <ShieldCheck size={14} style={{ color: '#818CF8' }} />
              Privacy Shield On (Local Gemma)
            </span>
          </div>

          <h1 className="title-main flex items-center gap-3" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            <FolderGit2 size={28} style={{ color: '#818CF8' }} />
            {git.repo_name ? git.repo_name : "Workspace Ready"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted" style={{ marginTop: '0.75rem' }}>
            <div className="flex items-center gap-2 badge-slate" style={{ padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
              <GitBranch size={15} style={{ color: '#818CF8' }} />
              <span className="font-mono text-xs" style={{ color: '#F1F5F9' }}>{git.branch || 'main'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="status-chip chip-staged">
                {stagedCount} staged
              </span>
              <span className="status-chip chip-modified">
                {unstagedCount} modified
              </span>
              <span className="status-chip chip-untracked">
                {untrackedCount} untracked
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted">
              <Terminal size={14} />
              <span>{context?.terminal?.commands?.length || 0} terminal cmds</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted">
              <Globe size={14} />
              <span>{context?.browser?.tabs?.length || 0} research tabs</span>
            </div>
          </div>
        </div>

        {/* Action Button & Stepper */}
        <div className="flex flex-col items-start gap-2" style={{ minWidth: '260px' }}>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{stepStage || "Synthesizing Handoff..."}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Tomorrow-Me Handoff</span>
              </>
            )}
          </button>

          {isGenerating && (
            <p className="text-xs animate-pulse" style={{ color: '#A5B4FC', textAlign: 'center', width: '100%' }}>
              Analyzing diffs & drafting 7-section resumption note...
            </p>
          )}
        </div>
      </div>

      {/* Optional Note input */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted" style={{ marginBottom: '0.5rem' }}>
          <FileEdit size={14} style={{ color: '#818CF8' }} />
          <span>Session Context Note (Optional)</span>
        </div>
        <input
          type="text"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="e.g. 'Refactored auth middleware and stopped at token expiration test...'"
          className="text-input"
        />
      </div>
    </div>
  );
}
