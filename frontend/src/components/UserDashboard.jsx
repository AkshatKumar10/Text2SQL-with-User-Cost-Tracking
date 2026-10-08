// import React, { useState, useEffect } from 'react';
// import {
//   DollarSign,
//   Activity,
//   Zap,
//   Clock,
//   ExternalLink,
//   ShieldCheck,
//   CheckCircle2,
//   AlertTriangle,
//   Layers,
//   Sparkles,
//   RefreshCw,
//   User,
//   PieChart as PieIcon,
//   BarChart3 as BarIcon
// } from 'lucide-react';
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   AreaChart,
//   Area
// } from 'recharts';

// export function UserDashboard({ user, onRequireLogin }) {
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const API_URL = import.meta.env.VITE_API_URL;
//   useEffect(() => {
//     if (user?.id) {
//       fetchDashboard();
//     } else {
//       setLoading(false);
//     }
//   }, [user]);

//   const fetchDashboard = async () => {
//     if (!user?.id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_URL}/api/user/dashboard?user_id=${user.id}`);
//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.detail || 'Failed to fetch dashboard telemetry');
//       }
//       setDashboardData(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
//         <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
//           <User className="w-7 h-7" />
//         </div>
//         <h3 className="text-xl font-bold text-white">Google Authentication Required</h3>
//         <p className="text-xs text-slate-400 leading-relaxed">
//           Sign in with your Google Account to unlock personal LLM usage metrics, token consumption analysis, and individual cost tracking via Langfuse.
//         </p>
//         <button
//           onClick={onRequireLogin}
//           className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-500/25"
//         >
//           Sign in with Google
//         </button>
//       </div>
//     );
//   }

//   const summary = dashboardData?.summary || {};
//   const recentQueries = dashboardData?.recent_queries || [];

//   // Format query history for chart
//   const chartData = [...recentQueries].reverse().map((q, idx) => ({
//     index: `#${idx + 1}`,
//     cost: q.cost_usd || 0,
//     tokens: q.total_tokens || 0,
//     latency: q.latency_ms || 0
//   }));

//   return (
//     <div className="space-y-8 pb-12">
//       {/* User Header Profile */}
//       <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
//         <div className="flex items-center gap-4">
//           {user.picture ? (
//             <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-2xl border-2 border-indigo-500/40 shadow-md" />
//           ) : (
//             <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center">
//               {user.name?.[0] || 'U'}
//             </div>
//           )}
//           <div>
//             <div className="flex items-center gap-2">
//               <h2 className="text-xl font-bold text-white">{user.name}</h2>
//               <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
//                 Verified User ID #{user.id}
//               </span>
//             </div>
//             <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
//           </div>
//         </div>

//         <button
//           onClick={fetchDashboard}
//           disabled={loading}
//           className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
//         >
//           <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
//           <span>Refresh Telemetry</span>
//         </button>
//       </div>

//       {/* KPI Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {/* Total Cost */}
//         <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total LLM Cost</span>
//             <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
//               <DollarSign className="w-4 h-4" />
//             </div>
//           </div>
//           <p className="text-2xl font-black text-white">${summary.aggregate_cost_usd?.toFixed(6)}</p>
//           <p className="text-[11px] text-slate-500">Tracked in Langfuse for User #{user.id}</p>
//         </div>

//         {/* Total Tokens */}
//         <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Tokens</span>
//             <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
//               <Zap className="w-4 h-4" />
//             </div>
//           </div>
//           <p className="text-2xl font-black text-white">{summary.aggregate_tokens?.toLocaleString()}</p>
//           <p className="text-[11px] text-slate-500">
//             Prompt: {summary.aggregate_prompt_tokens?.toLocaleString()} | Compl: {summary.aggregate_completion_tokens?.toLocaleString()}
//           </p>
//         </div>

//         {/* Total Queries */}
//         <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Queries</span>
//             <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
//               <Activity className="w-4 h-4" />
//             </div>
//           </div>
//           <p className="text-2xl font-black text-white">{summary.total_queries}</p>
//           <p className="text-[11px] text-slate-500">Executed with self-healing</p>
//         </div>

//         {/* Avg Latency */}
//         <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Latency</span>
//             <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
//               <Clock className="w-4 h-4" />
//             </div>
//           </div>
//           <p className="text-2xl font-black text-white">{(summary.avg_latency_ms / 1000)?.toFixed(2)}s</p>
//           <p className="text-[11px] text-slate-500">Average execution time</p>
//         </div>
//       </div>

