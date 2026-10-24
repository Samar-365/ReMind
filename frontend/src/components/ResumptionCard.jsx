import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ArrowRightCircle, 
  FileCode, 
  Bookmark, 
  Copy, 
  Check, 
  Clock, 
  Sparkles 
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
    <div className="glass-panel" style={{ borderColor: 'rgba(99, 102, 241, 0.4)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)' }}>
      {/* Header Bar */}
      <div className="flex justify-between items-start gap-4" style={{ paddingBottom: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: '#818CF8', marginBottom: '0.25rem' }}>
            <Sparkles size={16} />
            <span>Tomorrow's Resumption Brief</span>
          </div>
          <h2 className="section-title" style={{ fontSize: '1.35rem' }}>
            {note.current_task}
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted" style={{ marginTop: '0.5rem' }}>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {new Date(created_at).toLocaleString()}
            </span>
            <span>•</span>
            <span className="font-mono badge-slate" style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', color: '#A5B4FC' }}>
              {model_used}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="btn-secondary"
            title="Copy as Markdown"
          >
            {copied ? <Check size={14} style={{ color: '#34D399' }} /> : <Copy size={14} />}
            <span>{copied ? "Copied Markdown" : "Export Markdown"}</span>
          </button>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(noteRecord.id, !is_favorite)}
              className="btn-icon"
              style={{ color: is_favorite ? '#FBBF24' : '#94A3B8' }}
            >
              <Bookmark size={15} fill={is_favorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg-grid-cols-12 gap-6">
        
        {/* Left Column: Priority Next Steps & Blockers */}
        <div className="lg-col-span-7 space-y-6">
          
          {/* Section: Priority Next Steps */}
          <div className="sub-panel" style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <h3 className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: '#A5B4FC', marginBottom: '1rem' }}>
              <ArrowRightCircle size={15} style={{ color: '#818CF8' }} />
              <span>Priority Resumption Steps</span>
            </h3>
            <div className="space-y-2">
              {(note.next_steps || []).map((step, idx) => (
                <label 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
                  style={{
                    background: checkedSteps[idx] ? 'rgba(6, 78, 59, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid ' + (checkedSteps[idx] ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'),
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textDecoration: checkedSteps[idx] ? 'line-through' : 'none',
                    color: checkedSteps[idx] ? '#64748B' : '#F1F5F9'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedSteps[idx]}
                    onChange={() => toggleCheck(idx)}
                    style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                  />
                  <span className="text-sm" style={{ lineHeight: '1.4' }}>{step}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section: Blockers & Hypotheses */}
          <div className="sub-panel" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
            <h3 className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: '#FDA4AF', marginBottom: '1rem' }}>
              <AlertTriangle size={15} style={{ color: '#FB7185' }} />
              <span>Blockers & Problem Hypotheses</span>
            </h3>

            {note.blockers && note.blockers.length > 0 ? (
              <div className="space-y-2" style={{ marginBottom: '1rem' }}>
                {note.blockers.map((b, i) => (
                  <div key={i} className="text-xs" style={{ background: 'rgba(76, 5, 25, 0.3)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#FECDD3' }}>
                    {b}
                  </div>
                ))}
              </div>
            ) : null}

            {note.likely_problem_areas && note.likely_problem_areas.length > 0 ? (
              <div className="space-y-3">
                {note.likely_problem_areas.map((prob, i) => (
                  <div key={i} style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <p className="text-sm font-medium" style={{ color: '#F1F5F9', marginBottom: '0.35rem' }}>
                      💡 {prob.hypothesis}
                    </p>
                    <div className="text-xs font-mono" style={{ background: '#020617', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#94A3B8', wordBreak: 'break-all' }}>
                      <span style={{ color: '#818CF8' }}>Evidence: </span>{prob.cited_evidence}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dim" style={{ fontStyle: 'italic' }}>No critical roadblocks detected during this session.</p>
            )}
          </div>
        </div>

        {/* Right Column: Progress, Current State, Files & Commands */}
        <div className="lg-col-span-5 space-y-6">

          {/* Current State & Progress */}
          <div className="sub-panel">
            <h3 className="text-xs font-semibold uppercase flex items-center gap-2 text-muted" style={{ marginBottom: '0.75rem' }}>
              <CheckCircle size={15} style={{ color: '#34D399' }} />
              <span>Current Implementation State</span>
            </h3>
            <p className="text-sm text-muted" style={{ lineHeight: '1.5', marginBottom: '1rem' }}>
              {note.current_state}
            </p>

            {note.progress && note.progress.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-dim" style={{ marginBottom: '0.5rem' }}>Accomplished:</h4>
                <ul className="space-y-1" style={{ listStyle: 'none' }}>
                  {note.progress.map((p, i) => (
                    <li key={i} className="text-xs text-muted flex items-start gap-2">
                      <span style={{ color: '#34D399' }}>•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Relevant Files & Resume Commands */}
          <div className="sub-panel">
            <h3 className="text-xs font-semibold uppercase flex items-center gap-2 text-muted" style={{ marginBottom: '0.75rem' }}>
              <FileCode size={15} style={{ color: '#22D3EE' }} />
              <span>Resume Context</span>
            </h3>

            {note.relevant_files && note.relevant_files.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <span className="text-xs text-dim block" style={{ marginBottom: '0.4rem' }}>Active Files:</span>
                <div className="flex flex-wrap gap-1">
                  {note.relevant_files.map((file, i) => (
                    <span key={i} className="font-mono text-xs" style={{ background: '#1E293B', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#67E8F9', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {note.relevant_commands && note.relevant_commands.length > 0 && (
              <div>
                <span className="text-xs text-dim block" style={{ marginBottom: '0.4rem' }}>Resume Commands:</span>
                <div className="space-y-1">
                  {note.relevant_commands.map((cmd, i) => (
                    <div key={i} className="flex items-center justify-between font-mono text-xs" style={{ background: '#020617', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#A5B4FC' }}>
                      <code>{cmd}</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(cmd)}
                        className="btn-icon"
                        style={{ padding: '0.25rem', border: 'none', background: 'transparent' }}
                        title="Copy command"
                      >
                        <Copy size={13} />
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
