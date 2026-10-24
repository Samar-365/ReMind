# Tomorrow-Me Handoff (ReMind)

An intelligent, privacy-first local CLI and dashboard that synthesizes your end-of-day development context into structured, actionable handoff notes for your next session.

---

## Architecture Overview

- **Backend (`/backend`)**: Python (FastAPI, SQLModel, APScheduler, Ollama Client)
- **Frontend (`/frontend`)**: React + Vite + Lucide Icons
- **Local AI Inference**: Powered by local Ollama instances (`gemma2:2b` / `gemma2:9b`)
- **Persistence**: SQLite (`handoffs.db`)

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.ai/) running locally (`ollama run gemma2:2b`)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard will run at `http://localhost:5173`.
