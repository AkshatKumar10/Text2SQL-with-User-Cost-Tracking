import React from 'react';
import { Check } from 'lucide-react';

export default function ObservabilitySection() {
  const metrics = [
    ['Tokens', '12.4K'],
    ['Latency', '1.24s'],
    ['Est. cost', '$0.014'],
    ['Retries', '1'],
  ];

  return (
    <section id="observability" className="scroll-mt-[72px] border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 sm:gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-24">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Observability
            </p>

            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
              See what every query uses.
            </h2>

            <p className="mt-4 max-w-[480px] text-sm leading-6 text-[#707680] sm:leading-7">
              Track token usage, latency, estimated cost and retries for
              authenticated users through your Langfuse integration.
            </p>

            <div className="mt-6 space-y-2 sm:mt-7">
              <div className="flex items-center gap-2 text-[12px] text-[#676d76]">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                Per-user query history
              </div>

              <div className="flex items-center gap-2 text-[12px] text-[#676d76]">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                Token and cost estimates
              </div>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-blue-500/[0.025] blur-[60px] sm:-inset-10 sm:blur-[70px]" />

            <div className="relative w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0c10]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />

                  <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#5f6670]">
                    Query telemetry
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2">
                {metrics.map(([label, value], index) => (
                  <div
                    key={label}
                    className={`group relative p-4 transition-all duration-500 hover:bg-white/[0.018] sm:p-6 ${index % 2 !== 0 ? 'border-l border-white/[0.07]' : ''} ${index >= 2 ? 'border-t border-white/[0.07]' : ''}`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.035] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-[#555b64]">
                          {label}
                        </p>

                        <div className="h-1 w-1 shrink-0 rounded-full bg-[#343941] transition-colors duration-300 group-hover:bg-blue-400/70" />
                      </div>

                      <p className="mt-2 text-xl font-semibold tracking-tight text-[#d8dbe0] transition-colors duration-300 group-hover:text-white sm:mt-3 sm:text-2xl">
                        {value}
                      </p>

                      <div className="mt-3 h-px w-7 bg-white/[0.08] transition-all duration-500 group-hover:w-12 group-hover:bg-blue-400/40 sm:mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}