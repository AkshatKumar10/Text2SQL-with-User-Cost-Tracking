import React from 'react';
import {
  Sparkles,
  BrainCircuit,
  Zap,
  BarChart3,
} from 'lucide-react';

export default function WorkflowSection() {
  const workflow = [
    {
      number: "01",
      icon: Sparkles,
      title: "Ask",
      text: "Describe what you want to know using natural language.",
    },
    {
      number: "02",
      icon: BrainCircuit,
      title: "Generate",
      text: "AI understands your database schema and generates the SQL needed to answer it.",
    },
    {
      number: "03",
      icon: Zap,
      title: "Execute",
      text: "The query runs against your data, with failed queries automatically repaired when possible.",
    },
    {
      number: "04",
      icon: BarChart3,
      title: "Understand",
      text: "Get the result as a table, visualization or useful data summary.",
    },
  ];

  return (
    <section id="workflow" className="scroll-mt-[72px] border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.5fr] lg:items-center lg:gap-32">

          <div className="max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400/90">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
              One question.
              <br />
              Four simple steps.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#6f7782]">
              You don't need to know SQL. TextQuery turns your question into an
              executable query and presents the result in a way that's easy to
              understand.
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute left-[7%] right-[7%] top-7 hidden h-px bg-gradient-to-r from-transparent via-white/[0.60] to-transparent sm:block" />

            <div className="grid grid-cols-2 gap-y-12 sm:grid-cols-4 sm:gap-0">
              {workflow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className={`group relative flex min-h-[230px] flex-col sm:px-5 ${
                      index === 0
                        ? "sm:pl-0"
                        : ""
                    } ${
                      index === workflow.length - 1
                        ? "sm:pr-0"
                        : ""
                    }`}
                  >
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#080a0e] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-blue-400/30 group-hover:bg-[#0b0f16] group-hover:shadow-[0_0_35px_rgba(59,130,246,0.10)]">
                      <div className="absolute -inset-3 -z-10 rounded-2xl bg-blue-500/[0.08] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                      <Icon className="h-5 w-5 text-[#7d8692] transition-all duration-500 group-hover:text-blue-400" />

                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#080a0e] bg-[#171b22] font-mono text-[7px] text-[#7a838e] transition-colors duration-300 group-hover:bg-blue-500/20 group-hover:text-blue-300">
                        {index + 1}
                      </span>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-semibold tracking-[-0.02em] text-[#d8dce1] transition-colors duration-300 group-hover:text-white">
                        {step.title}
                      </h3>

                      <p className="mt-3 max-w-[120px] text-[13px] leading-5 text-[#626a75]">
                        {step.text}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center gap-2 pt-8">
                      <div className="h-px w-5 bg-white/[0.08] transition-all duration-500 group-hover:w-9 group-hover:bg-blue-400/50" />

                      <span className="text-[7px] font-medium tracking-[0.14em] text-[#41464c] transition-colors duration-500 group-hover:text-[#6d7480]">
                        STEP {index + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}