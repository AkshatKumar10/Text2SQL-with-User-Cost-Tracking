import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
            <div className="mx-auto max-w-5xl pb-24">
                <div className="pt-2 text-center sm:pt-6">
                    {user && (
                        <div className="mx-auto mb- inline-flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-2 text-xs text-blue-200 shadow-sm backdrop-blur">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>
                                    Signed in as <strong className="text-white">{user.name}</strong>. Queries &amp; token costs are logged in Langfuse.
                                </span>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition shrink-0 cursor-pointer"
                            >
                                Dashboard <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-5xl">
                        Turn natural language into{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                            executable SQL
                        </span>
                    </h1>

                    <div className="relative mx-auto mt-8 max-w-3xl">
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
                                    placeholder="e.g. What is the total revenue generated by each product category?"
                                    className="w-full bg-transparent py-3 text-sm text-white placeholder-[#5a606c] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={run}
                                    disabled={loading || !question.trim()}
                                    className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 text-xs font-medium text-white transition hover:bg-blue-400 active:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Running
                                        </>
                                    ) : (
                                        <>
                                            Run
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="relative mt-4">
                            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#6b727c]">
                                <span className="flex items-center gap-1.5">
                                    <Database className="h-3.5 w-3.5" />
                                    Active Database Schema
                                </span>
                                <span className="text-[#343941]">
                                    /
                                </span>
                                {allTables.map((t) => {
                                    const tName = typeof t === 'string' ? t : t.name;
                                    const isCustom = typeof t === 'object' && t.is_custom;
                                    return (
                                        <button
                                            key={tName}
                                            type="button"
                                            onClick={() => handleTableClick(tName)}
                                            title={`Click to inspect ${tName}`}
                                            className={`group relative cursor-pointer rounded-md border px-2 py-0.5 font-mono text-[11px] transition focus:outline-none ${isCustom
                                                ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                                                : 'border-white/[0.07] bg-white/[0.025] text-[#8a919b] hover:border-blue-400/30 hover:bg-blue-400/[0.06] hover:text-blue-300'
                                                }`}
                                        >
                                            {tName}
                                            {isCustom && <span className="ml-1 text-[9px] text-indigo-400">(custom)</span>}
                                            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.08] bg-[#181b21] px-2 py-1 text-[10px] font-sans text-[#b8bec7] opacity-0 shadow-xl transition group-hover:opacity-100">
                                                Click to inspect schema
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-2 text-center text-[12px] text-[#9aa1ac]">
                                Click any table to inspect its schema columns &amp; sample data
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
                        {starters.map((item) => (
                            <button
                                key={item.title}
                                onClick={() => {
                                    setCurrentResult(null);
                                    setQuestion(item.query);
                                    onSubmit(item.query, false);
                                }}
                                disabled={loading}
                                className="group flex cursor-pointer items-start rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-blue-400/30 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-[#c0c6d0] group-hover:text-blue-400">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-xs text-[#6b727c]">
                                        {item.query}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {workflowError && !currentResult && (
                    <div className="mx-auto mt-8 flex max-w-3xl items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-xs text-rose-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{workflowError}</span>
                    </div>
                )}

                {loading && !currentResult && (
                    <div className="mt-12 space-y-6">
                        <AgentWorkflowTracker isLoading={true} />
                    </div>
                )}

                {currentResult && (
                    <div className="mt-12 space-y-6">
                        {currentResult.tokens && currentResult.tokens.total_tokens > 0 && (
                            <div className="rounded-2xl border border-white/[0.08] bg-[#101216] p-4 shadow-xl">
                                <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                                            <DollarSign className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-[#6b727c]">Estimated Query Cost</p>
                                            <p className="font-mono text-sm font-bold text-purple-300">
                                                ${currentResult.tokens.cost_usd?.toFixed(6)} USD
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex h-[58px] items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                                                <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" />
                                            </div>

                                            <div className="leading-tight">
                                                <p className="text-[10px] uppercase tracking-wider text-[#626975]">
                                                    Total Tokens
                                                </p>

                                                <div className="mt-1 flex items-baseline gap-2">
                                                    <span className="font-mono text-sm font-bold text-cyan-300">
                                                        {currentResult.tokens.total_tokens.toLocaleString()}
                                                    </span>

                                                    <span className="text-[10px] text-[#666d78]">
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
                                            <div className="flex h-[58px] min-w-0 items-center gap-3 rounded-xl border border-indigo-400/10 bg-indigo-500/[0.04] px-3.5">
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
                                                        className="mt-1 block max-w-[220px] truncate font-mono text-xs font-medium text-indigo-300 transition hover:text-indigo-200 hover:underline"
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
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-6 text-amber-200">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-400 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-amber-300">Question Unanswerable</h4>
                                        <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
                                            {answerabilityReason || "The system could not map this question to the available database tables."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <Stat icon={Rows3} label="Rows" value={rowCount} />
                                    <Stat icon={Columns3} label="Columns" value={colCount} />
                                    <Stat icon={Clock} label="Latency" value={latency} />
                                    <Stat icon={RefreshCw} label="SQL Repairs" value={retryCount} />
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101216]">
                                    <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-6">
                                        <div className="flex items-center gap-1 rounded-lg bg-white/[0.03] p-1">
                                            {tabs.map((t) => {
                                                const Icon = t.icon;
                                                const active = activeResultTab === t.id;
                                                return (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => setActiveResultTab(t.id)}
                                                        className={`flex cursor-pointer items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${active
                                                            ? 'bg-white/[0.09] text-white'
                                                            : 'text-[#7b818a] hover:text-slate-200'
                                                            }`}
                                                    >
                                                        <Icon
                                                            className={`h-3.5 w-3.5 ${active ? 'text-blue-400' : ''
                                                                }`}
                                                        />
                                                        {t.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-6">
                                        {activeResultTab === 'viz' && (
                                            <VisualizerCard
                                                chartType={currentResult.chart_type}
                                                chartConfig={currentResult.chart_config}
                                                summary={currentResult.analyst_summary}
                                                data={currentResult.df_result}
                                            />
                                        )}
                                        {activeResultTab === 'data' &&
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
                                                        The query ran successfully, but returned no matching data.
                                                    </p>
                                                </div>
                                            ))}
                                        {activeResultTab === 'sql' && (
                                            <SqlCodeBlock
                                                code={currentResult.sql_query}
                                                repairHistory={repairHistory}
                                            />
                                        )}
                                    </div>
                                </div>
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
