import React from 'react';
import {
  Sparkles,
  Database,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
} from 'lucide-react';

export default function HeroSection({ onTryFree }) {
  const metrics = [
    ['Tokens', '12.4K'],
    ['Latency', '1.24s'],
    ['Est. cost', '$0.014'],
    ['Retries', 1],
  ];

  const revenue = [
    ['Electronics', '$42.8k', '68%', 'bg-blue-500/70'],
    ['Clothing', '$34.4k', '55%', 'bg-blue-500/55'],
    ['Home', '$26.1k', '42%', 'bg-blue-500/45'],
    ['Sports', '$19.7k', '31%', 'bg-blue-500/35'],
  ];

  return (
    <section id="home" className="border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-20">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-20">
          <div className="w-full min-w-0 lg:flex-1">
            <h1 className="max-w-2xl text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-6xl lg:text-[64px] xl:text-[70px]">
              Ask your data
              <br />
              <span className="bg-gradient-to-r from-white via-[#cbd5e1] to-[#7dd3fc] bg-clip-text text-transparent">
                anything.
              </span>
            </h1>

            <p className="mt-6 max-w-[540px] text-[14px] leading-6 text-[#858b95] sm:mt-7 sm:text-base sm:leading-7">
              Turn natural-language questions into SQL queries, useful
              insights and visualizations. Explore your data without
              having to write SQL yourself.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <button onClick={onTryFree} className="group flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-[#101114] shadow-[0_8px_30px_rgba(255,255,255,0.08)] transition-all duration-200 hover:bg-[#f1f3f5] hover:shadow-[0_12px_40px_rgba(255,255,255,0.12)] sm:w-auto">
                <Zap className="h-4 w-4 text-[#2563eb]" />
                Try Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 sm:mt-8 sm:gap-x-6">
              <div className="flex items-center gap-2 text-[10px] text-[#666c75]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
                Secure authentication
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#666c75]">
                <Database className="h-3.5 w-3.5 shrink-0 text-blue-400/80" />
                SQLite & custom data
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#666c75]">
                <Activity className="h-3.5 w-3.5 shrink-0 text-violet-400/80" />
                Usage telemetry
              </div>
            </div>
          </div>

          <div className="relative w-full min-w-0 lg:flex-1">
            <div className="pointer-events-none absolute -inset-8 rounded-[30px] bg-blue-500/[0.05] blur-3xl sm:-inset-10" />

            <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101216]">
              <div className="flex h-11 items-center justify-between border-b border-white/[0.07] px-3 sm:h-12 sm:px-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#383c43] sm:h-2.5 sm:w-2.5" />
                  <span className="h-2 w-2 rounded-full bg-[#383c43] sm:h-2.5 sm:w-2.5" />
                  <span className="h-2 w-2 rounded-full bg-[#383c43] sm:h-2.5 sm:w-2.5" />
                </div>

                <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 sm:px-3">
                  <Database className="h-3 w-3 text-[#707680]" />
                  <span className="text-[8px] text-[#777d87] sm:text-[9px]">
                    ecommerce.db
                  </span>
                </div>

                <div className="h-5 w-8 sm:w-14" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.5fr]">
                <div className="border-b border-white/[0.07] p-4 sm:p-5 lg:border-b-0 lg:border-r">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-[#c9ccd1]">
                        Ask your data
                      </p>

                      <p className="text-[8px] text-[#626771]">
                        Natural language
                      </p>
                    </div>

                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-[#0b0d11] p-3.5 sm:p-4">
                    <p className="text-[10px] leading-5 text-[#9da2aa]">
                      What is the total revenue generated by each product
                      category?
                    </p>
                  </div>
                </div>

                <div className="min-w-0 p-4 sm:p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[#c9ccd1]">
                        Query result
                      </p>

                      <p className="mt-0.5 text-[8px] leading-4 text-[#626771]">
                        Generated, executed, and analyzed automatically
                      </p>
                    </div>

                    <span className="shrink-0 rounded-md bg-emerald-400/[0.07] px-2 py-1 text-[8px] font-medium text-emerald-400">
                      Completed
                    </span>
                  </div>

                  <div className="mb-2 rounded-xl border border-white/[0.06] bg-[#0b0d11] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[8px] font-medium text-[#777d87]">
                        Generated query
                      </span>

                      <span className="text-[7px] text-[#4f555e]">
                        SQL
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-white/[0.04] bg-[#080a0d] px-2.5 pb-2 sm:px-3">
                      <code className="break-words text-[7px] leading-4 text-[#8d96a5] sm:text-[7.5px]">
                        <span className="text-blue-400">SELECT</span>{' '}
                        category,{' '}
                        <span className="text-blue-400">SUM</span>(revenue){' '}
                        <span className="text-blue-400">AS</span> total_revenue{' '}
                        <span className="text-blue-400">FROM</span> orders{' '}
                        <span className="text-blue-400">GROUP BY</span>{' '}
                        category
                      </code>
                    </div>
                  </div>

                  <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {metrics.map(([label, value]) => (
                      <div key={label} className="min-w-0 rounded-lg border border-white/[0.06] bg-[#0b0d11] px-2.5 py-2.5">
                        <p className="truncate text-[7px] text-[#626771]">
                          {label}
                        </p>

                        <p className="mt-1 truncate text-[10px] font-semibold text-[#c9ccd1]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative rounded-xl border border-white/[0.06] bg-[#0b0d11] px-3.5 pb-3 pt-4 sm:px-5 sm:pt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[7px] text-[#626771]">
                        Revenue by category
                      </span>

                      <span className="text-[7px] text-[#4f555e]">
                        USD
                      </span>
                    </div>

                    <div className="relative h-24">
                      <div className="absolute inset-x-0 top-3 border-t border-white/[0.035]" />
                      <div className="absolute inset-x-0 top-1/2 border-t border-white/[0.035]" />
                      <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.035]" />

                      <div className="absolute inset-0 flex items-end justify-around gap-2 px-2 sm:gap-4 sm:px-4">
                        {revenue.map(([name, value, height, color]) => (
                          <div key={name} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                            <span className="mb-1 text-[6px] text-[#777d87] sm:text-[7px]">
                              {value}
                            </span>

                            <div className={`w-full max-w-8 rounded-t ${color}`} style={{ height }} />

                            <span className="mt-2 max-w-full truncate text-[6px] text-[#555b65] sm:text-[7px]">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {revenue.map(([name, value]) => (
                      <div key={name} className="min-w-0 rounded-lg border border-white/[0.06] bg-[#0b0d11] p-2.5">
                        <p className="truncate text-[7px] text-[#626771]">
                          {name}
                        </p>

                        <p className="mt-1 text-[10px] font-semibold text-[#c9ccd1]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}