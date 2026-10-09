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
    <main className="relative isolate min-h-screen w-full min-w-0 overflow-x-clip bg-[#080a0d] text-slate-100">
      <div className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-3xl sm:right-10 sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute bottom-10 left-0 h-64 w-64 rounded-full bg-indigo-500/[0.05] blur-3xl sm:left-10 sm:h-80 sm:w-80" />

      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 space-y-6 px-3 pb-10 sm:px-5 sm:pb-12 md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-4 border-b border-slate-800/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl border border-slate-800 bg-slate-800/60" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-48 max-w-full rounded-md bg-slate-800/70" />
              <div className="h-3 w-72 max-w-full rounded bg-slate-800/50" />
            </div>
          </div>
          <div className="flex gap-4 sm:shrink-0">
            <div className="h-9 w-20 rounded-lg bg-slate-800/60" />
          </div>
        </div>

        <div className="min-w-0 space-y-2.5">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="min-w-0 rounded-2xl border border-slate-800/70 bg-slate-900/40 px-3 py-4 sm:px-4 sm:py-5"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-48 max-w-full rounded bg-slate-800/70 sm:w-72" />
                </div>
                <div className="flex shrink-0 gap-2">
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
      <main className="relative isolate min-h-screen w-full min-w-0 overflow-x-clip bg-[#080a0d] text-slate-100">
        <div className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-3xl sm:right-10 sm:h-80 sm:w-80" />
        <div className="pointer-events-none absolute bottom-10 left-0 h-64 w-64 rounded-full bg-indigo-500/[0.05] blur-3xl sm:left-10 sm:h-80 sm:w-80" />

        <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 px-3 pb-10 sm:px-5 sm:pb-12 md:px-6 lg:px-8">
          <div className="flex min-w-0 flex-col gap-4 border-b border-slate-800/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.08] text-blue-400 shadow-lg shadow-blue-500/[0.05]">
                <History className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  Query History
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Review previous questions and generated SQL.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex min-h-[280px] w-full min-w-0 flex-col items-center justify-center rounded-2xl border border-slate-800/70 bg-slate-900/30 px-4 py-8 text-center sm:px-6">
            <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.08] text-blue-400">
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
    <main className="relative isolate min-h-screen w-full min-w-0 overflow-x-clip bg-[#080a0d] text-slate-100">
      <div className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-blue-500/[0.06] blur-3xl sm:right-10 sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute bottom-10 left-0 h-64 w-64 rounded-full bg-indigo-500/[0.05] blur-3xl sm:left-10 sm:h-80 sm:w-80" />

      <div className="relative z-10 mx-auto w-full max-w-7xl min-w-0 space-y-5 px-3 pb-10 sm:space-y-6 sm:px-5 sm:pb-12 md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-4 border-b border-slate-800/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/[0.08] text-blue-400 shadow-lg shadow-blue-500/[0.05]">
              <History className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Query History
              </h1>
              <p className="mt-0.5 break-words text-xs leading-relaxed text-slate-500">
                Review previous questions, generated SQL, and repair attempts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:shrink-0">
            <button
              onClick={onClearHistory}
              className="inline-flex h-9 max-w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.05] px-3 text-xs font-medium text-rose-300 transition-all hover:border-rose-500/30 hover:bg-rose-500/[0.1]"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              Clear
            </button>
          </div>
        </div>

        <div className="min-w-0 space-y-2.5">
          {history.map((item, index) => {
            const queryKey = item.id || index;
            const isExpanded = expandedQuery === queryKey;
            const retryCount = item.retry_count || 0;

            return (
              <div
                key={queryKey}
                className={`w-full min-w-0 overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? 'border-blue-500/25 bg-slate-900/50 shadow-lg shadow-blue-950/10'
                    : 'border-slate-800/70 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/45'
                }`}
              >
                <div className="flex min-w-0 flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium leading-5 text-slate-200 [overflow-wrap:anywhere]">
                      {item.question}
                    </p>
                  </div>

                  <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-2 sm:justify-end">
                    {retryCount > 0 && (
                      <span className="max-w-full rounded-md border border-amber-500/15 bg-amber-500/[0.06] px-2 py-1 text-[10px] font-medium text-amber-400/80">
                        {retryCount}{' '}
                        {retryCount === 1 ? 'retry' : 'retries'}
                      </span>
                    )}

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => toggleQuery(queryKey)}
                        aria-label={
                          isExpanded
                            ? 'Hide generated query'
                            : 'Show generated query'
                        }
                        title={isExpanded ? 'Hide query' : 'Show query'}
                        className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 ${
                          isExpanded
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
                        className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-blue-500/15 bg-blue-500/[0.07] px-2.5 text-[11px] font-medium text-blue-300 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.12]"
                      >
                        <span>Re-open</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`grid min-w-0 transition-[grid-template-rows] duration-300 ease-out ${
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 min-w-0 overflow-hidden">
                    <div
                      className={`min-w-0 border-t border-slate-800/60 bg-slate-950/20 p-3 transition-opacity duration-200 sm:p-4 ${
                        isExpanded ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-800/70 bg-[#080a0d]">
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
            <div className="flex min-w-0 flex-col gap-4 border-t border-slate-800/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-words text-xs leading-relaxed text-slate-500">
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

              <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="inline-flex h-9 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  Previous
                </button>

                <div className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-2 text-xs font-semibold text-blue-300">
                  {pagination.page}
                </div>

                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="inline-flex h-9 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
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