//       {/* Cost & Token Analytics Chart */}
//       {chartData.length > 0 && (
//         <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
//           <h3 className="text-sm font-bold text-white flex items-center gap-2">
//             <BarIcon className="w-4 h-4 text-purple-400" />
//             Personal LLM Token &amp; Cost Trend
//           </h3>
//           <div className="h-64 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
//                 <XAxis dataKey="index" stroke="#64748b" fontSize={11} />
//                 <YAxis stroke="#64748b" fontSize={11} />
//                 <Tooltip
//                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
//                 />
//                 <Area type="monotone" dataKey="tokens" stroke="#a855f7" fillOpacity={1} fill="url(#costGrad)" name="Tokens Consumed" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}

//       {/* Detailed Query & Telemetry Log Table */}
//       <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
//         <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
//           <h4 className="text-sm font-bold text-white flex items-center gap-2">
//             <Sparkles className="w-4 h-4 text-cyan-400" />
//             User Query History &amp; Langfuse Telemetry
//           </h4>
//           <span className="text-xs text-slate-400">{recentQueries.length} records</span>
//         </div>

//         {recentQueries.length === 0 ? (
//           <div className="p-8 text-center text-slate-500 text-xs">
//             No queries logged yet. Ask questions in the AI Query Studio to track your costs!
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-xs border-collapse">
//               <thead>
//                 <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
//                   <th className="py-3 px-4 font-semibold">Time</th>
//                   <th className="py-3 px-4 font-semibold">Question</th>
//                   <th className="py-3 px-4 font-semibold">Status</th>
//                   <th className="py-3 px-4 font-semibold">Tokens</th>
//                   <th className="py-3 px-4 font-semibold">Cost ($)</th>
//                   <th className="py-3 px-4 font-semibold">Langfuse Trace</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-800/60">
//                 {recentQueries.map((q, idx) => (
//                   <tr key={idx} className="hover:bg-slate-800/30 transition">
//                     <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
//                       {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </td>
//                     <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">{q.question}</td>
//                     <td className="py-3 px-4 whitespace-nowrap">
//                       {q.status === 'success' ? (
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
//                           <CheckCircle2 className="w-3 h-3" /> Success
//                         </span>
//                       ) : q.status === 'repaired' ? (
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
//                           <ShieldCheck className="w-3 h-3" /> Auto-Repaired ({q.retry_count} retries)
//                         </span>
//                       ) : (
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
//                           <AlertTriangle className="w-3 h-3" /> Failed
//                         </span>
//                       )}
//                     </td>
//                     <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">{q.total_tokens?.toLocaleString()}</td>
//                     <td className="py-3 px-4 font-mono text-purple-300 font-semibold">${q.cost_usd?.toFixed(6)}</td>
//                     <td className="py-3 px-4 whitespace-nowrap">
//                       <a
//                         href={q.langfuse_trace_id ? `https://us.cloud.langfuse.com/trace/${q.langfuse_trace_id}` : `https://us.cloud.langfuse.com`}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
//                       >
//                         <span>{q.langfuse_trace_id || 'trace-log'}</span>
//                         <ExternalLink className="w-3 h-3" />
//                       </a>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
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

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const fmtInt = (v) => num(v).toLocaleString();
const fmtCost = (v) => `$${num(v) < 0.01 ? num(v).toFixed(6) : num(v).toFixed(4)}`;
const fmtSeconds = (ms) => `${(num(ms) / 1000).toFixed(2)}s`;
const compact = (v) =>
  new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(v);

const metrics = {
  tokens: { label: 'Tokens', color: '#60a5fa', format: fmtInt, axis: compact },
  cost: { label: 'Cost', color: '#a78bfa', format: fmtCost, axis: (v) => `$${v}` },
  latency: { label: 'Latency', color: '#34d399', format: fmtSeconds, axis: (v) => `${(v / 1000).toFixed(1)}s` },
};

function Metric({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="bg-[#0d1017] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{value}</p>
      <p className="mt-1.5 truncate text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function StatusBadge({ status, retries }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> Success
      </span>
    );
  }
  if (status === 'repaired') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-400">
        <RotateCcw className="h-3 w-3" /> Repaired{retries ? ` (${retries})` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-400">
      <AlertTriangle className="h-3 w-3" /> Failed
    </span>
  );
}

function ChartTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#0d0f13]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur">
      <p className="text-[11px] text-slate-400">Query {label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-white">{metrics[metric].format(payload[0].value)}</p>
    </div>
  );
}

