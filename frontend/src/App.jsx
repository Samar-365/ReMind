import React, { useState, useEffect } from 'react';
import {
  Terminal,
  RotateCw,
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';

import SessionHero from './components/SessionHero';
import ResumptionCard from './components/ResumptionCard';
import ContextInspector from './components/ContextInspector';
import HistoryList from './components/HistoryList';

import {
  fetchAggregatedContext,
  generateHandoffNote,
  fetchHandoffHistory,
  fetchHandoffDetail,
  updateHandoff,
  deleteHandoff,
  fetchAiStatus
} from './services/api';

export default function App() {
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiStatus, setAiStatus] = useState(null);

  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepStage, setStepStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initial load
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoadingContext(true);
    setErrorMessage('');
    try {
      const [ctx, hist, ai] = await Promise.all([
        fetchAggregatedContext(),
        fetchHandoffHistory(),
        fetchAiStatus().catch(() => ({ available: false }))
      ]);

      setContext(ctx);
      setHistory(hist);
      setAiStatus(ai);

      // Select latest note by default if available
      if (hist && hist.length > 0) {
        const latestDetail = await fetchHandoffDetail(hist[0].id);
        setSelectedNote(latestDetail);
      }
    } catch (err) {
      setErrorMessage(`TELEMETRY ERROR: ${err.message}`);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage('');
    setStepStage('SCRUBBING_CONTEXT_STREAM...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setStepStage('GEMMA2_LOCAL_INFERENCE...');

      const newRecord = await generateHandoffNote({
        user_notes: userNotes,
        include_git: true,
        include_terminal: true,
        include_browser: true
      });

      setStepStage('VALIDATING_SCHEMA_AST...');
      await new Promise(r => setTimeout(r, 400));

      setSelectedNote(newRecord);
      setUserNotes('');

      // Refresh list
      const updatedHistory = await fetchHandoffHistory();
      setHistory(updatedHistory);
    } catch (err) {
      setErrorMessage(`SYNTHESIS FAILED: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setStepStage('');
    }
  };

  const handleSelectNote = async (id) => {
    try {
      const detail = await fetchHandoffDetail(id);
      setSelectedNote(detail);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(`LOAD FAILED: ${err.message}`);
    }
  };

  const handleToggleFavorite = async (id, newStatus) => {
    try {
      await updateHandoff(id, { is_favorite: newStatus });
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(prev => ({ ...prev, is_favorite: newStatus }));
      }
      setHistory(prev => prev.map(h => h.id === id ? { ...h, is_favorite: newStatus } : h));
    } catch (err) {
      setErrorMessage(`BOOKMARK FAILED: ${err.message}`);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("CONFIRM_ACTION: Purge handoff log from SQLite?")) return;
    try {
      await deleteHandoff(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
      }
    } catch (err) {
      setErrorMessage(`PURGE FAILED: ${err.message}`);
    }
  };

  const filteredHistory = history.filter(item => {
    if (!searchQuery) return true;
    return item.current_task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.repo_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="app-container">
      {/* Cyber Header Navigation */}
      <header className="flex justify-between items-center" style={{ paddingBottom: '1.25rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-dim)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '38px', height: '38px', background: '#09131d', border: '1px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0, 243, 255, 0.4)' }}>
            <Terminal size={20} style={{ color: 'var(--neon-cyan)' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="cyber-title" style={{ fontSize: '1.2rem', margin: 0 }}>REMIND</h1>
            </div>
            <p className="text-xs text-muted" style={{ letterSpacing: '0.05em' }}>
              TOMORROW-ME DEVELOPER HANDOFF ENGINE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboard}
            className="btn-cyber-icon"
            title="Refresh Telemetry"
          >
            <RotateCw size={14} className={isLoadingContext ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Error telemetry alert */}
      {errorMessage && (
        <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', background: 'rgba(255, 0, 85, 0.15)', border: '1px solid var(--neon-crimson)', color: '#ffb3c6', fontSize: '0.8rem' }} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="btn-cyber-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}>
            ACKNOWLEDGE
          </button>
        </div>
      )}

      {/* Main Command & Telemetry Center */}
      <main>
        {/* Active Session Hero & Trigger */}
        <SessionHero
          context={context}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          stepStage={stepStage}
          userNotes={userNotes}
          setUserNotes={setUserNotes}
        />

        {/* Resumption Card (Tomorrow's Morning View) */}
        {selectedNote && (
          <ResumptionCard
            noteRecord={selectedNote}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Collapsible Context & Sanitization Inspector */}
        <ContextInspector context={context} />

        {/* History List */}
        <HistoryList
          history={filteredHistory}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDeleteNote}
          onToggleFavorite={handleToggleFavorite}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedId={selectedNote?.id}
        />
      </main>

      {/* Footer System Telemetry */}
      <footer className="flex justify-between items-center text-xs text-dim" style={{ marginTop: '3.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-dim)' }}>
        <p>// SYSTEM: PRIVACY_VERIFIED • AIRGAPPED_LOCAL_EXECUTION</p>
        <p className="font-mono" style={{ color: 'var(--neon-cyan)' }}>LOCAL_GEMMA_2 // ZERO_CLOUD_LEAK</p>
      </footer>
    </div>
  );
}
