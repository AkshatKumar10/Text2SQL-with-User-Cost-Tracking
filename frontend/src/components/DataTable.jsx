import React, { useState } from 'react';
import { Table as TableIcon, Download, Search } from 'lucide-react';

export function DataTable({ data, columns }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 7;

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
        No records returned by the query.
      </div>
    );
  }

  const cols = columns && columns.length > 0 ? columns : Object.keys(data[0] || {});

  // Filter based on search term
  const filteredData = data.filter((row) =>
    cols.some((col) =>
      String(row[col] ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const exportCSV = () => {
    if (!filteredData || filteredData.length === 0) return;

    // Header row with proper escaping
    const header = cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',');
    
    // Data rows with proper string & null escaping
    const rows = filteredData.map(row =>
      cols.map(c => {
        let val = row[c];
        if (val === null || val === undefined) {
          val = '';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = [header, ...rows].join('\r\n');

    // Add UTF-8 BOM (\uFEFF) so Excel opens dates, text & timestamps cleanly without #####
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `query_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Table Toolbar */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Execution Result Table</h4>
            <p className="text-xs text-slate-400">{filteredData.length} records matching</p>
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              {cols.map((col, idx) => (
                <th key={idx} className="py-3 px-4 font-semibold text-slate-300">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedData.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-indigo-950/20 transition-colors duration-150 odd:bg-slate-900/20 even:bg-slate-900/40"
              >
                {cols.map((col, cIdx) => (
                  <td key={cIdx} className="py-3 px-4 text-slate-300 whitespace-nowrap">
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
                      <span className="text-slate-600 italic">null</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-300"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