export function UserDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState('tokens');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/user/dashboard');
      setDashboardData(response.data);
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

  const summary = dashboardData?.summary || {};
  const recentQueries = dashboardData?.recent_queries || [];
  console.log(summary);
  const chartData = [...recentQueries].reverse().map((q, idx) => ({
    index: idx + 1,
    tokens: num(q.total_tokens),
    cost: num(q.cost_usd),
    latency: num(q.latency_ms),
  }));

  const m = metrics[metric];
  const firstLoad = loading && !dashboardData;

  return (
    <main className="relative w-full text-slate-100">
      <div className="pointer-events-none absolute right-20 top-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 p-3.5 text-blue-400 shadow-lg shadow-blue-500/10">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
              <p className="mt-1 text-sm text-slate-400">Your token usage, costs and recent queries</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-200">Couldn't load your usage</p>
              <p className="mt-1 break-words text-xs leading-5 text-rose-300/80">{error}</p>
            </div>
            <button
              onClick={fetchDashboard}
              className="shrink-0 cursor-pointer rounded-lg border border-rose-400/20 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-400/10"
            >
              Try again
            </button>
          </div>
        )}

        {/* KPIs */}
        {firstLoad ? (
          <div className="h-36 animate-pulse rounded-3xl border border-slate-800/80 bg-slate-900/40" />
        ) : (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-800/60 shadow-2xl lg:grid-cols-4">
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
              hint={`${fmtInt(summary.aggregate_prompt_tokens)} in / ${fmtInt(summary.aggregate_completion_tokens)} out`}
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
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Usage per query</h3>
                <p className="mt-0.5 text-xs text-slate-500">Last {chartData.length} queries, oldest to newest</p>
              </div>

              <div role="tablist" className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-[#0b0d11] p-1">
                {Object.entries(metrics).map(([id, cfg]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={metric === id}
                    onClick={() => setMetric(id)}
                    className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-medium transition ${metric === id ? 'bg-white/[0.09] text-white' : 'text-slate-500 hover:text-slate-200'
                      }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={m.color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="index"
                    tick={{ fill: '#7b818a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  />
                  <YAxis
                    tick={{ fill: '#7b818a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={m.axis}
                    width={52}
                  />
                  <Tooltip
                    content={<ChartTooltip metric={metric} />}
                    cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke={m.color}
                    strokeWidth={2.5}
                    fill={`url(#grad-${metric})`}
                    dot={{ r: 3, fill: '#0d1017', stroke: m.color, strokeWidth: 2 }}
                    activeDot={{ r: 5.5, fill: m.color, stroke: '#0d1017', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History */}
        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Query history</h3>
              <p className="mt-0.5 text-xs text-slate-500">With cost and trace details for each question</p>
            </div>
            <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 font-mono text-xs text-slate-300">
              {recentQueries.length} records
            </span>
          </div>

          {firstLoad ? (
            <div className="space-y-3 p-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-white/[0.03]" />
              ))}
            </div>
          ) : recentQueries.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-200">No queries yet</p>
              <p className="mt-1 text-xs text-slate-500">Ask a question in Query Studio and it will show up here.</p>
            </div>
          ) : (
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-800 bg-[#0b0e14] text-slate-400">
                    <th className="px-6 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Question</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Tokens</th>
                    <th className="px-4 py-3 text-right font-medium">Cost</th>
                    <th className="px-6 py-3 font-medium">Trace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentQueries.map((q) => {
                    const when = new Date(q.created_at);
                    const valid = !Number.isNaN(when.getTime());
                    return (
                      <tr key={q.id} className="transition-colors hover:bg-white/[0.025]">
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <p className="text-slate-200">
                            {valid ? when.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '-'}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                            {valid ? when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </td>
                        <td className="max-w-[320px] px-4 py-3.5">
                          <p className="truncate text-slate-200" title={q.question}>
                            {q.question}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={q.status} retries={q.retry_count} />
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-300">{fmtInt(q.total_tokens)}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-300">{fmtCost(q.cost_usd)}</td>
                        <td className="whitespace-nowrap px-6 py-3.5">
                          {q.langfuse_trace_id ? (
                            <a
                              href={`${LANGFUSE_URL}/trace/${q.langfuse_trace_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-blue-400 transition hover:text-blue-300"
                            >
                              {q.langfuse_trace_id.slice(0, 8)}
                              <ExternalLink className="h-3 w-3" />
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
      </div>
    </main>
  );
}