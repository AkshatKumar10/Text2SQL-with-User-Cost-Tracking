import React, { useState } from 'react';
import { Database, Table, RefreshCw, Key, ChevronDown, ChevronRight, Layers, FileCode } from 'lucide-react';

export function SchemaBrowser({ schemaData, onResetDb, resetting }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [showRawDdl, setShowRawDdl] = useState(false);

  const tables = schemaData?.tables || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-400" />
            Database Schema &amp; Data Dictionary
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Explore live relational SQLite tables, schema declarations, indexes, and sample data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRawDdl(!showRawDdl)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            {showRawDdl ? 'Show Table Explorer' : 'View Raw DDL'}
          </button>
          <button
            onClick={onResetDb}
            disabled={resetting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting DB...' : 'Reset Sample DB'}
          </button>
        </div>
      </div>

      {showRawDdl ? (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            LLM Context Schema DDL
          </h3>
          <pre className="p-4 bg-slate-950/80 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto border border-slate-800 leading-relaxed">
            {schemaData?.raw_schema || 'Loading schema...'}
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Table List Sidebar */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Tables ({tables.length})
            </h4>
            {tables.map((t) => {
              const isSelected = selectedTable?.name === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => setSelectedTable(t)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/50 shadow-lg text-white'
                      : 'glass-card hover:bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Table className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="font-semibold text-sm">{t.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                      {t.total_rows} rows
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-2 font-mono">
                    <span>{t.columns.length} columns</span>
                    <span>•</span>
                    <span className="text-slate-500 truncate">{t.columns.map(c => c.name).slice(0, 3).join(', ')}...</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Detail View */}
          <div className="md:col-span-8">
            {selectedTable ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Table className="w-5 h-5 text-indigo-400" />
                      {selectedTable.name}
                    </h3>
                    <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      {selectedTable.total_rows} Records
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Columns definition and live data preview</p>
                </div>

                {/* Columns Table */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Columns Schema</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Column Name</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Primary Key</th>
                          <th className="py-2.5 px-3">Not Null</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {selectedTable.columns.map((c) => (
                          <tr key={c.cid} className="hover:bg-slate-800/30">
                            <td className="py-2 px-3 font-semibold text-slate-200 flex items-center gap-1.5">
                              {c.pk && <Key className="w-3 h-3 text-amber-400" />}
                              {c.name}
                            </td>
                            <td className="py-2 px-3 text-indigo-300">{c.type || 'ANY'}</td>
                            <td className="py-2 px-3">
                              {c.pk ? <span className="text-amber-400 font-semibold">YES</span> : <span className="text-slate-600">NO</span>}
                            </td>
                            <td className="py-2 px-3">
                              {c.notnull ? <span className="text-rose-400 font-semibold">YES</span> : <span className="text-slate-600">NO</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sample Data Preview */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Preview Sample Records (First 5)</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono">
                        <tr>
                          {selectedTable.columns.map((c) => (
                            <th key={c.cid} className="py-2 px-3">{c.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {selectedTable.sample_rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/30">
                            {selectedTable.columns.map((c) => (
                              <td key={c.cid} className="py-2 px-3 text-slate-300 font-mono whitespace-nowrap">
                                {String(row[c.name] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
                <Table className="w-10 h-10 text-slate-600 mb-3" />
                <h4 className="text-base font-semibold text-slate-300">Select a Table</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Choose a database table from the left to inspect its columns, keys, types, and sample data.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
