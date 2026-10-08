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
      <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
        No records returned by the query.
      </div>
    );
  }

  const cols =
    columns && columns.length > 0
      ? columns
      : Object.keys(data[0] || {});

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredData = data.filter((row) =>
    cols.some((col) =>
      String(row[col] ?? '')
        .toLowerCase()
        .includes(normalizedSearch)
    )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const safePage = Math.min(
    page,
    Math.max(0, totalPages - 1)
  );

  const paginatedData = filteredData.slice(
    safePage * rowsPerPage,
    (safePage + 1) * rowsPerPage
  );

  const exportCSV = () => {
    if (filteredData.length === 0) return;
    const header = cols
      .map((col) => `"${String(col).replace(/"/g, '""')}"`)
      .join(',');

    const rows = filteredData.map((row) =>
      cols
        .map((col) => {
          let value = row[col];
          if (value === null || value === undefined) {
            value = '';
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          } else {
            value = String(value);
          }
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [header, ...rows].join('\r\n');
    const blob = new Blob(
      ['\uFEFF' + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

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
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              Result Table
            </h4>

            <p className="text-xs text-slate-400">
              {filteredData.length} records matching
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter results..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="bg-slate-950/80 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-44"
            />
          </div>

          <button
            onClick={exportCSV}
            disabled={filteredData.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="p-10 text-center">
          <Search className="w-5 h-5 mx-auto mb-2 text-slate-600" />
          <p className="text-sm text-slate-400">
            No matching records
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Try a different search term.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">

              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                  {cols.map((col, idx) => (
                    <th
                      key={idx}
                      className="py-3 px-4 font-semibold text-slate-300"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-indigo-950/20 transition-colors duration-150 odd:bg-slate-900/20 even:bg-slate-900/40"
                  >
                    {cols.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="py-3 px-4 text-slate-300 whitespace-nowrap"
                      >
                        {row[col] !== null &&
                          row[col] !== undefined ? (
                          typeof row[col] === 'object' ? (
                            JSON.stringify(row[col])
                          ) : (
                            String(row[col])
                          )
                        ) : (
                          <span className="text-slate-600 italic">
                            null
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800/70 py-2 px-4">
              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-medium text-slate-300">
                  {safePage * rowsPerPage + 1}
                </span>
                {' - '}
                <span className="font-medium text-slate-300">
                  {Math.min(
                    (safePage + 1) * rowsPerPage,
                    filteredData.length
                  )}
                </span>
                {' of '}
                <span className="font-medium text-slate-300">
                  {filteredData.length}
                </span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setPage((p) => Math.max(0, p - 1))
                  }
                  disabled={safePage === 0}
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-2 text-xs font-semibold text-blue-300">
                  {safePage + 1}
                </div>

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(totalPages - 1, p + 1)
                    )
                  }
                  disabled={safePage >= totalPages - 1}
                  className="flex h-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
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
