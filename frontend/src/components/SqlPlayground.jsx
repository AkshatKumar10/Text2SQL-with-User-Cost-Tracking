import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axiosClient';
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
      const response = await api.get('/api/schema');
      setTables(response.data?.tables || []);
    } catch (err) {
      console.error(
        'Failed to load schema:',
        err?.response?.data?.detail || err?.message || err
      );
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
      const { data } = await api.post('/api/execute-sql', { sql: query });
      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'SQL execution failed.'
      );
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
    <main className="relative w-full min-w-0 overflow-x-hidden text-slate-100">
      <div className="pointer-events-none absolute right-0 top-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl sm:right-10 sm:h-72 sm:w-72 lg:right-20 lg:h-96 lg:w-96" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl sm:left-10 sm:h-72 sm:w-72 lg:h-96 lg:w-96" />

      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 space-y-5 px-3 pb-8 sm:space-y-6 sm:px-5 sm:pb-12 lg:space-y-8 lg:px-8 lg:pb-16 xl:px-10">
        <div className="flex min-w-0 flex-col justify-between gap-4 border-b border-slate-800/80 pb-5 sm:pb-6 md:flex-row md:items-center">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="shrink-0 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 p-2.5 text-blue-400 shadow-lg shadow-blue-500/10 sm:rounded-2xl sm:p-3.5">
              <Terminal className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                SQL Console
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm">
                Write and run your own queries against the database and see the results instantly
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-4 lg:p-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 shrink-0 text-blue-400" />
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                Available Tables
              </div>
            </div>

            <button
              onClick={loadSchema}
              disabled={loadingSchema}
              className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-2 text-[11px] text-slate-400 transition hover:border-slate-700 hover:text-white disabled:cursor-not-allowed sm:py-1.5"
            >
              <RotateCcw className={`h-3 w-3 ${loadingSchema ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingSchema ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-slate-700 border-t-blue-400" />
              Loading database schema...
            </div>
          ) : tables.length === 0 ? (
            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-3 sm:items-center sm:p-3.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400 sm:mt-0" />
              <div className="min-w-0 break-words text-xs leading-5 text-slate-400">
                No application tables are currently available. Upload a dataset or initialize the database first.
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tables.map((table) => (
                <div
                  key={table.name}
                  title={`${table.total_rows ?? 0} rows`}
                  className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-2 sm:px-3"
                >
                  <Table2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span className="break-all font-mono text-xs text-slate-300">
                    {table.name}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-600">
                    {(table.total_rows ?? 0).toLocaleString()} rows
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Query Examples
            </span>
            <span className="text-[11px] text-slate-600">
              for the sample database
            </span>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {sampleSnippets.map((snippet) => (
              <button
                key={snippet.label}
                onClick={() => {
                  setSql(snippet.sql);
                  setError(null);
                }}
                className="group min-w-0 cursor-pointer rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-left transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.04] sm:p-4 xl:p-3.5"
              >
                <div className="text-xs font-semibold text-slate-300 group-hover:text-white">
                  {snippet.label}
                </div>
                <div className="mt-1 break-words text-[11px] leading-5 text-slate-600">
                  {snippet.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-2xl backdrop-blur-xl sm:rounded-3xl">
          <div className="flex min-h-14 flex-col gap-3 border-b border-slate-800/80 bg-slate-900/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5 lg:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Terminal className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <span className="truncate font-mono text-xs font-semibold text-slate-200">
                query.sql
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <button
                onClick={handleCopy}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-2 text-[11px] text-slate-500 transition hover:border-slate-700 hover:text-white sm:flex"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-2 text-[11px] text-slate-500 transition hover:border-slate-700 hover:text-white sm:flex"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>

              <button
                onClick={handleExecute}
                disabled={executing}
                className="col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-400 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:py-2"
              >
                <Play className={`h-3.5 w-3.5 shrink-0 fill-current ${executing ? 'animate-pulse' : ''}`} />
                {executing ? 'Executing...' : 'Run Query'}
              </button>
            </div>
          </div>

          <div className="relative min-w-0 bg-[#080a0d]">
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 top-0 w-10 select-none overflow-hidden border-r border-slate-800/60 bg-slate-950/50 sm:w-14"
            >
              <div
                ref={wrapperRef}
                className="whitespace-nowrap pt-4 pr-2 text-right font-mono text-[10px] leading-7 text-slate-700 sm:pr-3 sm:text-[11px]"
              >
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
              className="block min-h-[220px] w-full resize-y overflow-auto bg-transparent py-4 pl-12 pr-3 font-mono text-[11px] leading-7 text-slate-200 placeholder:text-slate-700 focus:outline-none selection:bg-indigo-500/30 sm:min-h-[270px] sm:pl-[4.5rem] sm:pr-5 sm:text-[13px] lg:min-h-[320px]"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="min-w-0 overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/[0.045] shadow-lg"
          >
            <div className="flex min-w-0 items-start gap-3 p-3.5 sm:p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-500/10 bg-rose-500/10">
                <AlertCircle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs font-semibold text-rose-300">
                  Query execution failed
                </div>
                <div className="break-words font-mono text-xs leading-relaxed text-slate-400">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className={`min-w-0 space-y-4 transition-opacity ${executing ? 'opacity-50' : ''}`}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Execution Result
                </div>
                <span className="rounded-md border border-emerald-500/15 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Success
                </span>
              </div>

              {truncated && (
                <div className="mt-3 flex min-w-0 items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2.5 sm:px-3.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <p className="min-w-0 break-words text-xs leading-5 text-amber-200/90">
                    The query matched {totalRecords.toLocaleString()} rows, but only the first{' '}
                    {records.length.toLocaleString()} are shown. Add a LIMIT or filter to narrow it down.
                  </p>
                </div>
              )}
            </div>

            {records.length === 0 ? (
              <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-12 text-center sm:py-16">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
                  <Rows3 className="h-5 w-5 text-slate-600" />
                </div>
                <div className="text-sm font-medium text-slate-300">
                  Query executed successfully
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  The query returned no rows.
                </div>
              </div>
            ) : (
              <div className="w-full min-w-0 overflow-x-auto">
                <DataTable data={records} columns={result.columns || []} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}