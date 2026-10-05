import React from 'react';
import { History, ArrowUpRight, Trash2 } from 'lucide-react';
import { SqlCodeBlock } from './SqlCodeBlock';

export function QueryHistory({ history, onSelectQuery, onClearHistory }) {
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Query History Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Questions you ask in the AI Query Studio will be saved here so you can review generated SQL, retries, and answers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <History className="w-5 h-5 text-indigo-400" />
            Query Audit Log &amp; Session History
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Review past natural language questions, generated queries, and auto-repair metrics.
          </p>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      <div className="space-y-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-xs flex items-center justify-center font-bold">
                  {history.length - index}
                </span>
                <span className="text-sm font-semibold text-slate-100">{item.question}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  ⚡ {item.latency}s
                </span>
                <span className={`px-2 py-0.5 rounded ${
                  item.retry_count === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.retry_count} retries
                </span>
                <button
                  onClick={() => onSelectQuery(item)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold transition ml-2"
                >
                  <span>Re-open</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <SqlCodeBlock code={item.sql_query} title="Generated Query" />

            {item.analyst_summary && (
              <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                💡 <span className="font-semibold text-slate-200">Analysis:</span> {item.analyst_summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
