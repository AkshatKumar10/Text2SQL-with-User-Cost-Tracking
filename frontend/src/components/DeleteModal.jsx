import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export function DeleteModal({
    isOpen,
    tableName,
    rowCount,
    loading = false,
    onConfirm,
    onCancel,
}) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => !loading && onCancel()}
            />
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0d1017] shadow-2xl shadow-black/60">
                <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
                <button
                    onClick={onCancel}
                    disabled={loading}
                    aria-label="Close"
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
                <div className="relative p-6 sm:p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/25
bg-gradient-to-br from-indigo-500/15 to-indigo-500/5
text-indigo-400
shadow-indigo-500/10">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <h2 className="mt-5 text-xl font-bold tracking-tight text-white">
                        Delete this table?
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        You're about to permanently delete{" "}
                        <code className="rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 font-mono text-xs text-indigo-300">
                            {tableName}
                        </code>

                        {typeof rowCount === "number" && (
                            <>
                                {" "}and its{" "}
                                <span className="font-semibold text-slate-200">
                                    {rowCount.toLocaleString()}{" "}
                                    {rowCount === 1 ? "row" : "rows"}
                                </span>
                            </>
                        )}
                        .
                    </p>
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <p className="text-xs leading-5 text-amber-200/90">
                            This can't be undone. Any question that depends on this table
                            will stop working until you import it again.
                        </p>
                    </div>
                    <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="cursor-pointer rounded-xl border border-slate-700/80 bg-slate-900/60 px-5 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:from-rose-400 hover:to-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete table
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}