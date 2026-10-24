import React from 'react';
import { 
  FolderArchive, 
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
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h3 className="section-label" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
            <FolderArchive size={18} style={{ color: 'var(--accent-blue)' }} />
            <span>Past Handoff Notes</span>
          </h3>
          <p className="text-xs text-muted">
            Saved local records stored securely on this computer
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or tasks..."
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem', padding: '0.45rem 0.75rem 0.45rem 2.25rem' }}
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
                  padding: '0.9rem 1.1rem',
                  borderRadius: '8px',
                  border: '1px solid ' + (isSelected ? 'var(--accent-blue)' : 'var(--border-light)'),
                  background: isSelected ? 'var(--accent-blue-light)' : '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 'var(--shadow-sm)',
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
                    style={{ padding: '0.2rem', border: 'none', background: 'transparent', color: item.is_favorite ? 'var(--accent-amber)' : 'var(--text-dim)' }}
                  >
                    <Bookmark size={16} fill={item.is_favorite ? "currentColor" : "none"} />
                  </button>

                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {item.current_task}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1 font-mono" style={{ color: 'var(--accent-blue)' }}>
                        <GitBranch size={12} />
                        {item.repo_name} ({item.branch || 'main'})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    title="Delete Note"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} style={{ color: isSelected ? 'var(--accent-blue)' : 'var(--text-dim)' }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '8px', border: '1px dashed var(--border-light)', color: 'var(--text-muted)', fontSize: '0.8125rem', background: '#FFFFFF' }}>
          No handoff notes created yet. Click "Generate Handoff Note" to start your first session brief.
        </div>
      )}
    </div>
  );
}
