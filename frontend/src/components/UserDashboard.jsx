import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Activity,
  Zap,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../api/axiosClient';

const LANGFUSE_URL = import.meta.env.VITE_LANGFUSE_URL;

const num = (v) =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;

const fmtInt = (v) => num(v).toLocaleString();

const fmtCost = (v) =>
  `$${num(v) < 0.01 ? num(v).toFixed(6) : num(v).toFixed(4)}`;

const fmtSeconds = (ms) =>
  `${(num(ms) / 1000).toFixed(2)}s`;

const compact = (v) =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(v);

const metrics = {
  tokens: {
    label: 'Tokens',
    color: '#60a5fa',
    format: fmtInt,
    axis: compact,
  },
  cost: {
    label: 'Cost',
    color: '#a78bfa',
    format: fmtCost,
    axis: (v) => `$${v}`,
  },
  latency: {
    label: 'Latency',
    color: '#34d399',
    format: fmtSeconds,
    axis: (v) => `${(v / 1000).toFixed(1)}s`,
  },
};

function DashboardLoading() {
  return (
    <main className="relative w-full text-slate-100">
      <div className="pointer-events-none absolute right-20 top-10 h-96 w-96 rounded-full bg-blue-500/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-10 h-96 w-96 rounded-full bg-indigo-500/[0.05] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-3 pb-16">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="h-[58px] w-[58px] animate-pulse rounded-2xl border border-slate-800 bg-slate-800/60" />

            <div className="space-y-2">
              <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-800/70" />
              <div className="h-4 w-72 max-w-[70vw] animate-pulse rounded-md bg-slate-800/50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-800/60 shadow-2xl lg:grid-cols-4 mt-10">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-[#0d1017] p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-800/70" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-800/60" />
              </div>

              <div className="mt-4 h-8 w-28 animate-pulse rounded-lg bg-slate-800/70" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-800/50" />
            </div>
          ))}
        </div>

        <div className="my-10 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-800/70" />
              <div className="h-3 w-52 animate-pulse rounded bg-slate-800/50" />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-[#0b0d11] p-1">
              <div className="h-7 w-16 animate-pulse rounded-md bg-slate-800/70" />
              <div className="h-7 w-16 animate-pulse rounded-md bg-slate-800/50" />
              <div className="h-7 w-16 animate-pulse rounded-md bg-slate-800/50" />
            </div>
          </div>

          <div className="mt-6 h-64 w-full animate-pulse rounded-xl bg-slate-800/20" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-800/70" />
              <div className="h-3 w-72 max-w-[60vw] animate-pulse rounded bg-slate-800/50" />
            </div>

            <div className="h-7 w-20 animate-pulse rounded-full bg-slate-800/60" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0b0e14]">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <th key={item} className="px-6 py-3">
                      <div className="h-3 w-16 animate-pulse rounded bg-slate-800/60" />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <div className="space-y-2">
                        <div className="h-3.5 w-16 animate-pulse rounded bg-slate-800/60" />
                        <div className="h-3 w-12 animate-pulse rounded bg-slate-800/40" />
                      </div>
                    </td>

                    <td className="max-w-[320px] px-4 py-3.5">
                      <div className="h-3.5 w-full max-w-[280px] animate-pulse rounded bg-slate-800/60" />
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="h-6 w-16 animate-pulse rounded-md bg-slate-800/50" />
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="ml-auto h-3.5 w-16 animate-pulse rounded bg-slate-800/50" />
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="ml-auto h-3.5 w-14 animate-pulse rounded bg-slate-800/50" />
                    </td>

                    <td className="whitespace-nowrap px-6 py-3.5">
                      <div className="h-3.5 w-20 animate-pulse rounded bg-slate-800/40" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/70 pt-4">
          <div className="h-3.5 w-40 animate-pulse rounded bg-slate-800/50" />

          <div className="flex items-center gap-1.5">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-800/60" />
            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-800/60" />
            <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-800/60" />
          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="bg-[#0d1017] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          {label}
        </span>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
        {value}
      </p>

      <p className="mt-1.5 truncate text-xs text-slate-500">
        {hint}
      </p>
    </div>
  );
}

function StatusBadge({ status, retries }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Success
      </span>
    );
  }

  if (status === 'repaired') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-400">
        <RotateCcw className="h-3 w-3" />
        Repaired{retries ? ` (${retries})` : ''}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-400">
      <AlertTriangle className="h-3 w-3" />
      Failed
    </span>
  );
}

function ChartTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#0d0f13]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur">
      <p className="text-[11px] text-slate-400">
        Query {label}
      </p>

      <p className="mt-0.5 font-mono text-sm font-semibold text-white">
        {metrics[metric].format(payload[0].value)}
      </p>
    </div>
  );
}

