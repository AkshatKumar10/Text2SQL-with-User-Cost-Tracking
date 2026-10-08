# Text2SQL with User Cost Tracking

An AI-powered **multi-agent Text-to-SQL and Business Intelligence platform** that converts natural language questions into verified SQLite queries, executes them safely, analyzes the results, and generates interactive visualizations.

The system uses **LangGraph** to orchestrate multiple AI agents and includes **automatic SQL self-repair, user-level token and cost tracking, dataset ingestion, query history, and Langfuse observability**.

---

## 🚀 Features

### 🤖 AI Query 

* Ask questions about your database using natural language.
* Automatically understands the available database schema.
* Generates SQLite-compatible SQL queries.
* Validates and executes generated queries.
* Automatically repairs failed SQL queries.
* Supports up to 3 self-repair attempts.
* Analyzes query results using an AI data analyst.
* Recommends suitable visualizations.
* Displays results using charts, KPIs, and interactive tables.

### 🔄 Multi-Agent SQL Workflow

The application uses a cyclic **LangGraph multi-agent workflow**:

```text
User Question
      ↓
Schema Understanding
      ↓
SQL Generation
      ↓
SQL Validation
      ↓
Query Execution
      ↓
   ┌───────────────┐
   │ Query Failed? │
   └───────┬───────┘
           │ Yes
           ↓
      Self-Repair
           │
           └──────────────→ SQL Validation
           
           │ No
           ↓
       BI Analysis
           ↓
     Visualization
           ↓
      Final Result
```

The self-repair loop allows the system to detect SQL or schema-related errors and automatically generate a corrected query.

---

## 📊 Business Intelligence & Visualization

The AI Query can transform query results into meaningful business insights.

### Supported Visualizations

* Bar Charts
* Line Charts
* Pie Charts
* KPI Cards

The visualization recommendation is based on the structure of the returned data.

---

## 🗄️ Dataset Ingestion

Users can upload their own datasets and make them available for querying.

### Supported File Formats

```text
.csv
.xlsx
.xls
.json
```

After ingestion, the new tables become available to the AI Query and SQL Console.

---

## 🔍 Database Schema Explorer

The Schema Explorer provides an overview of the currently available database structure.

Users can inspect:

* Tables
* Column names
* Data types
* Available datasets

This helps users understand what data is available before writing a query.

---

## 💻 Direct SQL Console

The application provides a separate SQL Console for users who want to manually write and execute SQL queries.

The two modes have different purposes:

### AI Query

```text
Natural Language
       ↓
AI Agents
       ↓
SQL Generation
       ↓
Validation
       ↓
Execution
       ↓
Analysis
       ↓
Visualization
```

### SQL Console

```text
SQL Query
    ↓
Validation
    ↓
Execution
    ↓
Results
```

The SQL Console does not depend on predefined questions. Users can write their own SQL queries against the currently loaded database.

---

## 🕘 Session Query History

The application maintains a history of queries executed during the current session.

Users can review previously executed AI queries and their generated results without having to repeat the same questions.

---

## 💰 User Cost Tracking

A key feature of the project is **per-user AI usage and cost tracking**.

For every AI query, the backend records information such as:

```text
User ID
Email
Prompt Tokens
Completion Tokens
Total Tokens
Estimated Cost
Latency
Query Validity
Retry Attempts
```

This allows the application to track AI usage separately for each user instead of maintaining only a global usage count.

---

## 🔭 Langfuse Observability

The application supports **Langfuse** for LLM tracing and observability.

Langfuse can be used to monitor:

* Agent execution
* LLM calls
* Token usage
* Latency
* Query execution
* Self-repair attempts
* Application traces


---

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │     React Frontend  │
                         │  Vite + Tailwind CSS│
                         └──────────┬──────────┘
                                    │
                                    ↓
                         ┌─────────────────────┐
                         │     FastAPI API     │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
          ┌──────────────────┐             ┌─────────────────┐
          │ LangGraph Agents │             │   SQL Console   │
          └────────┬─────────┘             └────────┬────────┘
                   │                                │
                   ↓                                ↓
          ┌──────────────────┐             ┌─────────────────┐
          │ SQL Generation   │             │ SQL Validation  │
          │ & Self-Repair    │             │ & Execution     │
          └────────┬─────────┘             └────────┬────────┘
                   │                                │
                   └───────────────┬────────────────┘
                                   ↓
                          ┌──────────────────┐
                          │ SQLite Database  │
                          └────────┬─────────┘
                                   ↓
                          ┌──────────────────┐
                          │ BI Analysis      │
                          │ & Visualization  │
                          └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Recharts
* JavaScript 

### Backend

* Python
* FastAPI
* SQLite
* Pandas
* LangGraph
* Groq API

### Observability

* Langfuse

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/AkshatKumar10/Text2SQL-with-User-Cost-Tracking.git
cd Text2SQL-with-User-Cost-Tracking
```

---

## 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
.\venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
GROQ_API_KEY=your_groq_api_key_here

GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret

# Optional: Langfuse tracing
LANGFUSE_SECRET_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_HOST=https://cloud.langfuse.com
```

---

## 4. Start the Backend

From the `backend` directory:

```bash
uvicorn server:app --reload
```

The FastAPI backend will run at:

```text
http://127.0.0.1:8000
```

---

## 5. Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---



# 🧠 Example Workflow

A user can ask:

```text
Which products generated the highest revenue?
```

The system then:

```text
1. Receives the user's question
              ↓
2. Inspects the database schema
              ↓
3. Generates SQL
              ↓
4. Validates the SQL
              ↓
5. Executes the query
              ↓
6. Repairs the query if execution fails
              ↓
7. Analyzes the returned data
              ↓
8. Recommends a visualization
              ↓
9. Displays the results
              ↓
10. Records token usage and estimated cost
```

Users can also upload their own datasets and ask questions based on the uploaded tables.

---

# 🎯 Project Objective

The objective of **Text2SQL with User Cost Tracking** is to build an intelligent database analysis platform that combines:

* Natural Language → SQL generation
* Multi-agent orchestration
* Autonomous SQL self-repair
* Safe database execution
* Business intelligence analysis
* Interactive visualization
* Dataset ingestion
* User-level token tracking
* AI cost estimation
* LLM observability

The platform aims to make database analysis accessible to users who may not have extensive SQL knowledge while still providing a direct SQL interface for experienced users.
