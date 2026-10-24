import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square,
  AlertTriangle, 
  Terminal, 
  FileCode, 
  Bookmark, 
  Copy, 
  Check, 
  Clock, 
  Zap,
  Target
} from 'lucide-react';

export default function ResumptionCard({ noteRecord, onToggleFavorite }) {
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState({});

  if (!noteRecord || !noteRecord.note) {
    return null;
  }

  const { note, created_at, model_used, is_favorite, repo_name } = noteRecord;

  const toggleCheck = (idx) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = () => {
    const md = `
# Tomorrow-Me Handoff: ${repo_name} (${new Date(created_at).toLocaleDateString()})

## Current Task
${note.current_task}

## Immediate Next Steps
${(note.next_steps || []).map(s => `- [ ] ${s}`).join('\n')}

## Blockers & Problem Hypotheses
${(note.blockers || []).map(b => `- ${b}`).join('\n')}
${(note.likely_problem_areas || []).map(p => `- Hypothesis: ${p.hypothesis}\n  Evidence: ${p.cited_evidence}`).join('\n')}

## Key Files & Commands
- Files: ${(note.relevant_files || []).join(', ')}
- Commands: ${(note.relevant_commands || []).join(', ')}
`.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cyber-panel" style={{ borderLeftColor: 'var(--neon-emerald)', borderColor: 'rgba(5, 255, 161, 0.3)' }}>
      {/* Top Protocol Header */}
      <div className="flex justify-between items-start gap-4" style={{ paddingBottom: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dim)' }}>
        <div>
          <div className="flex items-center gap-2 cyber-label" style={{ color: 'var(--neon-emerald)', marginBottom: '0.35rem' }}>
            <Zap size={14} />
            <span>MISSION_BRIEF // RESUMPTION_PROTOCOL</span>
          </div>
          <h2 className="cyber-title" style={{ fontSize: '1.35rem', color: '#fff', textShadow: '0 0 10px rgba(5, 255, 161, 0.4)' }}>
            {note.current_task}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted" style={{ marginTop: '0.5rem' }}>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              TIMESTAMP: {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(created_at).toLocaleDateString()})
            </span>
            <span>//</span>
            <span style={{ color: 'var(--neon-cyan)' }}>
              MODEL: {model_used}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="btn-cyber-secondary"
            title="Export Markdown"
          >
            {copied ? <Check size={13} style={{ color: 'var(--neon-emerald)' }} /> : <Copy size={13} />}
            <span>{copied ? "COPIED_RAW" : "EXPORT_MD"}</span>
          </button>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(noteRecord.id, !is_favorite)}
              className="btn-cyber-icon"
              style={{ color: is_favorite ? 'var(--neon-amber)' : 'var(--text-dim)' }}
            >
              <Bookmark size={15} fill={is_favorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Sections Grid */}
      <div className="grid grid-cols-1 lg-grid-cols-12 gap-6">
        
        {/* Left Column: Priority Action Sequence & Anomalies */}
        <div className="lg-col-span-7 space-y-6">
          
          {/* Action Sequence */}
          <div className="cyber-subpanel" style={{ borderLeft: '2px solid var(--neon-cyan)' }}>
            <h3 className="cyber-label flex items-center gap-2" style={{ marginBottom: '1rem', color: 'var(--neon-cyan)' }}>
              <Target size={14} />
              <span>EXECUTION_CHECKLIST // PRIORITY_STEPS</span>
            </h3>
            <div className="space-y-2">
              {(note.next_steps || []).map((step, idx) => {
                const isDone = !!checkedSteps[idx];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="flex items-start gap-3"
                    style={{
                      background: isDone ? 'rgba(5, 255, 161, 0.05)' : '#04070b',
                      border: '1px solid ' + (isDone ? 'rgba(5, 255, 161, 0.3)' : 'var(--border-dim)'),
                      padding: '0.75rem',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ marginTop: '0.15rem', color: isDone ? 'var(--neon-emerald)' : 'var(--text-dim)' }}>
                      {isDone ? <CheckSquare size={16} /> : <Square size={16} />}
                    </div>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: isDone ? 'var(--text-dim)' : 'var(--text-main)',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blockers & Hypotheses */}
          <div className="cyber-subpanel" style={{ borderLeft: '2px solid var(--neon-crimson)' }}>
            <h3 className="cyber-label flex items-center gap-2" style={{ marginBottom: '1rem', color: 'var(--neon-crimson)' }}>
              <AlertTriangle size={14} />
              <span>ANOMALIES // BLOCKERS_&_HYPOTHESES</span>
            </h3>

            {note.blockers && note.blockers.length > 0 && (
              <div className="space-y-2" style={{ marginBottom: '1rem' }}>
                {note.blockers.map((b, i) => (
                  <div key={i} className="text-xs" style={{ background: 'rgba(255, 0, 85, 0.1)', border: '1px solid rgba(255, 0, 85, 0.4)', padding: '0.6rem 0.8rem', color: '#ff9ebb' }}>
                    [BLOCKER]: {b}
                  </div>
                ))}
              </div>
            )}

            {note.likely_problem_areas && note.likely_problem_areas.length > 0 ? (
              <div className="space-y-3">
                {note.likely_problem_areas.map((prob, i) => (
                  <div key={i} style={{ background: '#04070b', padding: '0.75rem', border: '1px solid var(--border-dim)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      &gt; HYPOTHESIS: {prob.hypothesis}
                    </p>
                    <div style={{ background: '#020407', padding: '0.5rem', border: '1px solid #132235', fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      <span style={{ color: 'var(--neon-cyan)' }}>CITED_EVIDENCE: </span>{prob.cited_evidence}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dim">&gt; NO CRITICAL IMPEDIMENTS RECORDED IN CURRENT SESSION</p>
            )}
          </div>
        </div>

        {/* Right Column: State Telemetry, Files & Commands */}
        <div className="lg-col-span-5 space-y-6">

          {/* Implementation State */}
          <div className="cyber-subpanel">
            <h3 className="cyber-label flex items-center gap-2" style={{ marginBottom: '0.75rem', color: 'var(--neon-emerald)' }}>
              <span>SYSTEM_STATE // STATUS_REPORT</span>
            </h3>
            <p className="text-sm text-muted" style={{ lineHeight: '1.5', marginBottom: '1rem' }}>
              {note.current_state}
            </p>

            {note.progress && note.progress.length > 0 && (
              <div>
                <h4 className="cyber-label text-xs" style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }}>LOGGED_CHANGES:</h4>
                <ul className="space-y-1" style={{ listStyle: 'none' }}>
                  {note.progress.map((p, i) => (
                    <li key={i} className="text-xs text-muted flex items-start gap-2">
                      <span style={{ color: 'var(--neon-emerald)' }}>&gt;</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Active Files & Execution Commands */}
          <div className="cyber-subpanel">
            <h3 className="cyber-label flex items-center gap-2" style={{ marginBottom: '0.75rem', color: 'var(--neon-cyan)' }}>
              <FileCode size={14} />
              <span>ACTIVE_RESOURCES // CONTEXT_TRACES</span>
            </h3>

            {note.relevant_files && note.relevant_files.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <span className="text-xs text-dim block" style={{ marginBottom: '0.4rem' }}>RELEVANT_FILES:</span>
                <div className="flex flex-wrap gap-1">
                  {note.relevant_files.map((file, i) => (
                    <span key={i} className="text-xs" style={{ background: '#04070b', padding: '0.2rem 0.5rem', border: '1px solid var(--border-dim)', color: 'var(--neon-cyan)' }}>
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {note.relevant_commands && note.relevant_commands.length > 0 && (
              <div>
                <span className="text-xs text-dim block" style={{ marginBottom: '0.4rem' }}>RESUME_CLI_COMMANDS:</span>
                <div className="space-y-1">
                  {note.relevant_commands.map((cmd, i) => (
                    <div key={i} className="flex items-center justify-between text-xs" style={{ background: '#04070b', padding: '0.4rem 0.6rem', border: '1px solid var(--border-dim)', color: 'var(--neon-emerald)' }}>
                      <code>$ {cmd}</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(cmd)}
                        className="btn-cyber-icon"
                        style={{ padding: '0.2rem', border: 'none', background: 'transparent' }}
                        title="Copy command"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
