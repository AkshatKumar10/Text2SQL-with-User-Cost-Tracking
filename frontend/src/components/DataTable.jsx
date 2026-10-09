import React, { useEffect, useState } from 'react';
import { Table as TableIcon, Download, Search } from 'lucide-react';

export function DataTable({ data, columns }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  const rowsPerPage = 5;

  useEffect(() => {
    setPage(0);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 p-6 text-center text-slate-500 sm:p-8">
        No records returned by the query.
      </div>
    );
  }

  const cols = columns && columns.length > 0 ? columns : Object.keys(data[0] || {});

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredData = data.filter((row) => cols.some((col) => String(row[col] ?? '').toLowerCase().includes(normalizedSearch)));

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));

  const paginatedData = filteredData.slice(safePage * rowsPerPage, (safePage + 1) * rowsPerPage);

  const exportCSV = () => {
    if (filteredData.length === 0) return;

    const header = cols.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(',');

    const rows = filteredData.map((row) =>
      cols.map((col) => {
        let value = row[col];

        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else {
          value = String(value);
        }

        return `"${value.replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = [header, ...rows].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query_results_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl glass-panel">
      <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="shrink-0 rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
            <TableIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-200">
              Result Table
            </h4>

            <p className="truncate text-xs text-slate-400">
              {filteredData.length} records matching
            </p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Filter results..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-8 pr-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none sm:w-44 sm:py-1.5"
            />
          </div>

          <button
            onClick={exportCSV}
            disabled={filteredData.length === 0}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="p-8 text-center sm:p-10">
          <Search className="mx-auto mb-2 h-5 w-5 text-slate-600" />

          <p className="text-sm text-slate-400">
            No matching records
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Try a different search term.
          </p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 font-mono uppercase tracking-wider text-slate-400">
                  {cols.map((col, idx) => (
                    <th key={idx} className="whitespace-nowrap px-3 py-3 font-semibold text-slate-300 sm:px-4">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="transition-colors duration-150 odd:bg-slate-900/20 even:bg-slate-900/40 hover:bg-indigo-950/20">
                    {cols.map((col, colIndex) => (
                      <td key={colIndex} className="max-w-[280px] whitespace-nowrap px-3 py-3 text-slate-300 sm:max-w-[360px] sm:px-4">
                        <div className="max-w-[280px] truncate sm:max-w-[360px]" title={row[col] !== null && row[col] !== undefined ? typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col]) : 'null'}>
                          {row[col] !== null && row[col] !== undefined ? (
                            typeof row[col] === 'object' ? (
                              JSON.stringify(row[col])
                            ) : (
                              String(row[col])
                            )
                          ) : (
                            <span className="italic text-slate-600">
                              null
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-800/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2">
              <p className="text-center text-xs text-slate-500 sm:text-left">
                Showing{' '}
                <span className="font-medium text-slate-300">
                  {safePage * rowsPerPage + 1}
                </span>
                {' - '}
                <span className="font-medium text-slate-300">
                  {Math.min((safePage + 1) * rowsPerPage, filteredData.length)}
                </span>
                {' of '}
                <span className="font-medium text-slate-300">
                  {filteredData.length}
                </span>
              </p>

              <div className="flex w-full items-center justify-center gap-1.5 sm:w-auto">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  Previous
                </button>

                <div className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-2 text-xs font-semibold text-blue-300">
                  {safePage + 1}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}