import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Database,
  Sparkles,
  FileCode,
  Sheet,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import api from '../api/axiosClient';

export function DatasetUpload({
  onClose,
  onUploadSuccess,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const selectFile = (selected) => {
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setTableName('');
      setUploadStatus({
        success: false,
        message: 'File size must be 50 MB or less.',
      });
      return;
    }

    setFile(selected);
    setUploadStatus(null);

    const fileName = selected.name
      .replace(/\.[^/.]+$/, '')
      .trim();

    const tableName = fileName
      .replace(/[^a-zA-Z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();

    setTableName(tableName || 'uploaded_data');
  };

  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    if (tableName.trim()) {
      formData.append(
        'custom_table_name',
        tableName.trim()
      );
    }

    try {
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;

      setUploadStatus({
        success: true,
        message: data.message,
        data: data,
      });

      if (onUploadSuccess) {
        await onUploadSuccess(data);
      }

      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        'Failed to upload file. Please try again.';

      setUploadStatus({
        success: false,
        message: errorMessage,
      });

      setUploading(false);
    }
  };

  return (
    <main className="relative w-full min-w-0 overflow-hidden px-3 pb-8 text-slate-100 sm:px-4 lg:px-6">
      <div className="pointer-events-none absolute right-[-8rem] top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl sm:right-20 sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute bottom-20 left-[-8rem] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl sm:left-10 sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-5 sm:space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:pb-6">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 shadow-lg shadow-blue-500/10 sm:h-14 sm:w-14 sm:rounded-2xl">
              <UploadCloud className="h-5 w-5 animate-pulse sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0 flex-1 pr-1">
              <div className="flex min-w-0 items-center gap-2.5">
                <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Dataset Import
                </h1>
              </div>

              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6">
                Upload structured data files to instantly transform
                them into queryable SQLite tables
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-xl sm:space-y-6 sm:rounded-3xl sm:p-6 lg:col-span-7 lg:p-8">
            <div className="grid grid-cols-1 gap-2.5 min-[451px]:grid-cols-3">
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-300">
                <FileText className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                <span className="truncate">.CSV Files</span>
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-300">
                <Sheet className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">.XLSX Excel</span>
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-300">
                <FileCode className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span className="truncate">.JSON Data</span>
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition-all sm:p-8 ${
                dragActive
                  ? 'border-blue-400 bg-blue-950/30 scale-[1.01]'
                  : file
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : 'border-slate-700/80 bg-slate-950/40 hover:border-blue-500/50 hover:bg-slate-900/50'
              } cursor-pointer group`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    selectFile(e.target.files[0]);
                  }
                }}
              />

              <div className="relative z-10 flex flex-col items-center p-2 sm:p-4">
                {file ? (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-inner sm:h-14 sm:w-14">
                      <FileText className="h-6 w-6 animate-bounce sm:h-7 sm:w-7" />
                    </div>

                    <span className="max-w-full truncate px-2 text-sm font-semibold text-slate-100">
                      {file.name}
                    </span>

                    <span className="mt-1 rounded border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-400 sm:text-xs">
                      {formatFileSize(file.size)}
                    </span>

                    <span className="mt-3 text-xs font-medium text-blue-400 hover:underline">
                      Click or drop to change file
                    </span>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 shadow-inner transition group-hover:border-blue-500/30 group-hover:text-blue-400 sm:h-14 sm:w-14">
                      <UploadCloud className="h-6 w-6 transition-transform group-hover:-translate-y-1 sm:h-7 sm:w-7" />
                    </div>

                    <span className="text-xs font-medium leading-5 text-slate-200 sm:text-sm">
                      Drag and drop your file here, or{' '}
                      <span className="font-semibold text-blue-400 underline underline-offset-2">
                        browse files
                      </span>
                    </span>

                    <span className="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
                      Supports CSV, Excel and JSON files up to
                      50MB
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Database className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                <span>SQL Table Name</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) =>
                    setTableName(e.target.value)
                  }
                  placeholder="e.g. sales_leads_2024"
                  className="w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-3 font-mono text-xs text-blue-300 shadow-inner transition focus:border-blue-500 focus:outline-none sm:px-4"
                />
              </div>

              <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">
                The AI agents will directly reference this table
                when writing SQL queries.
              </p>
            </div>

            {uploadStatus && (
              <div
                className={`flex items-start gap-3 rounded-xl border p-3 text-xs animate-fadeIn sm:p-4 ${
                  uploadStatus.success
                    ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-950/40 text-rose-300'
                }`}
              >
                {uploadStatus.success ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                )}

                <div className="min-w-0">
                  <span className="mb-0.5 block text-xs font-semibold">
                    {uploadStatus.success
                      ? 'Uploaded Successfully!'
                      : 'Upload Failed'}
                  </span>

                  <span className="break-words opacity-90">
                    {uploadStatus.message}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end border-t border-slate-800/80 pt-4">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-400 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 min-[451px]:w-auto min-[451px]:px-6"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Ingesting Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Import Table</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="min-w-0 space-y-5 lg:col-span-5 lg:space-y-6">
            <div className="space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                  <Layers className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">
                    What happens after import?
                  </h3>

                  <p className="text-xs text-slate-400">
                    Pipeline execution flow
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-950/50 px-3 py-3 sm:px-4 sm:py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-mono text-[10px] font-bold text-blue-400">
                    01
                  </span>

                  <div className="min-w-0">
                    <strong className="mb-0.5 block text-white">
                      Dataset ingestion
                    </strong>

                    <span className="leading-5 text-slate-400">
                      Your file is parsed and loaded into the application's SQLite database.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-950/50 px-3 py-3 sm:px-4 sm:py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-mono text-[10px] font-bold text-blue-400">
                    02
                  </span>

                  <div className="min-w-0">
                    <strong className="mb-0.5 block text-white">
                      Schema discovery
                    </strong>

                    <span className="leading-5 text-slate-400">
                      Table columns and data types become available to the query system.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-950/50 px-3 py-3 sm:px-4 sm:py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-mono text-[10px] font-bold text-blue-400">
                    03
                  </span>

                  <div className="min-w-0">
                    <strong className="mb-0.5 block text-white">
                      Natural language querying
                    </strong>

                    <span className="leading-5 text-slate-400">
                      Ask questions about the dataset and the Text2SQL agents can generate SQL.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">
                    Naming Conventions
                  </h3>

                  <p className="text-xs text-slate-400">
                    Tips for seamless AI recognition
                  </p>
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-400 sm:leading-relaxed">
                Use lowercase characters and underscores for table names
                (e.g.{' '}
                <code className="rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 font-mono text-blue-300">
                  customer_orders
                </code>
                ). Avoid spaces or special symbols to ensure maximum
                precision when AI agents generate complex joins and filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}