import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Sparkles,
    ArrowUp,
    Loader2,
    AlertCircle,
    Database,
    BarChart3,
    Table2,
    Code2,
    Clock,
    Rows3,
    Columns3,
    RefreshCw,
    ShoppingBag,
    UserCheck,
    DollarSign,
    BrainCircuit,
    ChevronRight,
} from 'lucide-react';

import { AgentWorkflowTracker } from './AgentWorkflowTracker';
import { VisualizerCard } from './VisualizerCard';
import { DataTable } from './DataTable';
import { SqlCodeBlock } from './SqlCodeBlock';
import { TableInfoModal } from './TableInfoModal';

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

export function QueryStudio({
    question,
    setQuestion,
    loading,
    error,
    currentResult,
    setCurrentResult,
    activeResultTab,
    setActiveResultTab,
    onSubmit,
    user,
    starters = [],
    schemaData,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedTable, setSelectedTable] = useState(null);

    useEffect(() => {
        if (!location.state?.fromHistory) {
            setQuestion('');
        }
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
            onSubmit(question, false);
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

    const allTables = schemaData?.tables || [
        { name: 'customers', is_custom: false },
        { name: 'products', is_custom: false },
        { name: 'orders', is_custom: false },
        { name: 'order_items', is_custom: false },
    ];

    return (
        <>
            <div className="mx-auto w-full max-w-5xl overflow-hidden px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
                <div className="pt-4 text-center sm:pt-10">
                    {user && (
                        <div className="mx-auto mb-4 flex w-fit max-w-full flex-col items-stretch gap-1 rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3 text-xs text-blue-200 shadow-sm backdrop-blur sm:mb-0 sm:inline-flex sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-2">
                            <div className="flex min-w-0 items-start gap-2 text-left">
                                <UserCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                                <span className="min-w-0 break-words">
                                    Signed in as{' '}
                                    <strong className="text-white">
                                        {user.name}
                                    </strong>
                                    . Queries &amp; token costs are logged in Langfuse.
                                </span>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex w-fit shrink-0 cursor-pointer items-center gap-1 font-semibold text-cyan-400 transition hover:text-cyan-300"
                            >
                                Dashboard
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:mt-6 sm:text-5xl">
                        Turn natural language into{' '}
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                            executable SQL
                        </span>
                    </h1>

                    <div className="relative mx-auto mt-8 w-full max-w-3xl sm:mt-10">
                        <div className="pointer-events-none absolute -inset-x-6 -inset-y-5 rounded-[40px] bg-blue-500/[0.07] blur-3xl sm:-inset-x-10 sm:-inset-y-6" />

                        <div className="relative rounded-2xl border border-white/[0.12] bg-[#101216]/90 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur transition focus-within:border-blue-400/50 focus-within:shadow-[0_20px_60px_rgba(37,99,235,0.18)]">
                            <div className="flex min-w-0 items-center gap-2 px-2 sm:gap-3 sm:px-3">
                                <Sparkles className="h-4 w-4 shrink-0 text-blue-400" />

                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) =>
                                        setQuestion(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            run();
                                        }
                                    }}
                                    placeholder="e.g. What is the total revenue generated by each product category?"
                                    className="min-w-0 flex-1 bg-transparent py-3 text-[14px] text-white outline-none placeholder:text-[#5b616b] sm:text-[15px]"
                                />

                                <button
                                    type="button"
                                    onClick={run}
                                    disabled={loading || !question.trim()}
                                    aria-label="Run query"
                                    className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-500 px-3.5 text-xs font-medium text-white transition hover:bg-blue-400 active:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            <span className="hidden sm:inline">
                                                Running
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">
                                                Run
                                            </span>
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="relative mt-4">
                            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#6b727c] sm:gap-2">
                                <span className="flex items-center gap-1.5">
                                    <Database className="h-3.5 w-3.5 shrink-0" />
                                    Active Database Schema
                                </span>

                                <span className="hidden text-[#343941] sm:inline">
                                    /
                                </span>

                                {allTables.map((t) => {
                                    const tName =
                                        typeof t === 'string' ? t : t.name;
                                    const isCustom =
                                        typeof t === 'object' && t.is_custom;

                                    return (
                                        <button
                                            key={tName}
                                            type="button"
                                            onClick={() =>
                                                handleTableClick(tName)
                                            }
                                            title={`Click to inspect ${tName}`}
                                            className={`group relative max-w-full cursor-pointer rounded-md border px-2 py-0.5 font-mono text-[10px] transition focus:outline-none focus:ring-1 focus:ring-blue-400/30 sm:text-[11px] ${
                                                isCustom
                                                    ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                                                    : 'border-white/[0.07] bg-white/[0.025] text-[#8a919b] hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-blue-300'
                                            }`}
                                        >
                                            {tName}
                                            {isCustom && (
                                                <span className="ml-1 text-[9px] text-indigo-400">
                                                    (custom)
                                                </span>
                                            )}

                                            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.08] bg-[#181b21] px-2 py-1 font-sans text-[10px] text-[#b8bec7] opacity-0 shadow-xl transition group-hover:opacity-100 sm:block">
                                                Click to inspect schema
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="mt-2 text-center text-[11px] leading-5 text-[#9aa1ac] sm:text-[12px]">
                                Click any table to inspect its schema columns
                                &amp; sample data
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
                                    onSubmit(item.query, false);
                                }}
                                disabled={loading}
                                className="group flex min-w-0 cursor-pointer items-start rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-blue-400/30 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#c0c6d0] group-hover:text-blue-400">
                                        {item.title}
                                    </p>

                                    <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[#6b727c]">
                                        {item.query}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {workflowError && !currentResult && (
                    <div className="mx-auto mt-8 flex w-full max-w-3xl items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-xs text-rose-300">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="min-w-0 break-words">
                            {workflowError}
                        </span>
                    </div>
                )}

                {loading && !currentResult && (
                    <div className="mt-10 space-y-5 sm:mt-12">
                        <AgentWorkflowTracker isLoading={true} />
                    </div>
                )}

                {currentResult && (
                    <div className="mt-10 min-w-0 space-y-5 sm:mt-12 sm:space-y-6">
                        {currentResult.tokens &&
                            currentResult.tokens.total_tokens > 0 && (
                                <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#101216] p-3 shadow-xl sm:p-4">
                                    <div className="flex flex-col gap-4 text-xs lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                                                <DollarSign className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[11px] text-[#6b727c]">
                                                    Estimated Query Cost
                                                </p>
                                                <p className="break-words font-mono text-sm font-bold text-purple-300">
                                                    $
                                                    {currentResult.tokens.cost_usd?.toFixed(
                                                        6
                                                    )}{' '}
                                                    USD
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3 sm:min-h-[58px]">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                                                    <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" />
                                                </div>

                                                <div className="min-w-0 leading-tight">
                                                    <p className="text-[10px] uppercase tracking-wider text-[#626975]">
                                                        Total Tokens
                                                    </p>

                                                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                                        <span className="font-mono text-sm font-bold text-cyan-300">
                                                            {currentResult.tokens.total_tokens.toLocaleString()}
                                                        </span>

                                                        <span className="break-words text-[10px] text-[#666d78]">
                                                            Input{' '}
                                                            <span className="font-mono text-[#9aa1ac]">
                                                                {currentResult.tokens.prompt_tokens.toLocaleString()}
                                                            </span>
                                                            {' · '}
                                                            Output{' '}
                                                            <span className="font-mono text-[#9aa1ac]">
                                                                {currentResult.tokens.completion_tokens.toLocaleString()}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {currentResult.trace_id && (
                                                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-indigo-400/10 bg-indigo-500/[0.04] px-3.5 py-3 sm:min-h-[58px]">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                                                        <BrainCircuit className="h-3.5 w-3.5 text-indigo-400" />
                                                    </div>

                                                    <div className="min-w-0 leading-tight">
                                                        <p className="text-[10px] uppercase tracking-wider text-[#626975]">
                                                            Langfuse Trace
                                                        </p>
                                                        <a
                                                            href={`https://cloud.langfuse.com/trace/${currentResult.trace_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-1 block max-w-full truncate font-mono text-xs font-medium text-indigo-300 transition hover:text-indigo-200 hover:underline sm:max-w-[220px]"
                                                            title="Open trace in Langfuse"
                                                        >
                                                            {currentResult.trace_id}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        <AgentWorkflowTracker
                            latency={currentResult.latency}
                            retryCount={retryCount}
                            repairHistory={repairHistory}
                            isValid={isValid}
                            error={currentResult.error_message}
                            isAnswerable={isAnswerable}
                            answerabilityReason={answerabilityReason}
                            isLoading={loading}
                        />

                        {isRejected ? (
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-amber-200 sm:p-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-amber-300">
                                            Question Unanswerable
                                        </h4>
                                        <p className="mt-1 break-words text-xs leading-relaxed text-amber-200/80">
                                            {answerabilityReason ||
                                                'The system could not map this question to the available database tables.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {!isValid && (
                                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-rose-200 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-rose-300">
                                                    SQL Execution Failed
                                                </h4>
                                                <p className="mt-1 break-words font-mono text-xs leading-relaxed text-rose-300/90">
                                                    {currentResult.error_message ||
                                                        'The query failed validation or execution on the database.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isValid && (
                                    <div className="grid grid-cols-1 gap-2.5 min-[401px]:grid-cols-2 sm:gap-3 lg:grid-cols-4">
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

                                {isValid && (
                                    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101216] shadow-2xl">
                                        <div className="overflow-x-auto border-b border-white/[0.07] px-3 py-2.5 sm:px-4">
                                            <div
                                                role="tablist"
                                                className="flex w-max items-center gap-1 rounded-lg border border-white/[0.06] bg-[#0b0d11] p-1"
                                            >
                                                {tabs.map((t) => {
                                                    const Icon = t.icon;
                                                    const active =
                                                        activeResultTab === t.id;

                                                    return (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            role="tab"
                                                            aria-selected={active}
                                                            onClick={() =>
                                                                setActiveResultTab(
                                                                    t.id
                                                                )
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
                                                            {t.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="min-w-0 p-3 sm:p-6">
                                            {activeResultTab === 'viz' && (
                                                <div className="min-w-0">
                                                    <VisualizerCard
                                                        chartType={
                                                            currentResult.chart_type
                                                        }
                                                        chartConfig={
                                                            currentResult.chart_config
                                                        }
                                                        summary={
                                                            currentResult.analyst_summary
                                                        }
                                                        data={
                                                            currentResult.df_result
                                                        }
                                                    />
                                                </div>
                                            )}

                                            {activeResultTab === 'data' &&
                                                (hasRows ? (
                                                    <div className="w-full min-w-0 overflow-x-auto">
                                                        <DataTable
                                                            data={
                                                                currentResult.df_result
                                                            }
                                                            columns={
                                                                currentResult.columns
                                                            }
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
                                                            The query ran successfully, but returned no matching data.
                                                        </p>
                                                    </div>
                                                ))}

                                            {activeResultTab === 'sql' && (
                                                <div className="min-w-0 overflow-x-auto">
                                                    <SqlCodeBlock
                                                        code={
                                                            currentResult.sql_query
                                                        }
                                                        repairHistory={
                                                            repairHistory
                                                        }
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