import React from 'react';
import {
  ArrowRight,
} from 'lucide-react';

export default function CTASection({
  onTryFree,
}) {
  return (
    <section className="relative border-b border-white/[0.06]">
      <div className="relative border-t border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[500px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.07)_0%,rgba(37,99,235,0.035)_30%,rgba(37,99,235,0.012)_55%,transparent_75%)] blur-[20px]" />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,0.025)_0%,transparent_65%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-28">
          <h2 className="text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
            Your data is waiting.
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#707680]">
            Ask your first question and see what TextQuery can find.
          </p>

          <button
            onClick={onTryFree}
            className="group mt-8 inline-flex cursor-pointer items-center gap-2.5 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#101114] shadow-[0_0_30px_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e9ebed] hover:shadow-[0_0_40px_rgba(96,165,250,0.12)]"
          >
            Try Now

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-white/[0.07]" />

            <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-[#414750]">
              Query · Analyze · Understand
            </span>

            <div className="h-px w-8 bg-white/[0.07]" />
          </div>
        </div>
      </div>
    </section>
  );
}