import React from 'react';
import { Database, ArrowRight } from 'lucide-react';

export default function Footer({
  onTryFree,
  scrollToSection,
}) {
  const exploreLinks = [
    ['Capabilities', 'features'],
    ['How it works', 'workflow'],
    ['Observability', 'observability'],
  ];

  return (
    <footer className="relative w-full overflow-hidden border-t border-white/[0.06]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-100px] h-[260px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.045)_0%,rgba(37,99,235,0.02)_40%,transparent_72%)] blur-[30px] sm:h-[320px] sm:w-[850px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.018)_0%,transparent_65%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-3 sm:gap-8 sm:py-12 lg:gap-12 lg:py-14">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.09] bg-white text-[#08090b] shadow-[0_0_24px_rgba(255,255,255,0.04)]">
                <Database className="h-4 w-4" />
              </div>

              <span className="text-sm font-semibold tracking-[-0.02em] text-[#d8dce1]">
                Text2SQL
              </span>
            </div>

            <p className="mt-2 max-w-[280px] text-[11px] leading-6 text-[#626a75]">
              Ask questions in plain English. Query your data, understand the
              answer, and keep track of every interaction.
            </p>
          </div>

          <div className="justify-self-start sm:justify-self-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#454b54]">
              Explore
            </p>

            <div className="mt-3 flex flex-col gap-1">
              {exploreLinks.map(([label, id]) => (
                <button key={id} type="button" onClick={() => scrollToSection(id)} className="group relative w-fit cursor-pointer py-1 text-left text-[11px] text-[#686f79] transition-colors duration-300 hover:text-white">
                  {label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-400/70 transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>
          </div>

          <div className="sm:justify-self-end">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#454b54]">
              Get started
            </p>

            <div className="mt-2">
              <button type="button" onClick={onTryFree} className="group inline-flex items-center gap-2 cursor-pointer text-[11px] font-medium text-[#aeb4bc] transition-colors hover:text-white">
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