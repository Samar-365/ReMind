import React from 'react';
import { 
  Database, 
  Search, 
  Trash2, 
  Bookmark, 
  Calendar, 
  GitBranch, 
  ChevronRight 
} from 'lucide-react';

export default function HistoryList({ 
  history, 
  onSelectNote, 
  onDeleteNote, 
  onToggleFavorite, 
  searchQuery, 
  setSearchQuery,
  selectedId 
}) {
  return (
    <div className="cyber-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h3 className="cyber-title flex items-center gap-2" style={{ fontSize: '1.15rem' }}>
            <Database size={16} style={{ color: 'var(--neon-cyan)' }} />
            <span>SESSION_ARCHIVES // HANDOFF_LOGS</span>
          </h3>
          <p className="text-xs text-muted">
            SQLite persistence / local records telemetry
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER BY KEYWORD..."
            className="cyber-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.75rem', padding: '0.5rem 1rem 0.5rem 2.25rem' }}
          />
        </div>
      </div>

      {history && history.length > 0 ? (
        <div className="space-y-2">
          {history.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectNote(item.id)}
                className="flex items-center justify-between gap-4"
                style={{
                  padding: '0.85rem 1rem',
                  border: '1px solid ' + (isSelected ? 'var(--neon-cyan)' : 'var(--border-dim)'),
                  background: isSelected ? 'rgba(0, 243, 255, 0.08)' : '#070d14',
                  boxShadow: isSelected ? '0 0 12px rgba(0, 243, 255, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div className="flex items-start gap-3" style={{ minWidth: 0 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id, !item.is_favorite);
                    }}
                    className="btn-cyber-icon"
                    style={{ padding: '0.2rem', border: 'none', background: 'transparent', color: item.is_favorite ? 'var(--neon-amber)' : 'var(--text-dim)' }}
                  >
                    <Bookmark size={15} fill={item.is_favorite ? "currentColor" : "none"} />
                  </button>

                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.25rem' }}>
                      {item.current_task}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1" style={{ color: 'var(--neon-cyan)' }}>
                        <GitBranch size={11} />
                        {item.repo_name} ({item.branch || 'main'})
                      </span>
                      <span>//</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(item.id);
                    }}
                    className="btn-cyber-icon"
                    style={{ color: 'var(--text-dim)' }}
                    title="Delete Note"
                  >
                    <Trash2 size={13} />
                  </button>
                  <ChevronRight size={14} style={{ color: isSelected ? 'var(--neon-cyan)' : 'var(--text-dim)' }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-dim)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          &gt; NO PERSISTED SESSIONS RECORDED. RUN HANDOFF_SYNTHESIS TO GENERATE INITIAL LOG.
        </div>
      )}
    </div>
  );
}
