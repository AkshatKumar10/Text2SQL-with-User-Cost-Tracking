import React, { useState } from 'react';
import { Check, Wrench, X, Minus, ChevronDown, Code2, RotateCcw, Loader2 } from 'lucide-react';

const tones = {
  running: {
    icon: Loader2,
    text: 'Running',
    circle: 'border-blue-400/50 bg-blue-500/10 text-blue-400 animate-spin',
    label: 'text-blue-400/90 font-medium',
  },
  pending: {
    icon: Minus,
    text: 'Pending',
    circle: 'border-white/[0.08] bg-white/[0.02] text-slate-600',
    label: 'text-slate-600',
  },
  done: {
    icon: Check,
    text: 'Done',
    circle: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400',
    label: 'text-slate-500',
  },
  fixed: {
    icon: Wrench,
    text: 'Fixed automatically',
    circle: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
    label: 'text-amber-400/80',
  },
  failed: {
    icon: X,
    text: 'Failed',
    circle: 'border-red-400/30 bg-red-400/10 text-red-400',
    label: 'text-red-400/80',
  },
  skipped: {
    icon: Minus,
    text: 'Skipped',
    circle: 'border-white/[0.08] bg-white/[0.02] text-slate-600',
    label: 'text-slate-600',
  },
};

export function AgentWorkflowTracker({
  retryCount = 0,
  repairHistory,
  isValid,
  error,
  isAnswerable = true, 
  answerabilityReason,
  isLoading = false,
}) {
  const [expanded, setExpanded] = useState({});
  const toggle = (idx) => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const answerable = isAnswerable !== false;
  const checkStatus = !isValid ? 'failed' : retryCount > 0 ? 'fixed' : 'done';

  const steps = isLoading
    ? [
        { name: 'Check question', status: 'running', text: 'Analyzing...' },
        { name: 'Write SQL', status: 'pending', text: 'Waiting...' },
        { name: 'Check SQL', status: 'pending', text: 'Waiting...' },
        { name: 'Show results', status: 'pending', text: 'Waiting...' },
      ]
    : answerable
    ? [
        { name: 'Check question', status: 'done' },
        { name: 'Write SQL', status: 'done' },
        { name: 'Check SQL', status: checkStatus },
        { name: 'Show results', status: isValid ? 'done' : 'skipped' },
      ]
    : [
        { name: 'Check question', status: 'failed', text: "Can't answer" },
        { name: 'Write SQL', status: 'skipped' },
        { name: 'Check SQL', status: 'skipped' },
        { name: 'Show results', status: 'skipped' },
      ];

  const message = !answerable ? answerabilityReason || error : error;
  const hasTrace = retryCount > 0 && repairHistory && repairHistory.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0f13]">
      <div className="p-4 sm:p-5">
        <ol className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {steps.map((s) => {
            const tone = tones[s.status];
            const Icon = tone.icon;
            return (
              <li key={s.name} className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${tone.circle}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100">{s.name}</p>
                  <p className={`text-xs ${tone.label}`}>{s.text ?? tone.text}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {!isValid && message && (
          <p
            role="alert"
            className="mt-4 break-words rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3 py-2.5 text-xs leading-5 text-red-300"
          >
            {message}
          </p>
        )}
      </div>

      {hasTrace && (
        <div className="border-t border-amber-500/10 bg-amber-950/10 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">Self-Repair Trace</p>
                <p className="text-xs text-slate-500">
                  {isValid
                    ? 'The agent detected and corrected an SQL issue automatically'
                    : 'The agent tried to correct the SQL but could not'}
                </p>
              </div>
            </div>

            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-mono text-[10px] text-amber-400">
              {repairHistory.length} attempt{repairHistory.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2">
            {repairHistory.map((rep, idx) => {
              const isExpanded = !!expanded[idx];
              const panelId = `failed-sql-${idx}`;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-500/10 bg-slate-950/60 p-3 transition-all duration-200 hover:border-amber-500/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-[10px] font-bold text-amber-400">
                        {rep.attempt}
                      </span>
                      <span className="text-xs font-semibold text-amber-300">Attempt #{rep.attempt}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span className="text-[11px] uppercase tracking-wide text-slate-400">Error detected</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1 text-[11px] font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
                    >
                      <Code2 className="h-3 w-3" />
                      <span className="hidden sm:inline">{isExpanded ? 'Hide SQL' : 'View SQL'}</span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  <div className="mt-2 rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2">
                    <p className="break-words text-[11px] leading-relaxed text-red-300/80">{rep.error}</p>
                  </div>

                  <div
                    id={panelId}
                    aria-hidden={!isExpanded}
                    className={`grid transition-all duration-300 ${
                      isExpanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="rounded-lg border border-slate-800 bg-slate-950">
                        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Code2 className="h-3 w-3 text-slate-600" />
                            <span className="text-[11px] uppercase tracking-wider text-slate-600">Failed SQL</span>
                          </div>
                        </div>
                        <div className="max-h-64 overflow-auto px-3 py-3">
                          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-400">
                            {rep.failed_sql}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}