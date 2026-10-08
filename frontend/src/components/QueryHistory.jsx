import React, { useState } from 'react';
import {
  History,
  ArrowUpRight,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SqlCodeBlock } from './SqlCodeBlock';

function QueryLoading() {
  return (
    <main className="relative w-full text-slate-100">
      <div className="pointer-events-none absolute right-10 top-10 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-indigo-500/[0.05] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 pb-12">
        <div className="flex flex-col gap-4 border-b border-slate-800/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl border border-slate-800 bg-slate-800/60" />
            <div className="space-y-2">
              <div className="h-5 w-48 rounded-md bg-slate-800/70" />
              <div className="h-3 w-72 max-w-[65vw] rounded bg-slate-800/50" />
            </div>
          </div>
          <div className='flex flex-row gap-4'>
            <div className="h-9 w-20 rounded-lg bg-slate-800/60" />
          </div>
        </div>

        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-4 py-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-3.5 w-120 max-w-[55vw] rounded bg-slate-800/70" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-800/60" />
                  <div className="h-8 w-20 rounded-lg bg-slate-800/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function QueryHistory({
  history,
  historyLoading,
  onSelectQuery,
  onClearHistory,
  pagination,
  onPageChange,
}) {
  const [expandedQuery, setExpandedQuery] = useState(null);

  const toggleQuery = (key) => {
    setExpandedQuery((prev) => (prev === key ? null : key));
  };

  if (historyLoading) {
    return <QueryLoading />;
  }

  if (!history || history.length === 0) {
    return (
      <main className="relative w-full text-slate-100">
        <div className="pointer-events-none absolute right-10 top-10 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-indigo-500/[0.05] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl pb-12">
          <div className="flex flex-col gap-4 border-b border-slate-800/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.08] text-blue-400 shadow-lg shadow-blue-500/[0.05]">
                <History className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  Query History
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Review previous questions and generated SQL.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-800/70 bg-slate-900/30 px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.08] text-blue-400">
              <History className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-semibold text-slate-200">
              No Query History Yet
            </h3>

            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
              Questions you ask in AI Query will appear here along with
              generated SQL and retry information.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full text-slate-100">
      <div className="pointer-events-none absolute right-10 top-10 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-indigo-500/[0.05] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 pb-12">
        <div className="flex flex-col gap-4 border-b border-slate-800/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.08] text-blue-400 shadow-lg shadow-blue-500/[0.05]">
              <History className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Query History
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Review previous questions, generated SQL, and repair attempts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onClearHistory}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.05] px-3 text-xs font-medium text-rose-300 transition-all hover:border-rose-500/30 hover:bg-rose-500/[0.1]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {history.map((item, index) => {
            const queryKey = item.id || index;
            const isExpanded = expandedQuery === queryKey;
            const retryCount = item.retry_count || 0;

            return (
              <div
                key={queryKey}
                className={`overflow-hidden rounded-2xl border bg-slate-900/30 transition-all duration-200 ${isExpanded
                  ? 'border-blue-500/25 bg-slate-900/50 shadow-lg shadow-blue-950/10'
                  : 'border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/45'
                  }`}
              >
                <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 py-5 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium leading-5 text-slate-200">
                      {item.question}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {retryCount > 0 && (
                      <span className="rounded-md border border-amber-500/15 bg-amber-500/[0.06] px-2 py-1 text-[10px] font-medium text-amber-400/80">
                        {retryCount}{' '}
                        {retryCount === 1 ? 'retry' : 'retries'}
                      </span>
                    )}

                    <button
                      onClick={() => toggleQuery(queryKey)}
                      aria-label={
                        isExpanded
                          ? 'Hide generated query'
                          : 'Show generated query'
                      }
                      title={isExpanded ? 'Hide query' : 'Show query'}
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 ${isExpanded
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                        : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-300'
                        }`}
                    >
                      {isExpanded ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onSelectQuery(item)}
                      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-blue-500/15 bg-blue-500/[0.07] px-2.5 text-[11px] font-medium text-blue-300 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.12]"
                    >
                      <span>Re-open</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded
                    ? 'grid-rows-[1fr]'
                    : 'grid-rows-[0fr]'
                    }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className={`border-t border-slate-800/60 bg-slate-950/20 p-3 transition-opacity duration-200 sm:p-4 ${isExpanded ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                      <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-[#080a0d]">
                        <SqlCodeBlock
                          code={item.sql_query}
                          title="Generated Query"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800/70 pt-4">
              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-medium text-slate-300">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>
                {' - '}
                <span className="font-medium text-slate-300">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>
                {' of '}
                <span className="font-medium text-slate-300">
                  {pagination.total}
                </span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-2 text-xs font-semibold text-blue-300">
                  {pagination.page}
                </div>

                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
