# Text2SQL with User Cost Tracking

An AI-powered **multi-agent Text-to-SQL and Business Intelligence platform** that converts natural language into verified SQLite queries, executes them safely, and generates dynamic visualizations with per-user cost tracking.

---

## ⚡ Features

* **🤖 AI Query Studio**: Natural language to SQL with automatic schema understanding & BI analysis.
* **🔄 Self-Healing Workflow**: **LangGraph** multi-agent loop with automatic SQL validation and up to 3 repair attempts.
* **📊 Robust Visualizations**: Programmatic profiling for **Bar, Line, Pie, Scatter, KPI, Table, and No-Results** views.
* **🗄️ Isolated Datasets**: Upload custom `.csv`, `.xlsx`, `.json` datasets isolated per user.
* **💻 SQL Console & Schema Explorer**: Direct SQL query execution & interactive schema inspection.
* **💰 Token & Cost Tracking**: Per-user tracking of tokens, estimated API costs, latency, and query history.
* **🔭 Observability**: Integrated **Langfuse** tracing for agent calls, retries, and token metrics.

---

## 🏗️ Multi-Agent Workflow

```text
User Question → Schema Analysis → SQL Generation → Validation
                                                      │
   ┌──────────────────────────────────────────────────┴──────────────────────────────────────────────────┐
(Valid)                                                                                              (Invalid)
   ↓                                                                                                     ↓
Execution → BI Data Profiling → Chart Normalization → Visualization                         Self-Repair Node (Up to 3 Retries)
```

---

## 📊 Supported Visualizations

| Chart Type | Best Used For |
| :--- | :--- |
| **Bar Chart** | Categorical comparisons (vertical columns & horizontal bar layouts) |
| **Line Chart** | Chronological trends or ordered numerical sequences |
| **Pie Chart** | Proportions of a whole (up to 6 slices + automatic "Other" grouping) |
| **Scatter Plot** | Dual numeric metric correlation analysis |
| **KPI Card** | Single key aggregate values (currency, percentage, units, compact notation) |
| **Table View** | High-cardinality, multi-dimensional, or text-heavy query results |
| **No-Results** | Clear empty state when 0 rows match criteria |

---

## 🛠️ Tech Stack

* **Frontend**: React + Vite, Tailwind CSS, Recharts, Lucide Icons
* **Backend**: Python, FastAPI, SQLite, Pandas, LangGraph, Groq API
* **Observability & Auth**: Langfuse, Google OAuth 2.0

---

## 🚀 Quickstart Guide

### 1. Setup Backend

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key

GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret

# Optional: Langfuse tracing
LANGFUSE_SECRET_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_HOST=https://cloud.langfuse.com
```

Run Backend:
```bash
uvicorn server:app --reload
```

---

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://127.0.0.1:8000
VITE_LANGFUSE_URL=https://us.cloud.langfuse.com
```

Run Frontend:
```bash
npm run dev
```
App will be running at `http://localhost:5173`.
