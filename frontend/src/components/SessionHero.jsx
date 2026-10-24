import React from 'react';
import { 
  GitBranch, 
  Terminal, 
  Globe, 
  Cpu, 
  Activity, 
  Sparkles, 
  Loader2, 
  ShieldCheck,
  Radio
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
    <div className="cyber-panel">
      <div className="flex flex-col lg-flex-row justify-between items-start gap-6">
        <div>
          {/* Status Badges */}
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <span className="cyber-badge badge-emerald">
              <Radio size={12} className="animate-pulse" />
              DAEMON // ONLINE
            </span>
            <span className="cyber-badge badge-dim">
              <ShieldCheck size={12} style={{ color: 'var(--neon-cyan)' }} />
              AIRGAP_SHIELD // LOCAL_GEMMA
            </span>
            <span className="cyber-badge badge-cyan">
              TELEMETRY_PORT // 8001
            </span>
          </div>

          {/* Repo Name */}
          <h1 className="cyber-title flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
            <Cpu size={24} style={{ color: 'var(--neon-cyan)' }} />
            <span>SYS_REPO: {git.repo_name ? git.repo_name.toUpperCase() : "ROOT_WORKSPACE"}</span>
          </h1>

          {/* Metrics bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ marginTop: '0.75rem' }}>
            <div className="flex items-center gap-1.5 cyber-badge badge-dim">
              <GitBranch size={13} style={{ color: 'var(--neon-cyan)' }} />
              <span style={{ color: '#fff' }}>BRANCH: {git.branch || 'main'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="status-pill pill-staged">
                +{stagedCount} STAGED
              </span>
              <span className="status-pill pill-modified">
                ~{unstagedCount} MODIFIED
              </span>
              <span className="status-pill pill-untracked">
                ?{untrackedCount} UNTRACKED
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted">
              <Terminal size={13} />
              <span>LOGS: {context?.terminal?.commands?.length || 0} CMDS</span>
            </div>

            <div className="flex items-center gap-1.5 text-muted">
              <Globe size={13} />
              <span>TABS: {context?.browser?.tabs?.length || 0} REFS</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-start gap-2" style={{ minWidth: '280px' }}>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn-cyber-primary"
            style={{ width: '100%' }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{stepStage || "PROCESSING..."}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>EXECUTE // HANDOFF_SYNTHESIS</span>
              </>
            )}
          </button>

          {isGenerating && (
            <p className="text-xs animate-pulse" style={{ color: 'var(--neon-cyan)', textAlign: 'center', width: '100%' }}>
              [INFERENCE RUNNING // PARSING AST DIFFS]
            </p>
          )}
        </div>
      </div>

      {/* Developer Context Injector */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-dim)' }}>
        <div className="flex items-center gap-2 cyber-label" style={{ marginBottom: '0.5rem' }}>
          <Activity size={13} />
          <span>INJECT_SESSION_NOTES // OPTIONAL</span>
        </div>
        <input
          type="text"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="> specify focus area, e.g. 'Investigating race condition in auth token refresh'"
          className="cyber-input"
        />
      </div>
    </div>
  );
}
