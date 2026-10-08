import React, { useState } from 'react';
import {
  Database,
  Trash2,
  Table,
  Key,
  Layers,
  Search,
  Hash,
  Lock,
} from 'lucide-react';
import { DeleteModal } from './DeleteModal';

const sampleTables = ['customers', 'products', 'orders', 'order_items'];

const TABLES_PER_PAGE = 5;

export function SchemaBrowser({ schemaData, onDelete }) {
  const [selectedName, setSelectedName] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const tables = schemaData?.tables || [];
  const uploadedTables = tables
    .filter((t) => !sampleTables.includes(t.name))
    .reverse();

  const sampleTableList = tables.filter((t) =>
    sampleTables.includes(t.name)
  );

  const orderedTables = [
    ...uploadedTables,
    ...sampleTableList,
  ];

  const q = search.trim().toLowerCase();

  const filtered = q
    ? orderedTables.filter((t) =>
      t.name.toLowerCase().includes(q)
    )
    : orderedTables;

  const totalPages = Math.ceil(
    filtered.length / TABLES_PER_PAGE
  );

  const startIndex = (currentPage - 1) * TABLES_PER_PAGE;
  const paginatedTables = filtered.slice(
    startIndex,
    startIndex + TABLES_PER_PAGE
  );

  const selected = tables.find((t) => t.name === selectedName) ?? null;

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const handleSelectTable = (tableName) => {
    setSelectedName(tableName);
  };
  const closeModal = () => {
    if (deleting) return;
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(pendingDelete.name);
      if (selected?.name === pendingDelete.name) {
        setSelectedName(null);
      }
      setPendingDelete(null);
      const remainingTables = filtered.filter(
        (t) => t.name !== pendingDelete.name
      );
      const remainingPages = Math.ceil(
        remainingTables.length / TABLES_PER_PAGE
      );
      if (remainingPages > 0 && currentPage > remainingPages) {
        setCurrentPage(remainingPages);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="relative w-full text-slate-100">
      <div className="pointer-events-none absolute right-20 top-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-8 pb-16">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 p-3.5 text-blue-400 shadow-lg shadow-blue-500/10">
              <Database className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Database Schema
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Browse tables, column definitions and sample data
                in your SQLite database
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearch(e.target.value)
                }
                placeholder="Search tables"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/90 py-3 pl-10 pr-4 text-xs text-slate-200 shadow-inner transition placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              Tables ({filtered.length})
            </div>
            <div className="space-y-2.5">
              {paginatedTables.map((t) => {
                const isSample = sampleTables.includes(t.name);
                const isSelected = selected?.name === t.name;
                const cols = t.columns || [];
                return (
                  <div
                    key={t.name}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      handleSelectTable(t.name)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectTable(t.name);
                      }
                    }}
                    className={`group relative cursor-pointer rounded-2xl border p-4 outline-none transition-all duration-200 focus-visible:border-blue-400 ${isSelected
                      ? 'border-blue-500/40 bg-blue-500/[0.08] shadow-lg shadow-blue-500/5'
                      : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                  >
                    {isSelected && (
                      <span className="absolute bottom-4 left-0 top-4 w-[2px] rounded-full bg-blue-400" />
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${isSelected
                            ? 'border-blue-500/25 bg-blue-500/10'
                            : 'border-slate-800 bg-slate-950/70'
                            }`}
                        >
                          <Table
                            className={`h-4 w-4 transition-colors ${isSelected
                              ? 'text-blue-400'
                              : 'text-slate-400 group-hover:text-blue-400'
                              }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-semibold ${isSelected
                              ? 'text-white'
                              : 'text-slate-200'
                              }`}
                          >
                            {t.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {(t.total_rows ?? 0).toLocaleString()}{' '}
                            rows
                            <span className="mx-1.5 text-slate-700">
                              /
                            </span>
                            {cols.length} columns
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {isSample ? (
                          <span className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-[10px] text-slate-500">
                            <Lock className="h-3 w-3" />
                            Sample
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDelete(t);
                            }}
                            title="Delete table"
                            aria-label={`Delete table ${t.name}`}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent text-slate-600 transition-all duration-200 hover:border-indigo-500/20 hover:bg-indigo-500/10 hover:text-indigo-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 border-t border-slate-800/60 pt-3">
                      <span className="truncate font-mono text-[11px] text-slate-500">
                        {cols
                          .slice(0, 3)
                          .map((c) => c.name)
                          .join(', ')}
                        {cols.length > 3 && (
                          <span className="text-slate-600">
                            {' '}
                            +{cols.length - 3} more
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No tables found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {search
                      ? 'Try a different search.'
                      : 'Import a dataset to get started.'}
                  </p>
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800/70 pt-4">
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-medium text-slate-300">
                    {(currentPage - 1) * TABLES_PER_PAGE + 1}
                  </span>
                  {' - '}
                  <span className="font-medium text-slate-300">
                    {Math.min(
                      currentPage * TABLES_PER_PAGE,
                      filtered.length
                    )}
                  </span>
                  {' of '}
                  <span className="font-medium text-slate-300">
                    {filtered.length}
                  </span>
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(page - 1, 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="flex h-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-2 text-xs font-semibold text-blue-300">
                    {currentPage}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-3 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800/50 hover:text-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-8">
            {selected ? (
              <div className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 p-3 text-blue-400">
                      <Table className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-mono text-lg font-bold text-white">
                        {selected.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Column definitions and a live data preview
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 font-mono text-xs text-slate-300">
                      {(selected.columns || []).length}{' '}
                      columns
                    </span>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-400">
                      {(selected.total_rows ?? 0).toLocaleString()}{' '}
                      records
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <Hash className="h-3.5 w-3.5 text-blue-400" />
                    Columns schema
                  </h3>
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-semibold">
                            Column
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Type
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Constraints
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(selected.columns || []).map(
                          (c) => (
                            <tr
                              key={
                                c.cid ?? c.name
                              }
                              className="transition-colors hover:bg-slate-800/30"
                            >
                              <td className="px-4 py-2.5">
                                <span className="flex items-center gap-2 font-mono font-semibold text-slate-200">
                                  {c.pk ? (
                                    <Key className="h-3.5 w-3.5 text-amber-400" />
                                  ) : (
                                    <span className="h-3.5 w-3.5" />
                                  )}

                                  {c.name}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[11px] text-blue-300">
                                  {c.type || 'ANY'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {c.pk && (
                                    <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                                      Primary key
                                    </span>
                                  )}
                                  {c.notnull && (
                                    <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                                      Not null
                                    </span>
                                  )}
                                  {c.likely_id && (
                                    <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                                      Likely ID
                                    </span>
                                  )}
                                  {!c.pk &&
                                    !c.notnull &&
                                    !c.likely_id && (
                                      <span className="text-slate-600">
                                        -
                                      </span>
                                    )}
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <Layers className="h-3.5 w-3.5 text-blue-400" />
                    Sample records (first 5)
                  </h3>
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/80 font-mono text-slate-400">
                        <tr>
                          {(selected.columns || []).map(
                            (c) => (
                              <th
                                key={
                                  c.cid ?? c.name
                                }
                                className="whitespace-nowrap px-4 py-3 font-semibold"
                              >
                                {c.name}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(selected.sample_rows || []).map(
                          (row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="transition-colors hover:bg-slate-800/30"
                            >
                              {(selected.columns || []).map(
                                (c) => (
                                  <td
                                    key={
                                      c.cid ??
                                      c.name
                                    }
                                    className="whitespace-nowrap px-4 py-2.5 font-mono text-slate-300"
                                  >
                                    {String(
                                      row[c.name] ?? ''
                                    )}
                                  </td>
                                )
                              )}
                            </tr>
                          )
                        )}
                        {(selected.sample_rows || [])
                          .length === 0 && (
                            <tr>
                              <td
                                colSpan={Math.max(
                                  (
                                    selected.columns ||
                                    []
                                  ).length,
                                  1
                                )}
                                className="px-4 py-8 text-center text-slate-500"
                              >
                                This table has no rows yet.
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[350px] h-full flex-col items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/40 p-12 text-center backdrop-blur-xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
                  <Table className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-200">
                  Select a table
                </h3>
                <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
                  Select a table from the list to view its
                  columns and sample data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <DeleteModal
        isOpen={!!pendingDelete}
        tableName={pendingDelete?.name}
        rowCount={pendingDelete?.total_rows}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={closeModal}
      />
    </main>
  );
}