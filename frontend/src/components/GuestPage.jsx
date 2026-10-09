import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowUp,
  Loader2,
  AlertCircle,
  Info,
  Database,
  BarChart3,
  Table2,
  Code2,
  Clock,
  Rows3,
  Columns3,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

import { AgentWorkflowTracker } from './AgentWorkflowTracker';
import { VisualizerCard } from './VisualizerCard';
import { DataTable } from './DataTable';
import { SqlCodeBlock } from './SqlCodeBlock';
import { TableInfoModal } from './TableInfoModal';

const tables = [
  'customers',
  'products',
  'orders',
  'order_items',
];

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#0b0d11] px-3 py-3 sm:gap-3 sm:px-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025]">
        <Icon className="h-3.5 w-3.5 text-blue-400" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[10px] text-[#6b727c] sm:text-[11px]">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-[#e4e7ec]">
          {value}
        </p>
      </div>
    </div>
  );
}

export function GuestPage({
  question,
  setQuestion,
  loading,
  error,
  currentResult,
  setCurrentResult,
  activeResultTab,
  setActiveResultTab,
  onSubmit,
  starters,
  schemaData,
}) {
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    setQuestion('');
    setCurrentResult(null);
    setActiveResultTab('sql');
  }, []);

  useEffect(() => {
    if (currentResult) {
      setActiveResultTab('sql');
    }
  }, [currentResult, setActiveResultTab]);

  const rowCount =
    currentResult?.row_count ??
    currentResult?.df_result?.length ??
    0;

  const colCount = currentResult?.columns?.length ?? 0;

  const latency =
    typeof currentResult?.latency === 'number'
      ? `${currentResult.latency.toFixed(2)}s`
      : currentResult?.latency ?? '-';

  const retryCount = currentResult?.retry_count ?? 0;
  const repairHistory = currentResult?.repair_history ?? [];
  const isValid = currentResult?.is_valid ?? false;

  const isAnswerable = currentResult?.is_answerable ?? true;
  const answerabilityReason =
    currentResult?.answerability_reason ?? '';

  const hasRows =
    currentResult?.df_result &&
    currentResult.df_result.length > 0;

  const workflowError =
    currentResult?.error_message ||
    error ||
    '';

  const isRejected =
    currentResult &&
    currentResult.is_answerable === false;

  const tabs = [
    {
      id: 'sql',
      label: 'SQL',
      icon: Code2,
    },
    {
      id: 'data',
      label: 'Table',
      icon: Table2,
    },
    {
      id: 'viz',
      label: 'Chart',
      icon: BarChart3,
    },
  ];

  const run = () => {
    if (!loading && question.trim()) {
      setCurrentResult(null);
      onSubmit(question);
    }
  };

  const handleTableClick = (tableName) => {
    const tableInfo = schemaData?.tables?.find(
      (table) => table.name === tableName
    );

    setSelectedTable(
      tableInfo ?? {
        name: tableName,
        columns: [],
        sample_rows: [],
        total_rows: 0,
      }
    );
  };

  return (
    <>
      <div className="mx-auto w-full max-w-5xl overflow-hidden px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="pt-4 text-center sm:pt-10">
          <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 text-xs text-amber-200/90">
            <Info className="h-3.5 w-3.5 shrink-0 text-amber-300" />
            <span className="truncate">
              Guest sandbox. Queries here aren't saved or tracked.
            </span>
          </div>

          <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:mt-6 sm:text-5xl">
            What would you like to know?
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#858b95] sm:text-base sm:leading-7">
            Ask a question about the ecommerce database in plain English.
            Get the SQL, a chart, and the results in seconds.
          </p>
        </div>

        <div className="relative mx-auto mt-8 w-full max-w-3xl sm:mt-10">
          <div className="pointer-events-none absolute -inset-x-6 -inset-y-5 rounded-[40px] bg-blue-500/[0.07] blur-3xl sm:-inset-x-10 sm:-inset-y-6" />

          <div className="relative rounded-2xl border border-white/[0.12] bg-[#101216]/90 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur transition focus-within:border-blue-400/50 focus-within:shadow-[0_20px_60px_rgba(37,99,235,0.18)]">
            <div className="flex min-w-0 items-center gap-2 px-2 sm:gap-3 sm:px-3">
              <Sparkles className="h-4 w-4 shrink-0 text-blue-400" />

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    run();
                  }
                }}
                placeholder="e.g. List the top 5 selling products"
                className="min-w-0 flex-1 bg-transparent py-3 text-[14px] text-white outline-none placeholder:text-[#5b616b] sm:text-[15px]"
                disabled={loading}
              />

              <button
                onClick={run}
                disabled={loading || !question.trim()}
                aria-label="Run query"
                className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-3.5 text-sm font-semibold text-[#101114] transition hover:bg-[#e9ebed] disabled:cursor-not-allowed disabled:opacity-30 sm:px-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">
                      Running
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Run
                    </span>
                    <ArrowUp className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative mt-4">
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#6b727c] sm:gap-2">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 shrink-0" />
                Querying ecommerce.db
              </span>

              <span className="hidden text-[#343941] sm:inline">
                /
              </span>

              {tables.map((table) => (
                <button
                  key={table}
                  type="button"
                  onClick={() => handleTableClick(table)}
                  title={`Click to inspect ${table}`}
                  className="group relative cursor-pointer rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-0.5 font-mono text-[10px] text-[#8a919b] transition hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400/30 sm:text-[11px]"
                >
                  {table}

                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.08] bg-[#181b21] px-2 py-1 text-[10px] font-sans text-[#b8bec7] opacity-0 shadow-xl transition group-hover:opacity-100 sm:block">
                    Click to inspect
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-2 text-center text-[11px] leading-5 text-[#9aa1ac] sm:text-[12px]">
              Click a table name to see its columns and sample data
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-4xl gap-3 sm:mt-10 sm:grid-cols-2">
          {starters.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                setCurrentResult(null);
                setQuestion(item.query);
                onSubmit(item.query);
              }}
              disabled={loading}
              className="group flex min-w-0 cursor-pointer items-start rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-blue-400/30 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#e4e7ec]">
                  {item.title}
                </p>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6b727c]">
                  {item.query}
                </p>
              </div>
            </button>
          ))}
        </div>

        {error && !currentResult && (
          <div
            role="alert"
            className="mx-auto mt-8 flex w-full max-w-3xl items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] p-4 sm:mt-10"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-rose-200">
                The query didn't run
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-rose-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-10 space-y-5 sm:mt-12">
            <AgentWorkflowTracker isLoading={true} />
          </div>
        )}

        {currentResult && !loading && (
          <div className="mt-10 space-y-5 sm:mt-12">
            {isRejected ? (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.7)]" />

                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">
                    Question not supported
                  </h2>
                </div>

                <AgentWorkflowTracker
                  retryCount={retryCount}
                  repairHistory={repairHistory}
                  isValid={false}
                  isAnswerable={isAnswerable}
                  answerabilityReason={answerabilityReason}
                  error={workflowError}
                />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isValid
                        ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                        : 'bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                    }`}
                  />

                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">
                    {isValid
                      ? 'Results'
                      : 'Query could not be completed'}
                  </h2>
                </div>

                {!isValid && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-rose-200 sm:p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />

                      <div className="min-w-0">
                        <h4 className="font-semibold text-rose-300">
                          SQL Execution Failed
                        </h4>

                        <p className="mt-1 break-words font-mono text-xs leading-relaxed text-rose-300/90">
                          {workflowError ||
                            'The query failed validation or execution on the database.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isValid && (
                  <div className="grid grid-cols-1 min-[401px]:grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
                    <Stat
                      icon={Rows3}
                      label="Rows returned"
                      value={rowCount}
                    />

                    <Stat
                      icon={Columns3}
                      label="Columns"
                      value={colCount}
                    />

                    <Stat
                      icon={Clock}
                      label="Latency"
                      value={latency}
                    />

                    <Stat
                      icon={RefreshCw}
                      label="Retries"
                      value={retryCount}
                    />
                  </div>
                )}

                <AgentWorkflowTracker
                  latency={currentResult.latency}
                  retryCount={retryCount}
                  repairHistory={repairHistory}
                  isValid={isValid}
                  isAnswerable={isAnswerable}
                  answerabilityReason={answerabilityReason}
                  error={workflowError}
                />

                {isValid && (
                  <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0f13] shadow-2xl">
                    <div className="overflow-x-auto border-b border-white/[0.07] px-3 py-2.5 sm:px-4">
                      <div
                        role="tablist"
                        className="flex w-max items-center gap-1 rounded-lg border border-white/[0.06] bg-[#0b0d11] p-1"
                      >
                        {tabs.map(
                          ({
                            id,
                            label,
                            icon: Icon,
                          }) => {
                            const active =
                              activeResultTab === id;

                            return (
                              <button
                                key={id}
                                role="tab"
                                aria-selected={active}
                                onClick={() =>
                                  setActiveResultTab(id)
                                }
                                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition sm:gap-2 sm:px-3.5 ${
                                  active
                                    ? 'bg-white/[0.09] text-white'
                                    : 'text-[#7b818a] hover:text-slate-200'
                                }`}
                              >
                                <Icon
                                  className={`h-3.5 w-3.5 ${
                                    active
                                      ? 'text-blue-400'
                                      : ''
                                  }`}
                                />

                                {label}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 p-3 sm:p-6">
                      {activeResultTab === 'viz' && (
                        <div className="min-w-0">
                          <VisualizerCard
                            chartType={currentResult.chart_type}
                            chartConfig={
                              currentResult.chart_config
                            }
                            summary={
                              currentResult.analyst_summary
                            }
                            data={currentResult.df_result}
                          />
                        </div>
                      )}

                      {activeResultTab === 'data' &&
                        (hasRows ? (
                          <div className="w-full overflow-x-auto">
                            <DataTable
                              data={currentResult.df_result}
                              columns={currentResult.columns}
                            />
                          </div>
                        ) : (
                          <div className="py-12 text-center sm:py-14">
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
                              <ShoppingBag className="h-4 w-4 text-[#6b727c]" />
                            </div>

                            <p className="text-sm font-medium text-[#d8dce1]">
                              No rows returned
                            </p>

                            <p className="mt-1 text-xs text-[#6b727c]">
                              The query ran successfully, but nothing matched.
                            </p>
                          </div>
                        ))}

                      {activeResultTab === 'sql' && (
                        <div className="min-w-0 overflow-x-auto">
                          <SqlCodeBlock
                            code={currentResult.sql_query}
                            repairHistory={repairHistory}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <TableInfoModal
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
      />
    </>
  );
}