export function UserDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState('tokens');

  const [dashboardPagination, setDashboardPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchDashboard(1);
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchDashboard = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/user/dashboard', {
        params: {
          page,
          limit: 10,
        },
      });

      setDashboardData(response.data);

      setDashboardPagination(
        response.data.pagination || {
          page,
          limit: 10,
          total: 0,
          total_pages: 0,
        }
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load your usage data.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardPage = (page) => {
    if (
      page < 1 ||
      page > dashboardPagination.total_pages ||
      page === dashboardPagination.page
    ) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    fetchDashboard(page);
  };

  const summary = dashboardData?.summary || {};
  const recentQueries = dashboardData?.recent_queries || [];
  const usageChart = dashboardData?.usage_chart || [];

  const chartData = [...usageChart]
    .reverse()
    .map((q, idx) => ({
      index: idx + 1,
      tokens: num(q.total_tokens),
      cost: num(q.cost_usd),
      latency: num(q.latency_ms),
    }));

  const m = metrics[metric];
  const firstLoad = loading && !dashboardData;

  if (firstLoad) {
    return <DashboardLoading />;
  }

  return (
    <main className="relative w-full text-slate-100">
      <div className="pointer-events-none absolute right-20 top-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-3 pb-16">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 p-3.5 text-blue-400 shadow-lg shadow-blue-500/10">
              <LayoutDashboard className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Overview
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Your token usage, costs and recent query activity
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-4"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-200">
                Couldn't load your usage
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-rose-300/80">
                {error}
              </p>
            </div>

            <button
              onClick={() =>
                fetchDashboard(dashboardPagination.page)
              }
              className="shrink-0 cursor-pointer rounded-lg border border-rose-400/20 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-400/10"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-800/60 shadow-2xl lg:grid-cols-4 mt-10">
          <Metric
            icon={DollarSign}
            label="Total cost"
            value={fmtCost(summary.aggregate_cost_usd)}
            hint="Estimated LLM spend"
            tone="text-violet-400"
          />

          <Metric
            icon={Zap}
            label="Total tokens"
            value={fmtInt(summary.aggregate_tokens)}
            hint={`${fmtInt(
              summary.aggregate_prompt_tokens
            )} in / ${fmtInt(
              summary.aggregate_completion_tokens
            )} out`}
            tone="text-blue-400"
          />

          <Metric
            icon={Activity}
            label="Queries"
            value={fmtInt(summary.total_queries)}
            hint="Questions you've asked"
            tone="text-sky-400"
          />

          <Metric
            icon={Clock}
            label="Avg latency"
            value={fmtSeconds(summary.avg_latency_ms)}
            hint="Time per query"
            tone="text-emerald-400"
          />
        </div>

        {chartData.length > 0 && (
          <div className="my-10 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Usage per query
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Last {chartData.length} queries, oldest to newest
                </p>
              </div>

              <div
                role="tablist"
                className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-[#0b0d11] p-1"
              >
                {Object.entries(metrics).map(([id, cfg]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={metric === id}
                    onClick={() => setMetric(id)}
                    className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                      metric === id
                        ? 'bg-white/[0.09] text-white'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 8,
                    right: 8,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id={`grad-${metric}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={m.color}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={m.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="index"
                    tick={{
                      fill: '#7b818a',
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={{
                      stroke: 'rgba(255,255,255,0.06)',
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: '#7b818a',
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={m.axis}
                    width={52}
                  />

                  <Tooltip
                    content={
                      <ChartTooltip metric={metric} />
                    }
                    cursor={{
                      stroke: 'rgba(255,255,255,0.15)',
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke={m.color}
                    strokeWidth={2.5}
                    fill={`url(#grad-${metric})`}
                    dot={{
                      r: 3,
                      fill: '#0d1017',
                      stroke: m.color,
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 5.5,
                      fill: m.color,
                      stroke: '#0d1017',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Recent Usage
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Usage and execution details for your recent queries
              </p>
            </div>

            <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 font-mono text-xs text-slate-300">
              {dashboardPagination.total} records
            </span>
          </div>

          {recentQueries.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
                <Activity className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-slate-200">
                No queries yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Ask a question in Query Studio and it will show up here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-800 bg-[#0b0e14] text-slate-400">
                    <th className="px-6 py-3 font-medium">
                      When
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Question
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Tokens
                    </th>

                    <th className="py-3 pl-5 pr-2 text-center font-medium">
                      Cost
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Trace
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {recentQueries.map((q) => {
                    const when = new Date(q.created_at);
                    const valid = !Number.isNaN(
                      when.getTime()
                    );

                    return (
                      <tr
                        key={q.id}
                        className="transition-colors hover:bg-white/[0.025]"
                      >
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <p className="text-slate-200">
                            {valid
                              ? when.toLocaleDateString(
                                  [],
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )
                              : '-'}
                          </p>

                          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                            {valid
                              ? when.toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                              : ''}
                          </p>
                        </td>

                        <td className="max-w-[320px] px-4 py-3.5">
                          <p
                            className="truncate text-slate-200"
                            title={q.question}
                          >
                            {q.question}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <StatusBadge
                            status={q.status}
                            retries={q.retry_count}
                          />
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                          {fmtInt(q.total_tokens)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                          {fmtCost(q.cost_usd)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-3.5">
                          {q.langfuse_trace_id ? (
                            <a
                              href={`${LANGFUSE_URL}/trace/${q.langfuse_trace_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-blue-400 transition hover:text-blue-300"
                            >
                              {q.langfuse_trace_id.slice(
                                0,
                                8
                              )}

                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-slate-600">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {dashboardPagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800/70 pt-4">
            <p className="text-xs text-slate-500">
              Showing{' '}
              <span className="font-medium text-slate-300">
                {(dashboardPagination.page - 1) *
                  dashboardPagination.limit +
                  1}
              </span>{' '}
              -{' '}
              <span className="font-medium text-slate-300">
                {Math.min(
                  dashboardPagination.page *
                    dashboardPagination.limit,
                  dashboardPagination.total
                )}
              </span>{' '}
              of{' '}
              <span className="font-medium text-slate-300">
                {dashboardPagination.total}
              </span>
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  handleDashboardPage(
                    dashboardPagination.page - 1
                  )
                }
                disabled={
                  dashboardPagination.page === 1 ||
                  loading
                }
                className="flex h-8 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-2 text-xs font-semibold text-blue-300">
                {dashboardPagination.page}
              </div>

              <button
                onClick={() =>
                  handleDashboardPage(
                    dashboardPagination.page + 1
                  )
                }
                disabled={
                  dashboardPagination.page ===
                    dashboardPagination.total_pages ||
                  loading
                }
                className="flex h-8 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}