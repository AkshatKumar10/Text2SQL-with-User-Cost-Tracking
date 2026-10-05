import React from 'react';
import { Bot, CheckCircle2, AlertTriangle, ShieldCheck, Database, Sparkles, BarChart2 } from 'lucide-react';

export function AgentWorkflowTracker({ latency, retryCount, repairHistory, isValid, error }) {
  const steps = [
    {
      id: 1,
      name: "Schema Understanding",
      desc: "SQLite metadata & relations inspection",
      status: "complete",
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30"
    },
    {
      id: 2,
      name: "SQL Generation",
      desc: "LLM synthesis & constraint alignment",
      status: "complete",
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30"
    },
    {
      id: 3,
      name: "Self-Healing Validator",
      desc: retryCount > 0 ? `Auto-repaired in ${retryCount} attempt(s)` : "Clean syntax & execution on attempt 1",
      status: isValid ? (retryCount > 0 ? "warning" : "complete") : "error",
      icon: ShieldCheck,
      color: retryCount > 0 ? "text-amber-400" : "text-emerald-400",
      bg: retryCount > 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"
    },
    {
      id: 4,
      name: "Data Analyst & Viz",
      desc: "BI insights & chart recommendation",
      status: isValid ? "complete" : "skipped",
      icon: BarChart2,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/30"
    }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-sm text-slate-200">LangGraph Agent Execution Chain</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 bg-slate-800/80 rounded-full font-mono text-cyan-300 border border-slate-700/60">
            ⚡ {latency}s latency
          </span>
          <span className={`px-2.5 py-1 rounded-full font-mono text-xs border ${
            retryCount === 0
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {retryCount === 0 ? '✓ 0 retries' : `⚠️ ${retryCount} self-repair(s)`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={st.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${st.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-slate-900/60 ${st.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {st.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {st.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">{st.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {retryCount > 0 && repairHistory && repairHistory.length > 0 && (
        <div className="mt-3 p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Agent Self-Repair Trace:</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {repairHistory.map((rep, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950/80 rounded-lg border border-amber-900/40 text-slate-300">
                <span className="text-amber-400 font-bold block mb-1">Attempt #{rep.attempt} Error: {rep.error}</span>
                <span className="text-slate-400 block text-[11px] whitespace-pre-wrap">Query: {rep.failed_sql}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
