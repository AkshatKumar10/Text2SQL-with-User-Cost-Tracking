import React from 'react';
import {
  Layers,
} from 'lucide-react';

export default function DatasetsSection() {
  return (
    <section id="datasets" className="scroll-mt-[72px] border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Your datasets
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Use the data
              <br />
              you already have.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#707680]">
              Upload CSV, Excel or JSON files and turn them into queryable
              SQLite tables without setting up a database manually.
            </p>

            <div className="mt-4 flex gap-2">
              {["CSV", "XLSX", "JSON"].map((type) => (
                <span
                  key={type}
                  className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[9px] text-[#7b818a]"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0d0f13] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-[#7c828c]" />

                <span className="text-[10px] font-semibold text-[#c1c5ca]">
                  ecommerce.csv
                </span>
              </div>

              <span className="text-[9px] text-[#555b64]">
                100 rows
              </span>
            </div>

            <div className="py-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#c1c5ca]">
                  products
                </span>

                <span className="text-[8px] text-[#555b64]">
                  SQLite table
                </span>
              </div>

              <div className="space-y-1.5">
                {[
                  ["product_name", "TEXT"],
                  ["category", "TEXT"],
                  ["price", "REAL"],
                  ["stock", "INTEGER"]
                ].map(([name, type]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
                  >
                    <span className="font-mono text-[9px] text-[#858b94]">
                      {name}
                    </span>

                    <span className="font-mono text-[8px] text-[#4f555e]">
                      {type}
                    </span>
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