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

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

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
    <main className="w-full relative text-slate-100 ">
      <div className="absolute top-10 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10">
              <UploadCloud className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Dataset Import
                </h1>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Upload structured data files to instantly transform
                them into queryable SQLite tables
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs font-medium">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>.CSV Files</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs font-medium">
                <Sheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>.XLSX Excel</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs font-medium">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>.JSON Data</span>
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all overflow-hidden group ${dragActive
                ? 'border-blue-400 bg-blue-950/30 scale-[1.01]'
                : file
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-700/80 hover:border-blue-500/50 bg-slate-950/40 hover:bg-slate-900/50'
                }`}
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

              <div className="flex flex-col items-center relative z-10 p-4">
                {file ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400 shadow-inner">
                      <FileText className="w-7 h-7 animate-bounce" />
                    </div>
                    <span className="text-sm font-semibold text-slate-100">
                      {file.name}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-blue-400 mt-3 font-medium hover:underline">
                      Click or drop to change file
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition shadow-inner">
                      <UploadCloud className="w-7 h-7 transition-transform group-hover:-translate-y-1" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">
                      Drag and drop your file here, or{' '}
                      <span className="text-blue-400 font-semibold underline underline-offset-2">
                        browse files
                      </span>
                    </span>
                    <span className="text-xs text-slate-500 mt-1.5">
                      Supports CSV, Excel and JSON files up to
                      50MB
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-blue-400" />
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-blue-300 font-mono text-xs focus:outline-none focus:border-blue-500 transition shadow-inner"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The AI agents will directly reference this table
                when writing SQL queries.
              </p>
            </div>

            {uploadStatus && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-3 animate-fadeIn ${uploadStatus.success
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
              >
                {uploadStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block mb-0.5 text-xs">
                    {uploadStatus.success
                      ? 'Uploaded Successfully!'
                      : 'Upload Failed'}
                  </span>
                  <span className="opacity-90">
                    {uploadStatus.message}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-slate-800/80">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ingesting Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Import Table</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">

            <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    What happens after import?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pipeline execution flow
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">

                <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    01
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">
                      Dataset ingestion
                    </strong>
                    <span className="text-slate-400">
                      Your file is parsed and loaded into the application's SQLite database.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    02
                  </span>

                  <div>
                    <strong className="text-white block mb-0.5">
                      Schema discovery
                    </strong>
                    <span className="text-slate-400">
                      Table columns and data types become available to the query system.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    03
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">
                      Natural language querying
                    </strong>
                    <span className="text-slate-400">
                      Ask questions about the dataset and the Text2SQL agents can generate SQL.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Naming Conventions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tips for seamless AI recognition
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Use lowercase characters and underscores for table names
                (e.g.{' '}
                <code className="text-blue-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
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
