import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CTASection({
  onTryFree,
}) {
  return (
    <section className="relative w-full border-b border-white/[0.06]">
      <div className="relative w-full border-t border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-140px] h-[360px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.07)_0%,rgba(37,99,235,0.035)_30%,rgba(37,99,235,0.012)_55%,transparent_75%)] blur-[20px] sm:top-[-180px] sm:h-[500px] sm:w-[1100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.025)_0%,transparent_65%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-20 md:py-24 lg:py-28">
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">
            Your data is waiting.
          </h2>

          <p className="mx-auto mt-4 max-w-[280px] text-sm leading-6 text-[#707680] sm:mt-5 sm:max-w-lg sm:leading-7">
            Ask your first question and see what Text2SQL can find.
          </p>

          <button type="button" onClick={onTryFree} className="group mt-7 inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#101114] shadow-[0_0_30px_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e9ebed] hover:shadow-[0_0_40px_rgba(96,165,250,0.12)] sm:mt-8 sm:px-6 sm:py-3.5">
            Try Now
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 sm:mt-6">
            <div className="h-px w-6 shrink-0 bg-white/[0.07] sm:w-8" />

            <span className="whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.12em] text-[#414750] sm:tracking-[0.16em]">
              Query · Analyze · Understand
            </span>

            <div className="h-px w-6 shrink-0 bg-white/[0.07] sm:w-8" />
          </div>
        </div>
      </div>
    </section>
  );
}