import React from 'react';
import { 
  History, 
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
    <div className="glass-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h3 className="section-title flex items-center gap-2" style={{ fontSize: '1.15rem' }}>
            <History size={18} style={{ color: '#818CF8' }} />
            <span>Handoff History & Resumptions</span>
          </h3>
          <p className="text-xs text-muted">
            Saved local notes stored in SQLite
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or tasks..."
            className="search-input"
          />
        </div>
      </div>

      {history && history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectNote(item.id)}
                className="flex items-center justify-between gap-4"
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid ' + (isSelected ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.06)'),
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.6)',
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
                    className="btn-icon"
                    style={{ padding: '0.25rem', border: 'none', background: 'transparent', color: item.is_favorite ? '#FBBF24' : '#64748B' }}
                  >
                    <Bookmark size={16} fill={item.is_favorite ? "currentColor" : "none"} />
                  </button>

                  <div style={{ minWidth: 0 }}>
                    <h4 className="text-sm font-semibold" style={{ color: '#F8FAFC', marginBottom: '0.25rem' }}>
                      {item.current_task}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1 font-mono" style={{ color: '#A5B4FC' }}>
                        <GitBranch size={12} />
                        {item.repo_name} ({item.branch || 'main'})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
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
                    className="btn-icon"
                    style={{ color: '#94A3B8' }}
                    title="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                  <ChevronRight size={16} style={{ color: '#64748B' }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.1)', color: '#64748B', fontSize: '0.75rem' }}>
          No handoff notes found. Click "Generate Tomorrow-Me Handoff" to create your first session brief.
        </div>
      )}
    </div>
  );
}
