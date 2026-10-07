import React from 'react';
import {
  BrainCircuit,
  Database,
  BarChart3,
  Activity,
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: BrainCircuit,
      title: "Self-Healing SQL",
      description:
        "Generate, validate and automatically repair SQL when a query encounters schema or syntax issues."
    },
    {
      icon: BarChart3,
      title: "Automatic Visualizations",
      description:
        "Turn database results into clean tables, charts and KPI views without building dashboards manually."
    },
    {
      icon: Database,
      title: "Bring Your Own Data",
      description:
        "Upload CSV, Excel or JSON files and make your datasets queryable in seconds."
    },
    {
      icon: Activity,
      title: "Usage & Observability",
      description:
        "Monitor tokens, latency, estimated costs, retries and query history with integrated telemetry."
    }
  ];

  return (
    <section id="features" className="scroll-mt-[40px] border-y border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
            Capabilities
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Built around your data.
          </h2>

          <p className="mt-4 text-sm leading-6 text-[#707680]">
            Everything needed to go from an everyday question to a useful
            data-driven answer.
          </p>
        </div>

        <div className="mt-8 grid overflow-hidden rounded-xl border border-white/[0.08] md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden p-8 transition-all duration-500 hover:bg-white/[0.018] sm:p-10 ${
                  index % 2 !== 0
                    ? "md:border-l border-white/[0.08]"
                    : ""
                } ${
                  index >= 2
                    ? "border-t border-white/[0.08]"
                    : ""
                }`}
              >
                <div className="pointer-events-none absolute -inset-20 bg-blue-500/[0.035] opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-100" />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.025] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-[9px] tracking-[0.18em] text-[#41464f] transition-colors duration-300 group-hover:text-blue-400/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative mb-5">
                    <div className="absolute -inset-3 rounded-2xl bg-blue-500/[0.08] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-blue-400/25 group-hover:bg-[#111722]">
                      <Icon className="h-4 w-4 text-[#9da3ad] transition-all duration-500 group-hover:text-blue-400" />
                    </div>
                  </div>

                  <h3 className="text-md font-semibold tracking-[-0.02em] text-white transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="mt-3 max-w-md text-sm leading-6 text-[#696f78]">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute bottom-0 left-8 right-8 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-400/60 via-blue-400/10 to-transparent transition-transform duration-500 group-hover:scale-x-100 sm:left-10 sm:right-10" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}