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
import { GoogleLogin } from '@react-oauth/google';

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
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0b0d11] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025]">
                <Icon className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div>
                <p className="text-[11px] text-[#6b727c]">
                    {label}
                </p>
                <p className="text-sm font-semibold text-[#e4e7ec]">
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
    user,
    starters,
    onGoogleSuccess,
    onGoogleError,
    googleClientId,
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

        const rowCount = currentResult?.row_count ?? currentResult?.df_result?.length ?? 0;
    const colCount = currentResult?.columns?.length ?? 0;

    const latency =
        typeof currentResult?.latency === 'number'
            ? `${currentResult.latency.toFixed(2)}s`
            : currentResult?.latency ?? '-';

    const retryCount = currentResult?.retry_count ?? 0;
    const repairHistory = currentResult?.repair_history ?? [];
    const isValid = currentResult?.is_valid ?? false;

    const isAnswerable = currentResult?.is_answerable ?? true;
    const answerabilityReason = currentResult?.answerability_reason ?? '';

    const hasRows = currentResult?.df_result && currentResult.df_result.length > 0;
    const workflowError = currentResult?.error_message || error || '';
    const isRejected = currentResult && currentResult.is_answerable === false;

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
            <div className="mx-auto max-w-5xl pb-24">
                <div className="pt-4 text-center sm:pt-10">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 text-xs text-amber-200/90">
                        <Info className="h-3.5 w-3.5 text-amber-300" />
                        Guest sandbox. Queries here aren't saved or tracked.
                        {!user && googleClientId && (
                            <span className="group relative inline-flex cursor-pointer overflow-hidden">
                                <span className="pointer-events-none font-semibold text-white underline decoration-white/30 underline-offset-2 transition group-hover:decoration-white">
                                    Sign in
                                </span>
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[2] opacity-0">
                                    <GoogleLogin
                                        onSuccess={onGoogleSuccess}
                                        onError={onGoogleError}
                                        type="icon"
                                        shape="square"
                                        size="large"
                                    />
                                </span>
                            </span>
                        )}
                    </div>
                    <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl">
                        What would you like to know?
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#858b95] sm:text-base">
                        Ask a question about the ecommerce database in plain English.
                        Get the SQL, a chart, and the results in seconds.
                    </p>
                </div>

                <div className="relative mx-auto mt-10 max-w-3xl">
                    <div className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-[40px] bg-blue-500/[0.07] blur-3xl" />
                    <div className="relative rounded-2xl border border-white/[0.12] bg-[#101216]/90 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur transition focus-within:border-blue-400/50 focus-within:shadow-[0_20px_60px_rgba(37,99,235,0.18)]">
                        <div className="flex items-center gap-3 px-3">
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
                                className="w-full bg-transparent py-3 text-[15px] text-white placeholder-[#5b616b] focus:outline-none"
                                disabled={loading}
                            />
                            <button
                                onClick={run}
                                disabled={
                                    loading ||
                                    !question.trim()
                                }
                                aria-label="Run query"
                                className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#101114] transition hover:bg-[#e9ebed] disabled:cursor-not-allowed disabled:opacity-30"
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
                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#6b727c]">
                            <span className="flex items-center gap-1.5">
                                <Database className="h-3.5 w-3.5" />
                                Querying ecommerce.db
                            </span>
                            <span className="text-[#343941]">
                                /
                            </span>
                            {tables.map((table) => (
                                <button
                                    key={table}
                                    type="button"
                                    onClick={() =>
                                        handleTableClick(table)
                                    }
                                    title={`Click to inspect ${table}`}
                                    className="group relative cursor-pointer rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-0.5 font-mono text-[11px] text-[#8a919b] transition hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
                                >
                                    {table}
                                    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.08] bg-[#181b21] px-2 py-1 text-[10px] font-sans text-[#b8bec7] opacity-0 shadow-xl transition group-hover:opacity-100">
                                        Click to inspect
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-center text-[12px] text-[#9aa1ac]">
                            Click a table name to see its columns and sample data
                        </p>
                    </div>
                </div>

                <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
                    {starters.map((item) => (
                        <button
                            key={item.title}
                            onClick={() => {
                                setQuestion(item.query);
                                onSubmit(item.query);
                            }}
                            disabled={loading}
                            className="group flex cursor-pointer items-start rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-blue-400/30 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#e4e7ec]">
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
                        className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] p-4"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        <div>
                            <p className="text-sm font-semibold text-rose-200">
                                The query didn't run
                            </p>
                            <p className="mt-1 text-xs leading-5 text-rose-300/80">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div
                        className="mt-12 space-y-4"
                        aria-busy="true"
                        aria-label="Running database query"
                    >
                        <div className="h-16 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />

                        <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
                    </div>
                )}

                {currentResult && !loading && (
                    <div className="mt-12 space-y-5">
                        {isRejected ? (
                            <>
                                <div className="flex items-center gap-2.5">
                                    <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
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
                                        className={`h-2 w-2 rounded-full ${
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
                                {isValid && (
                                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                                    <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0f13] shadow-2xl">
                                        <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2.5 sm:px-4">
                                            <div
                                                role="tablist"
                                                className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-[#0b0d11] p-1"
                                            >
                                                {tabs.map(
                                                    ({
                                                        id,
                                                        label,
                                                        icon: Icon,
                                                    }) => {
                                                        const active =
                                                            activeResultTab ===
                                                            id;

                                                        return (
                                                            <button
                                                                key={id}
                                                                role="tab"
                                                                aria-selected={
                                                                    active
                                                                }
                                                                onClick={() =>
                                                                    setActiveResultTab(
                                                                        id
                                                                    )
                                                                }
                                                                className={`flex cursor-pointer items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                                                                    active
                                                                        ? 'bg-white/[0.09] text-white'                                                                      : 'text-[#7b818a] hover:text-slate-200'
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

                                        <div className="p-4 sm:p-6">
                                            {activeResultTab ===
                                                'viz' && (
                                                <VisualizerCard
                                                    chartType={currentResult.chart_type}
                                                    chartConfig={currentResult.chart_config}
                                                    summary={currentResult.analyst_summary}
                                                    data={currentResult.df_result}
                                                />
                                            )}
                                            {activeResultTab ===
                                                'data' &&
                                                (hasRows ? (
                                                    <div className="overflow-x-auto">
                                                        <DataTable
                                                            data={currentResult.df_result}
                                                            columns={currentResult.columns}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="py-14 text-center">
                                                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
                                                            <ShoppingBag className="h-4 w-4 text-[#6b727c]" />
                                                        </div>
                                                        <p className="text-sm font-medium text-[#d8dce1]">
                                                            No rows returned
                                                        </p>
                                                        <p className="mt-1 text-xs text-[#6b727c]">
                                                            The query ran successfully,
                                                            but nothing matched.
                                                        </p>
                                                    </div>
                                                ))}
                                            {activeResultTab ===
                                                'sql' && (
                                                <SqlCodeBlock
                                                    code={currentResult.sql_query}
                                                    repairHistory={repairHistory}
                                                />
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
