import React from 'react';
import {
  Database,
  ArrowRight,
} from 'lucide-react';

export default function Footer({
  onTryFree,
  scrollToSection,
}) {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-100px] h-[320px] w-[850px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.045)_0%,rgba(37,99,235,0.02)_40%,transparent_72%)] blur-[30px]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.018)_0%,transparent_65%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_0.7fr] lg:py-14">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.09] bg-white text-[#08090b] shadow-[0_0_24px_rgba(255,255,255,0.04)]">
                <Database className="h-4 w-4" />
              </div>

              <span className="text-sm font-semibold tracking-[-0.02em] text-[#d8dce1]">
                Text2SQL
              </span>
            </div>

            <p className="mt-2 max-w-sm text-[11px] leading-6 text-[#626a75]">
              Ask questions in plain English. Query your data, understand the
              answer, and keep track of every interaction.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#454b54]">
              Explore
            </p>

            <div className="mt-3 space-y-3">
              {[
                ["Capabilities", "features"],
                ["How it works", "workflow"],
                ["Observability", "observability"],
              ].map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="group relative block cursor-pointer text-left text-[11px] text-[#686f79] transition-colors duration-300 hover:text-white"
                >
                  {label}

                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-blue-400/70 transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#454b54]">
              Get started
            </p>

            <div className="mt-2">
              <button
                onClick={onTryFree}
                className="group inline-flex items-center gap-2 text-[11px] font-medium text-[#aeb4bc] transition-colors hover:text-white cursor-pointer"
              >
                Try Text2SQL

                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            <p className="mt-3 max-w-[180px] text-[10px] leading-5 text-[#454b54]">
              Start asking questions about your data.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.06] py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-[#414750]">
            © 2026 Text2SQL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}