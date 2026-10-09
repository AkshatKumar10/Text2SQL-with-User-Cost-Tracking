import React from 'react';
import { Layers } from 'lucide-react';

export default function DatasetsSection() {
  const columns = [
    ['product_name', 'TEXT'],
    ['category', 'TEXT'],
    ['price', 'REAL'],
    ['stock', 'INTEGER'],
  ];

  return (
    <section id="datasets" className="scroll-mt-[72px] border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 sm:gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Your datasets
            </p>

            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
              Use the data
              <br />
              you already have.
            </h2>

            <p className="mt-5 max-w-[480px] text-sm leading-6 text-[#707680] sm:leading-7">
              Upload CSV, Excel or JSON files and turn them into queryable
              SQLite tables without setting up a database manually.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {['CSV', 'XLSX', 'JSON'].map((type) => (
                <span key={type} className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[9px] text-[#7b818a]">
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#0d0f13] p-4 shadow-2xl sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
              <div className="flex min-w-0 items-center gap-2">
                <Layers className="h-3.5 w-3.5 shrink-0 text-[#7c828c]" />

                <span className="truncate text-[10px] font-semibold text-[#c1c5ca]">
                  ecommerce.csv
                </span>
              </div>

              <span className="shrink-0 text-[9px] text-[#555b64]">
                100 rows
              </span>
            </div>

            <div className="py-4 sm:py-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] text-[#c1c5ca]">
                  products
                </span>

                <span className="shrink-0 text-[8px] text-[#555b64]">
                  SQLite table
                </span>
              </div>

              <div className="space-y-1.5">
                {columns.map(([name, type]) => (
                  <div key={name} className="flex items-center justify-between gap-3 rounded-md border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
                    <span className="min-w-0 truncate font-mono text-[9px] text-[#858b94]">
                      {name}
                    </span>

                    <span className="shrink-0 font-mono text-[8px] text-[#4f555e]">
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