import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Activity,
  Zap,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw,
  User,
  PieChart as PieIcon,
  BarChart3 as BarIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export function UserDashboard({ user, onRequireLogin }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (user?.id) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/user/dashboard?user_id=${user.id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to fetch dashboard telemetry');
      }
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white">Google Authentication Required</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sign in with your Google Account to unlock personal LLM usage metrics, token consumption analysis, and individual cost tracking via Langfuse.
        </p>
        <button
          onClick={onRequireLogin}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-500/25"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const recentQueries = dashboardData?.recent_queries || [];

  // Format query history for chart
  const chartData = [...recentQueries].reverse().map((q, idx) => ({
    index: `#${idx + 1}`,
    cost: q.cost_usd || 0,
    tokens: q.total_tokens || 0,
    latency: q.latency_ms || 0
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* User Header Profile */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-2xl border-2 border-indigo-500/40 shadow-md" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center">
              {user.name?.[0] || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified User ID #{user.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total LLM Cost</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">${summary.aggregate_cost_usd?.toFixed(6)}</p>
          <p className="text-[11px] text-slate-500">Tracked in Langfuse for User #{user.id}</p>
        </div>

        {/* Total Tokens */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Tokens</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{summary.aggregate_tokens?.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">
            Prompt: {summary.aggregate_prompt_tokens?.toLocaleString()} | Compl: {summary.aggregate_completion_tokens?.toLocaleString()}
          </p>
        </div>

        {/* Total Queries */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Queries</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{summary.total_queries}</p>
          <p className="text-[11px] text-slate-500">Executed with self-healing</p>
        </div>

        {/* Avg Latency */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Latency</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{(summary.avg_latency_ms / 1000)?.toFixed(2)}s</p>
          <p className="text-[11px] text-slate-500">Average execution time</p>
        </div>
      </div>

      {/* Cost & Token Analytics Chart */}
      {chartData.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarIcon className="w-4 h-4 text-purple-400" />
            Personal LLM Token &amp; Cost Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="index" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#a855f7" fillOpacity={1} fill="url(#costGrad)" name="Tokens Consumed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Query & Telemetry Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            User Query History &amp; Langfuse Telemetry
          </h4>
          <span className="text-xs text-slate-400">{recentQueries.length} records</span>
        </div>

        {recentQueries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No queries logged yet. Ask questions in the AI Query Studio to track your costs!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Time</th>
                  <th className="py-3 px-4 font-semibold">Question</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Tokens</th>
                  <th className="py-3 px-4 font-semibold">Cost ($)</th>
                  <th className="py-3 px-4 font-semibold">Langfuse Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentQueries.map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">{q.question}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {q.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Success
                        </span>
                      ) : q.status === 'repaired' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <ShieldCheck className="w-3 h-3" /> Auto-Repaired ({q.retry_count} retries)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">{q.total_tokens?.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-purple-300 font-semibold">${q.cost_usd?.toFixed(6)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <a
                        href={q.langfuse_trace_id ? `https://us.cloud.langfuse.com/trace/${q.langfuse_trace_id}` : `https://us.cloud.langfuse.com`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
                      >
                        <span>{q.langfuse_trace_id || 'trace-log'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
