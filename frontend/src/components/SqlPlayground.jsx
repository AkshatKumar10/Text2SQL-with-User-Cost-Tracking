import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Play,
  Terminal,
  Sparkles,
  AlertCircle,
  Database,
  Rows3,
  Copy,
  Check,
  RotateCcw,
  Table2,
  Info,
} from 'lucide-react';
import { DataTable } from './DataTable';

const DEFAULT_QUERY = `SELECT *
FROM orders
JOIN customers
  ON orders.customer_id = customers.customer_id
LIMIT 10;`;

const sampleSnippets = [
  {
    label: 'Top Customers',
    description: 'Highest spending customers',
    sql: `SELECT
  c.customer_id,
  c.first_name,
  c.last_name,
  SUM(o.total_amount) AS total_spent
FROM customers c
JOIN orders o
  ON c.customer_id = o.customer_id
GROUP BY c.customer_id
ORDER BY total_spent DESC;`,
  },
  {
    label: 'Low Inventory',
    description: 'Products running low',
    sql: `SELECT
  product_name,
  category,
  price,
  stock_quantity
FROM products
WHERE stock_quantity < 50
ORDER BY stock_quantity ASC;`,
  },
  {
    label: 'Order Statuses',
    description: 'Orders grouped by status',
    sql: `SELECT
  status,
  COUNT(*) AS count,
  ROUND(SUM(total_amount), 2) AS total_value
FROM orders
GROUP BY status;`,
  },
  {
    label: 'Items Sold',
    description: 'Best-selling products',
    sql: `SELECT
  p.product_name,
  SUM(oi.quantity) AS total_units
FROM order_items oi
JOIN products p
  ON oi.product_id = p.product_id
GROUP BY p.product_name
ORDER BY total_units DESC;`,
  },
];


export function SqlPlayground({ defaultQuery = DEFAULT_QUERY }) {
  const [sql, setSql] = useState(defaultQuery);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [tables, setTables] = useState([]);
  const [loadingSchema, setLoadingSchema] = useState(true);

  const [copied, setCopied] = useState(false);

  const wrapperRef = useRef(null);
  const copyTimer = useRef(null);

  const loadSchema = async () => {
    try {
      setLoadingSchema(true);
      const response = await axios.get('/api/schema');
      setTables(response.data?.tables || []);
    } catch (err) {
      console.error('Failed to load schema:', err);
      setTables([]);
    } finally {
      setLoadingSchema(false);
    }
  };

  useEffect(() => {
    loadSchema();
    return () => clearTimeout(copyTimer.current);
  }, []);

  const handleExecute = async () => {
    if (executing) return;
    const query = sql.trim();
    if (!query) {
      setError('Please enter a SQL query before executing.');
      return;
    }

    setExecuting(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/execute-sql', { sql: query });
      setResult(data);
    } catch (err) {
      setError(err.message || 'SQL execution failed.');
      setResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const handleReset = () => {
    setSql(defaultQuery);
    setError(null);
    setResult(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
    } catch {
      document.execCommand('copy');
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  const syncGutter = (e) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translateY(${-e.target.scrollTop}px)`;
    }
  };

  const lineNumbers = sql.split('\n');
  const records = result?.records || [];
  const totalRecords = result?.row_count ?? records.length;
  const truncated = result && totalRecords > records.length;

  return (
    <main className="w-full relative text-slate-100">
      <div className="absolute top-10 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 pb-16">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 p-3.5 text-blue-400 shadow-lg shadow-blue-500/10">
              <Terminal className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SQL Console</h1>
              <p className="mt-1 text-sm text-slate-400">
                Write and run your own queries against the database and see the results instantly
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                  Available Tables
                </div>
              </div>
            </div>

            <button
              onClick={loadSchema}
              disabled={loadingSchema}
              className="self-start sm:self-auto flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 transition disabled:cursor-not-allowed"
            >
              <RotateCcw className={`w-3 h-3 ${loadingSchema ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingSchema ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin" />
              Loading database schema...
            </div>
          ) : tables.length === 0 ? (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/15">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs text-slate-400">
                No application tables are currently available. Upload a dataset or initialize the database first.
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tables.map((table) => (
                <div
                  key={table.name}
                  title={`${table.total_rows ?? 0} rows`}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2"
                >
                  <Table2 className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-mono text-xs text-slate-300">
                    {table.name}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {(table.total_rows ?? 0).toLocaleString()} rows
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Query Examples</span>
            <span className="text-[11px] text-slate-600">for the sample database</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {sampleSnippets.map((snippet) => (
              <button
                key={snippet.label}
                onClick={() => {
                  setSql(snippet.sql);
                  setError(null);
                }}
                className="group cursor-pointer text-left p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 hover:bg-blue-500/[0.04] transition-all"
              >
                <div className="text-xs font-semibold text-slate-300 group-hover:text-white">{snippet.label}</div>
                <div className="text-[11px] text-slate-600 mt-1">{snippet.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
          <div className="h-14 px-4 sm:px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Terminal className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <span className="font-mono text-xs font-semibold text-slate-200">query.sql</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="hidden sm:flex cursor-pointer items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-800 bg-slate-950/50 text-[11px] text-slate-500 hover:text-white hover:border-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="hidden sm:flex cursor-pointer items-center gap-1.5 px-2.5 py-2 rounded-lg border border-slate-800 bg-slate-950/50 text-[11px] text-slate-500 hover:text-white hover:border-slate-700 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>

              <button
                onClick={handleExecute}
                disabled={executing}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${executing ? 'animate-pulse' : ''}`} />
                {executing ? 'Executing...' : 'Run Query'}
              </button>
            </div>
          </div>

          <div className="relative bg-[#080a0d]">
            <div
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-12 sm:w-14 border-r border-slate-800/60 bg-slate-950/50 pointer-events-none select-none overflow-hidden"
            >
              <div ref={wrapperRef} className="pt-4 text-right pr-3 text-[11px] font-mono leading-7 text-slate-700">
                {lineNumbers.map((_, i) => (
                  <div key={i} className="h-7">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <textarea
              value={sql}
              onChange={(e) => {
                setSql(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              onScroll={syncGutter}
              wrap="off"
              rows={10}
              spellCheck={false}
              aria-label="SQL query"
              placeholder={`Write your SQL query here...
SELECT *
FROM customers
LIMIT 10;`}
              className="w-full min-h-[230px] sm:min-h-[270px] pl-16 sm:pl-[4.5rem] pr-5 py-4 bg-transparent text-slate-200 font-mono text-[12px] sm:text-[13px] leading-7 whitespace-pre overflow-auto focus:outline-none resize-none placeholder:text-slate-700 selection:bg-indigo-500/30"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/[0.045] shadow-lg">
            <div className="flex items-start gap-3 p-4">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-rose-300 mb-1">Query execution failed</div>
                <div className="text-xs font-mono text-slate-400 break-words leading-relaxed">{error}</div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className={`space-y-4 transition-opacity ${executing ? 'opacity-50' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Execution Result
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/15 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Success
                </span>
              </div>

              {truncated && (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-3.5 py-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <p className="text-xs leading-5 text-amber-200/90">
                    The query matched {totalRecords.toLocaleString()} rows, but only the first{' '}
                    {records.length.toLocaleString()} are shown. Add a LIMIT or filter to narrow it down.
                  </p>
                </div>
              )}
            </div>

            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/40 py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                  <Rows3 className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-sm font-medium text-slate-300">Query executed successfully</div>
                <div className="text-xs text-slate-500 mt-1">The query returned no rows.</div>
              </div>
            ) : (
              <DataTable data={records} columns={result.columns || []} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}