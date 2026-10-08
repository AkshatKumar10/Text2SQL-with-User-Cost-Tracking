import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Table2,
} from 'lucide-react';

export function TableInfoModal({
    table,
    onClose,
}) {
    useEffect(() => {
        if (!table) return;
        const scroll = document.body.style.overflow;
        const paddingRight = document.body.style.paddingRight;
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';

        if (scrollbar > 0) {
            document.body.style.paddingRight = `${scrollbar}px`;
        }
        return () => {
            document.body.style.overflow = scroll;
            document.body.style.paddingRight = paddingRight;
        };
    }, [table]);

    if (!table) {
        return null;
    }

    const columns = table.columns ?? [];
    const sampleRows = (table.sample_rows ?? []).slice(0, 2);

    const modal = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="table-info-title"
                className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101216] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-start justify-between border-b border-white/[0.07] px-5 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/[0.07]">
                            <Table2 className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <h3
                                id="table-info-title"
                                className="font-mono text-sm font-semibold text-white"
                            >
                                {table.name}
                            </h3>
                            <p className="mt-1 text-[11px] leading-5 text-[#6b727c]">
                                Table structure and sample data
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close table information"
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#6b727c] transition hover:bg-white/[0.06] hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-3 border-b border-white/[0.07] p-5">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
                        <p className="text-[10px] uppercase tracking-wide text-[#5f6670]">
                            Total rows
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#dfe3e8]">
                            {(table.total_rows ?? 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
                        <p className="text-[10px] uppercase tracking-wide text-[#5f6670]">
                            Columns
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#dfe3e8]">
                            {columns.length}
                        </p>
                    </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="p-5 pb-4">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-[#c8ccd2]">
                                Columns
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#555c66]">
                                Field names and data types
                            </p>
                        </div>
                        {columns.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
                                {columns.map((column, index) => (
                                    <div
                                        key={
                                            column.cid ??
                                            column.name ??
                                            index
                                        }
                                        className={`flex items-center justify-between gap-4 px-3.5 py-2.5 ${index !== columns.length - 1
                                                ? 'border-b border-white/[0.05]'
                                                : ''
                                            }`}
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            {column.pk ? (
                                                <span className="shrink-0 rounded bg-amber-400/10 px-1.5 py-0.5 text-[8px] font-semibold text-amber-400">
                                                    PK
                                                </span>
                                            ) : (
                                                <span className="w-4 shrink-0" />
                                            )}

                                            <span className="truncate font-mono text-xs text-[#c5c9d0]">
                                                {column.name}
                                            </span>
                                        </div>

                                        <span className="shrink-0 rounded-md border border-blue-400/10 bg-blue-400/[0.05] px-2 py-0.5 font-mono text-[10px] text-blue-300/80">
                                            {column.type || 'ANY'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-white/[0.07] py-8 text-center text-xs text-[#626975]">
                                No column information available.
                            </div>
                        )}
                    </div>
                    <div className="px-5 pb-5">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-[#c8ccd2]">
                                Sample records
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#555c66]">
                                First 2 rows from this table
                            </p>
                        </div>

                        {sampleRows.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
                                <table className="w-full min-w-max text-left">
                                    <thead className="border-b border-white/[0.07] bg-white/[0.025]">
                                        <tr>
                                            {columns.map(
                                                (column, index) => (
                                                    <th
                                                        key={
                                                            column.cid ??
                                                            column.name ??
                                                            index
                                                        }
                                                        className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] font-semibold text-[#7f8792]"
                                                    >
                                                        {column.name}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sampleRows.map(
                                            (row, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    className={
                                                        rowIndex <
                                                            sampleRows.length - 1
                                                            ? 'border-b border-white/[0.05]'
                                                            : ''
                                                    }
                                                >
                                                    {columns.map(
                                                        (
                                                            column,
                                                            columnIndex
                                                        ) => {
                                                            const value =
                                                                row[
                                                                column.name
                                                                ];

                                                            return (
                                                                <td
                                                                    key={
                                                                        column.cid ??
                                                                        column.name ??
                                                                        columnIndex
                                                                    }
                                                                    className="max-w-[220px] truncate whitespace-nowrap px-3 py-2.5 font-mono text-[10px] text-[#aeb4bd]"
                                                                    title={
                                                                        value ===
                                                                            null
                                                                            ? 'NULL'
                                                                            : String(
                                                                                value
                                                                            )
                                                                    }
                                                                >
                                                                    {value ===
                                                                        null
                                                                        ? 'NULL'
                                                                        : value ===
                                                                            undefined
                                                                            ? '—'
                                                                            : String(
                                                                                value
                                                                            )}
                                                                </td>
                                                            );
                                                        }
                                                    )}
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-white/[0.07] px-4 py-8 text-center">
                                <p className="text-xs text-[#626975]">
                                    No sample records available.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="shrink-0 border-t border-white/[0.07] bg-white/[0.015] px-5 py-3.5">
                    <p className="text-[11px] leading-5 text-[#626975]">
                        Use the table and column names above when
                        writing your question.
                    </p>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
