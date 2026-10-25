# Tomorrow-Me Handoff (ReMind)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Ollama](https://img.shields.io/badge/Ollama-Local_Inference-000000.svg?logo=ollama&logoColor=white)](https://ollama.ai)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Stop losing morning momentum.**  
> An intelligent, privacy-first developer daemon and dashboard that inspects your end-of-day Git diffs, terminal history, and research tabs to synthesize a grounded 7-section resumption brief with local Gemma 2 AI. Zero cloud leakage.

---

## Key Features

- **Local-First Privacy & Zero Cloud Leak**:
  - All inference runs directly on your hardware via local [Ollama](https://ollama.ai/) (`gemma2:2b` or `gemma2:9b`).
  - No source code, diffs, terminal history, or window titles leave your machine.
- **Built-in Secret Scrubber & Token Budgeter**:
  - Automatically identifies and masks API keys (OpenAI, AWS, GitHub PATs, private keys, database connection strings, and OAuth tokens) across diffs, terminal commands, browser tabs, and desktop window titles.
  - Intelligently truncates large diffs to avoid context window blowup while prioritizing high-signal application files over lockfiles.
- **Multi-Source Context Aggregation**:
  - **Multi-Project Git Discovery**: Automatically discovers **all git repositories** you worked on throughout the day, compiling today's commit logs, active branches, and uncommitted changes across every project.
  - **Active Desktop Windows**: Detects open application windows on the desktop (IDE files being edited, terminals, browsers, developer tools) to ground resumption context in the exact files you were looking at before signing off.
  - **Terminal History**: Recent command history from Windows PowerShell (`ConsoleHost_history.txt`) and Bash/Zsh (`~/.bash_history`).
  - **Automatic Browser Research Tabs**: Auto-detects your active research tabs from Chrome, Microsoft Edge, and Brave local history, plus optional manual tab inputs.
- **Grounded 7-Section Resumption Brief**:
  - Generates strictly typed, anti-hallucinatory resumption notes:
    1. **Current task**: Plain-English 1-line summary of where you left off.
    2. **Progress**: Specific modifications and accomplishments across touched projects.
    3. **Current state**: Working components vs. work-in-progress.
    4. **Roadblocks & Hypotheses**: Evidence-backed problem hypotheses paired with quoted evidence directly from diffs or terminal errors.
    5. **Recommended Next Steps**: Interactive, clickable checklist to cross off tasks as you finish them tomorrow morning.
    6. **Resume Context**:
       - **Modified Files**: Badges showing the exact files you were editing.
       - **Resume Commands**: Click-to-copy terminal commands (e.g. `$ npm run dev` or `$ uvicorn ...`) with 1-click clipboard copy.
    7. **Markdown Export**: One-click button to copy the entire brief as Markdown (ready for daily standup notes, Slack, or Jira).
- **End-of-Day Automation & Notifications**:
  - Background scheduler (`APScheduler`) automatically triggers at your configured end-of-day time.
  - Native Windows toast notifications alert you when tomorrow's resumption note is ready.
  - Graceful offline recovery checks if you missed a scheduled run while your device was sleeping or powered off.
- **Modern Responsive Dashboard (React + Vite)**:
  - Clean daylight UI with interactive checklist, multi-project activity cards, drawer-based Context & Sanitization Inspector, search/filter history, and one-click copy.

---

## System Architecture

```mermaid
graph TD
    subgraph Client["Presentation Layer (React + Vite)"]
        UI["Modern Dashboard"]
        TriggerBtn["Manual 'Generate Handoff'"]
        HistView["History & Resumption View"]
        DiffPreview["Context & Diff Inspector"]
    end

    subgraph Backend["Local Daemon (FastAPI)"]
        API["REST Endpoints (/api/handoff, /api/context)"]
        Scheduler["Background Scheduler (APScheduler)"]
        Orchestrator["Handoff Orchestrator"]
        Notifier["OS Toast Notifier"]
    end

    subgraph Collectors["Context Collection Layer"]
        GitColl["Multi-Project Git & Diff Collector"]
        TermColl["Terminal History (PS & Bash)"]
        BrowserColl["Auto Browser Tab Collector"]
        WindowColl["Desktop Active Windows Collector"]
    end

    subgraph Sanitizer["Sanitization & Preprocessing"]
        RegexScrubber["Secret & Credential Masker"]
        DiffSummarizer["Diff Token Budgeter & Truncator"]
    end

    subgraph AI["Local Inference Engine"]
        OllamaClient["Ollama Client (Gemma 2:2b / 9b)"]
        SchemaValidator["Pydantic Output Validator"]
    end

    subgraph Storage["Persistence Layer"]
        DB[("SQLite (handoffs.db)")]
    end

    UI --> API
    TriggerBtn --> API
    API --> Orchestrator
    Scheduler --> Orchestrator
    Orchestrator --> Notifier

    Orchestrator --> GitColl
    Orchestrator --> TermColl
    Orchestrator --> BrowserColl
    Orchestrator --> WindowColl

    GitColl --> RegexScrubber
    TermColl --> RegexScrubber
    BrowserColl --> RegexScrubber
    WindowColl --> RegexScrubber

    RegexScrubber --> DiffSummarizer
    DiffSummarizer --> OllamaClient
    OllamaClient --> SchemaValidator
    SchemaValidator --> DB
    DB --> API
```

---

## Getting Started

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.11)
- **Node.js 18+** & `npm`
- **[Ollama](https://ollama.ai/)** running locally:
  ```bash
  ollama run gemma2:2b
  ```

### 2. Backend Daemon Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env

# Start FastAPI Daemon on port 8001
python -m uvicorn app.main:app --reload --port 8001
```
- API Documentation (Swagger): `http://127.0.0.1:8001/docs`
- Health Check: `http://127.0.0.1:8001/health`

### 3. Frontend Dashboard Setup
```bash
# In a new terminal window
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser to view the dashboard.

---

## Configuration (`.env`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `HOST` | `127.0.0.1` | Local daemon bind host |
| `PORT` | `8001` | Local daemon port |
| `DEBUG` | `True` | Debug mode |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama inference API endpoint |
| `OLLAMA_MODEL` | `gemma2:2b` | Target Gemma model (`gemma2:2b`, `gemma2:9b`) |
| `DATABASE_URL` | `sqlite:///./handoffs.db` | SQLite persistence connection URI |
| `SCHEDULED_TIME` | `18:00` | Daily 24h cron time for end-of-day handoff |
| `AUTO_GENERATE_SCHEDULE` | `false` | Enable automated hands-free trigger |

---

## Testing

The repository includes comprehensive automated test suites for security, context collectors, database persistence, and AI prompt grounding:

```bash
cd backend
python -m pytest test_phase2.py test_phase4.py test_phase6.py test_security.py test_ai_benchmark.py
```
- `test_phase2.py`: Git status parsing, terminal history parsing, diff truncation, and secret scrubbing.
- `test_phase3.py`: Schema validation, prompt generation, and live Ollama inference.
- `test_phase4.py`: SQLModel SQLite persistence, database migrations, and CRUD endpoints.
- `test_phase6.py`: Scheduler execution, duplicate daily run prevention, and desktop toast notifications.
- `test_security.py`: 100% test vectors for AWS, GitHub, OpenAI keys, connection strings, and private keys.
- `test_ai_benchmark.py`: Context ground tests simulating broken test suites, mid-refactor states, and clean working trees.

---

## Docker & Render Deployment (Optional)

To containerize or deploy the shared dashboard on Render:

```bash
# Build Docker container
docker build -t remind-handoff .

# Run container
docker run -p 8000:8000 remind-handoff
```

The repository includes a ready-to-deploy [`render.yaml`](./render.yaml) blueprint defining both static frontend and backend services.

---

## License

MIT (c) [Samar-365](https://github.com/Samar-365)
