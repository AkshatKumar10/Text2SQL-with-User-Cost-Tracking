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
    <main className="relative w-full min-w-0 overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-blue-500/[0.06] blur-3xl sm:right-10 sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-72 w-72 rounded-full bg-indigo-500/[0.05] blur-3xl sm:left-10 sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-6 px-4 pb-16 sm:space-y-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl border border-slate-800 bg-slate-800/60 sm:h-[58px] sm:w-[58px]" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-6 w-28 animate-pulse rounded-lg bg-slate-800/70 sm:h-7" />
              <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-slate-800/50" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="min-w-0 rounded-2xl border border-slate-800/80 bg-[#0d1017] p-4 sm:p-5 lg:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-800/70" />
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-800/60" />
              </div>

              <div className="mt-4 h-7 w-28 max-w-full animate-pulse rounded-lg bg-slate-800/70 sm:h-8" />
              <div className="mt-2 h-3 w-36 max-w-full animate-pulse rounded bg-slate-800/50" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-800/70" />
              <div className="h-3 w-52 max-w-full animate-pulse rounded bg-slate-800/50" />
            </div>

            <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-white/[0.06] bg-[#0b0d11] p-1 sm:w-fit">
              <div className="h-7 min-w-16 flex-1 animate-pulse rounded-md bg-slate-800/70 sm:flex-none" />
              <div className="h-7 min-w-16 flex-1 animate-pulse rounded-md bg-slate-800/50 sm:flex-none" />
              <div className="h-7 min-w-16 flex-1 animate-pulse rounded-md bg-slate-800/50 sm:flex-none" />
            </div>
          </div>

          <div className="mt-6 h-52 w-full animate-pulse rounded-xl bg-slate-800/20 sm:h-64" />
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-2xl backdrop-blur-xl sm:rounded-3xl">
          <div className="flex flex-col gap-3 border-b border-slate-800/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-800/70" />
              <div className="h-3 w-72 max-w-full animate-pulse rounded bg-slate-800/50" />
            </div>

            <div className="h-7 w-20 animate-pulse rounded-full bg-slate-800/60" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0b0e14]">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <th key={item} className="px-4 py-3 sm:px-6">
                      <div className="h-3 w-16 animate-pulse rounded bg-slate-800/60" />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
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

                    <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                      <div className="h-3.5 w-20 animate-pulse rounded bg-slate-800/40" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
    <div className="min-w-0 bg-[#0d1017] p-4 sm:p-5 lg:p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-slate-400 sm:text-xs">
          {label}
        </span>

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 break-words font-mono text-xl font-semibold tracking-tight text-white min-[420px]:text-2xl sm:mt-4 sm:text-[28px]">
        {value}
      </p>

      <p className="mt-1.5 truncate text-[11px] text-slate-500 sm:text-xs">
        {hint}
      </p>
    </div>
  );
}

function StatusBadge({ status, retries }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        Success
      </span>
    );
  }

  if (status === 'repaired') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-400">
        <RotateCcw className="h-3 w-3 shrink-0" />
        Repaired{retries ? ` (${retries})` : ''}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-400">
      <AlertTriangle className="h-3 w-3 shrink-0" />
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
    <main className="relative w-full min-w-0 overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl sm:right-10 sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl sm:left-10 sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-6 px-4 pb-16 sm:space-y-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="shrink-0 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 p-3 text-blue-400 shadow-lg shadow-blue-500/10 sm:p-3.5">
              <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Overview
              </h1>

              <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
                Your token usage, costs and recent query activity
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex min-w-0 flex-col gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-3.5 sm:flex-row sm:items-start sm:gap-3 sm:p-4"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-200">
                  Couldn't load your usage
                </p>

                <p className="mt-1 break-words text-xs leading-5 text-rose-300/80">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                fetchDashboard(dashboardPagination.page)
              }
              className="w-full shrink-0 cursor-pointer rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-400/10 sm:w-auto sm:py-1.5"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-800/60 shadow-2xl min-[420px]:grid-cols-2 min-[420px]:gap-px sm:rounded-3xl lg:grid-cols-4">
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
          <div className="my-6 min-w-0 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-xl sm:my-8 sm:rounded-3xl sm:p-6 lg:my-10 lg:p-8">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white">
                  Usage per query
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Last {chartData.length} queries, oldest to newest
                </p>
              </div>

              <div
                role="tablist"
                className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-white/[0.06] bg-[#0b0d11] p-1 sm:w-fit"
              >
                {Object.entries(metrics).map(([id, cfg]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={metric === id}
                    onClick={() => setMetric(id)}
                    className={`min-w-0 flex-1 cursor-pointer whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition sm:flex-none sm:px-3.5 sm:py-1.5 ${
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

            <div className="mt-5 h-52 w-full min-w-0 sm:mt-6 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
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
                    width={45}
                  />

                  <Tooltip
                    content={<ChartTooltip metric={metric} />}
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

        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 shadow-2xl backdrop-blur-xl sm:rounded-3xl">
          <div className="flex flex-col gap-3 border-b border-slate-800/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">
                Recent Usage
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Usage and execution details for your recent queries
              </p>
            </div>

            <span className="w-fit shrink-0 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 font-mono text-xs text-slate-300">
              {dashboardPagination.total} records
            </span>
          </div>

          {recentQueries.length === 0 ? (
            <div className="px-4 py-12 text-center sm:px-6 sm:py-16">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
                <Activity className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-slate-200">
                No queries yet
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                Ask a question in Query Studio and it will show up here.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-800 bg-[#0b0e14] text-slate-400">
                    <th className="whitespace-nowrap px-4 py-3 font-medium sm:px-6">
                      When
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Question
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                      Tokens
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                      Cost
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-medium sm:px-6">
                      Trace
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {recentQueries.map((q) => {
                    const when = new Date(q.created_at);
                    const valid = !Number.isNaN(when.getTime());

                    return (
                      <tr
                        key={q.id}
                        className="transition-colors hover:bg-white/[0.025]"
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                          <p className="text-slate-200">
                            {valid
                              ? when.toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </p>

                          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                            {valid
                              ? when.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
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

                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-slate-300">
                          {fmtInt(q.total_tokens)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-slate-300">
                          {fmtCost(q.cost_usd)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                          {q.langfuse_trace_id ? (
                            <a
                              href={`${LANGFUSE_URL}/trace/${q.langfuse_trace_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-blue-400 transition hover:text-blue-300"
                            >
                              {q.langfuse_trace_id.slice(0, 8)}

                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-600">-</span>
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
          <div className="flex flex-col gap-3 border-t border-slate-800/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
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

            <div className="flex w-full items-center gap-1.5 sm:w-auto">
              <button
                onClick={() =>
                  handleDashboardPage(dashboardPagination.page - 1)
                }
                disabled={dashboardPagination.page === 1 || loading}
                className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                Previous
              </button>

              <div className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-2 text-xs font-semibold text-blue-300">
                {dashboardPagination.page}
              </div>

              <button
                onClick={() =>
                  handleDashboardPage(dashboardPagination.page + 1)
                }
                disabled={
                  dashboardPagination.page ===
                    dashboardPagination.total_pages || loading
                }
                className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
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