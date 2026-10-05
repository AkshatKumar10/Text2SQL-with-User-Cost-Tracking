// import React, { useState } from 'react';
// import { Play, Terminal, Sparkles, AlertCircle } from 'lucide-react';
// import { DataTable } from './DataTable';

// export function SqlPlayground({ defaultQuery = "SELECT * FROM orders JOIN customers ON orders.customer_id = customers.customer_id LIMIT 10;" }) {
//   const [sql, setSql] = useState(defaultQuery);
//   const [executing, setExecuting] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);

//   const handleExecute = async () => {
//     if (!sql.trim()) return;
//     setExecuting(true);
//     setError(null);
//     try {
//       const res = await fetch('/api/execute-sql', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ sql })
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.detail || 'SQL Execution failed');
//       }
//       setResult(data);
//     } catch (err) {
//       setError(err.message);
//       setResult(null);
//     } finally {
//       setExecuting(false);
//     }
//   };

//   const sampleSnippets = [
//     { label: "Top Customers", sql: "SELECT c.customer_id, c.first_name, c.last_name, SUM(o.total_amount) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id ORDER BY total_spent DESC;" },
//     { label: "Low Inventory", sql: "SELECT product_name, category, price, stock_quantity FROM products WHERE stock_quantity < 50 ORDER BY stock_quantity ASC;" },
//     { label: "Order Statuses", sql: "SELECT status, count(*) AS count, ROUND(SUM(total_amount), 2) AS total_value FROM orders GROUP BY status;" },
//     { label: "Items Sold", sql: "SELECT p.product_name, SUM(oi.quantity) AS total_units FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.product_name ORDER BY total_units DESC;" }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
//             <Terminal className="w-5 h-5 text-indigo-400" />
//             Direct SQL Console &amp; Query Sandbox
//           </h2>
//           <p className="text-sm text-slate-400 mt-1">
//             Test, prototype, and run custom queries directly against the SQLite database with instant table views.
//           </p>
//         </div>
//       </div>

//       {/* Snippet chips */}
//       <div className="flex flex-wrap items-center gap-2">
//         <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
//         {sampleSnippets.map((snip, idx) => (
//           <button
//             key={idx}
//             onClick={() => setSql(snip.sql)}
//             className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition"
//           >
//             {snip.label}
//           </button>
//         ))}
//       </div>

//       {/* Code Editor Area */}
//       <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
//         <div className="flex items-center justify-between">
//           <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
//             <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
//             SQL Query Input
//           </label>
//           <button
//             onClick={handleExecute}
//             disabled={executing}
//             className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
//           >
//             <Play className={`w-3.5 h-3.5 fill-current ${executing ? 'animate-pulse' : ''}`} />
//             {executing ? 'Executing...' : 'Run Query (Ctrl + Enter)'}
//           </button>
//         </div>

//         <textarea
//           value={sql}
//           onChange={(e) => setSql(e.target.value)}
//           onKeyDown={(e) => {
//             if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
//               handleExecute();
//             }
//           }}
//           rows={5}
//           className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-emerald-300 font-mono text-xs sm:text-sm focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner resize-y"
//           placeholder="Enter custom SQL SELECT query..."
//         />
//       </div>

//       {/* Error state */}
//       {error && (
//         <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-3">
//           <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
//           <div>
//             <span className="font-semibold block mb-0.5">Execution Error</span>
//             <span className="font-mono text-slate-300">{error}</span>
//           </div>
//         </div>
//       )}

//       {/* Result Table */}
//       {result && (
//         <DataTable data={result.records} columns={result.columns} />
//       )}
//     </div>
//   );
// }
import React, { useState } from 'react';
import axios from 'axios';
import {
  Play,
  Terminal,
  Sparkles,
  AlertCircle,
  Command
} from 'lucide-react';
import { DataTable } from './DataTable';

export function SqlPlayground({
  defaultQuery = "SELECT * FROM orders JOIN customers ON orders.customer_id = customers.customer_id LIMIT 10;"
}) {
  const [sql, setSql] = useState(defaultQuery);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;

  const handleExecute = async () => {
    if (!sql.trim()) return;

    setExecuting(true);
    setError(null);

    try {
      const res = await axios.post('/api/execute-sql', { sql });
      const data = res.data;

      setResult(data);
      setCurrentPage(1);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'SQL Execution failed'
      );
      setResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const sampleSnippets = [
    {
      label: "Top Customers",
      sql: "SELECT c.customer_id, c.first_name, c.last_name, SUM(o.total_amount) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id ORDER BY total_spent DESC;"
    },
    {
      label: "Low Inventory",
      sql: "SELECT product_name, category, price, stock_quantity FROM products WHERE stock_quantity < 50 ORDER BY stock_quantity ASC;"
    },
    {
      label: "Order Statuses",
      sql: "SELECT status, count(*) AS count, ROUND(SUM(total_amount), 2) AS total_value FROM orders GROUP BY status;"
    },
    {
      label: "Items Sold",
      sql: "SELECT p.product_name, SUM(oi.quantity) AS total_units FROM order_items oi JOIN products p ON oi.product_id = p.product_id GROUP BY p.product_name ORDER BY total_units DESC;"
    }
  ];

  // Dynamic line numbers
  const lineNumbers = sql.split('\n');

  // Pagination calculations
  const totalRecords = result?.records?.length || 0;

  const totalPages = Math.ceil(
    totalRecords / recordsPerPage
  );

  const startIndex =
    (currentPage - 1) * recordsPerPage;

  const endIndex =
    startIndex + recordsPerPage;

  const paginatedRecords = result
    ? result.records.slice(startIndex, endIndex)
    : [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-cyan-500/[0.04] pointer-events-none" />

        <div className="relative p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-400/10 flex items-center justify-center shrink-0">
                <Terminal className="w-5 h-5 text-indigo-400" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
                    SQL Console
                  </h2>

                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-medium uppercase tracking-wider text-emerald-400">
                    Live
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Write and execute SQL directly against your SQLite database.
                  Prototype queries and inspect results instantly.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500">
              <Command className="w-3.5 h-3.5" />
              <span>Ctrl</span>
              <span className="text-slate-700">+</span>
              <span>Enter</span>
              <span className="ml-1">to execute</span>
            </div>

          </div>
        </div>
      </div>


      {/* Quick Presets */}
      <div className="flex flex-col gap-3">

        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Query Presets
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sampleSnippets.map((snip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSql(snip.sql);
              }}
              className="group px-3.5 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] font-medium text-slate-400 hover:text-slate-100 hover:border-slate-700 hover:bg-slate-800/70 transition-all duration-150"
            >
              <span className="group-hover:text-cyan-400 transition-colors">
                {snip.label}
              </span>
            </button>
          ))}
        </div>

      </div>


      {/* SQL Editor */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b1018] shadow-2xl">

        {/* Editor Header */}
        <div className="h-14 px-4 sm:px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">

          <div className="flex items-center gap-3">

            {/* Window dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="w-2 h-2 rounded-full bg-slate-700" />
            </div>

            <div className="w-px h-4 bg-slate-800" />

            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />

              <span className="text-[11px] font-medium text-slate-300">
                query.sql
              </span>
            </div>

          </div>

          {/* Run button */}
          <button
            onClick={handleExecute}
            disabled={executing}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-lg shadow-indigo-500/10 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play
              className={`w-3.5 h-3.5 fill-current ${
                executing ? 'animate-pulse' : ''
              }`}
            />

            {executing ? 'Executing...' : 'Run Query'}
          </button>

        </div>


        {/* Editor Body */}
        <div className="relative">

          {/* Dynamic Line Numbers */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-14 border-r border-slate-800/60 bg-slate-950/40 pointer-events-none select-none overflow-hidden">

            <div className="pt-4 text-right pr-3 text-[10px] font-mono leading-7 text-slate-700">
              {lineNumbers.map((_, index) => (
                <div
                  key={index}
                  className="h-7"
                >
                  {index + 1}
                </div>
              ))}
            </div>

          </div>


          {/* SQL Input */}
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={(e) => {
              if (
                (e.ctrlKey || e.metaKey) &&
                e.key === 'Enter'
              ) {
                handleExecute();
              }
            }}
            rows={7}
            className="w-full min-h-[180px] sm:min-h-[210px] pl-16 sm:pl-[4.5rem] pr-5 py-4 bg-transparent text-slate-200 font-mono text-[12px] sm:text-[13px] leading-7 focus:outline-none resize-y placeholder:text-slate-700 selection:bg-indigo-500/30"
            placeholder="Write your SQL query..."
            spellCheck={false}
          />

        </div>


        {/* Editor Footer */}
        <div className="h-9 px-4 sm:px-5 flex items-center justify-between border-t border-slate-800/60 bg-slate-950/40">

          <span className="text-[10px] text-slate-600 font-mono">
            SQL
          </span>

          <span className="text-[10px] text-slate-600">
            {sql.length} characters
          </span>

        </div>

      </div>


      {/* Error State */}
      {error && (
        <div className="overflow-hidden rounded-xl border border-rose-500/20 bg-rose-500/[0.045]">

          <div className="flex items-start gap-3 p-4">

            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>

            <div className="min-w-0">

              <div className="text-[11px] font-semibold text-rose-300 mb-1">
                Query execution failed
              </div>

              <div className="text-[11px] font-mono text-slate-400 break-words leading-relaxed">
                {error}
              </div>

            </div>

          </div>

        </div>
      )}


      {/* Execution Result */}
      {result && (
        <div className="space-y-3">

          {/* Result Header */}
          <div className="flex items-center justify-between">

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Execution Result
              </div>

              <div className="text-xs text-slate-400 mt-1">
                {totalRecords === 0
                  ? 'No records returned'
                  : `${totalRecords} ${
                      totalRecords === 1 ? 'record' : 'records'
                    } matching`}
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/15 text-[10px] font-medium text-emerald-400">
              Executed
            </div>

          </div>


          {/* Result Table */}
          <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-950/40">

            <DataTable
              data={result.records}
              columns={result.columns}
            />


            {/* Pagination */}
            {totalRecords > recordsPerPage && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-800/80 bg-slate-950/60">

                {/* Record Range */}
                <div className="text-[11px] text-slate-500">

                  Showing{' '}

                  <span className="text-slate-300 font-medium">
                    {startIndex + 1}
                  </span>

                  {' – '}

                  <span className="text-slate-300 font-medium">
                    {Math.min(
                      startIndex + recordsPerPage,
                      totalRecords
                    )}
                  </span>

                  {' of '}

                  <span className="text-slate-300 font-medium">
                    {totalRecords}
                  </span>

                  {' records'}

                </div>


                {/* Pagination Controls */}
                <div className="flex items-center gap-2">

                  {/* Previous */}
                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(page - 1, 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/70 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>


                  {/* Page Number */}
                  <div className="min-w-[58px] text-center px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-medium">
                    {currentPage} / {totalPages}
                  </div>


                  {/* Next */}
                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/70 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}