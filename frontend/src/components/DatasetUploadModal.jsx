import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export function DatasetUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); 
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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

  const selectFile = (selected) => {
    setFile(selected);
    setUploadStatus(null);
    if (!tableName) {
      // Suggest clean table name from filename
      const base = selected.name.replace(/\.[^/.]+$/, "");
      setTableName(base.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", file);
    if (tableName.trim()) {
      formData.append("custom_table_name", tableName.trim());
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to upload file");
      }
      setUploadStatus({
        success: true,
        message: data.message,
        data: data,
      });
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      setUploadStatus({
        success: false,
        message: err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upload Your Dataset</h3>
              <p className="text-xs text-slate-400">Add custom CSV, Excel (.xlsx), or JSON data to query with AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-cyan-400 bg-cyan-950/20 scale-[1.01]"
              : file
              ? "border-emerald-500/50 bg-emerald-950/10"
              : "border-slate-700 hover:border-slate-500 bg-slate-900/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls, .json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])}
          />
          <div className="flex flex-col items-center">
            {file ? (
              <>
                <FileText className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
                <span className="text-sm font-semibold text-slate-100">{file.name}</span>
                <span className="text-xs text-slate-400 mt-1 font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <span className="text-[11px] text-cyan-400 mt-2 font-medium">Click to select a different file</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-slate-500 mb-2" />
                <span className="text-sm font-medium text-slate-200">
                  Drop your file here, or <span className="text-cyan-400 font-semibold underline">browse</span>
                </span>
                <span className="text-xs text-slate-500 mt-1">Supports .CSV, .XLSX, and .JSON</span>
              </>
            )}
          </div>
        </div>

        {/* Custom Table Name Configuration */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            SQL Table Name (Target in SQLite)
          </label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="e.g. sales_leads_2024"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            The AI agents will directly reference this table when writing SQL queries.
          </p>
        </div>

        {/* Upload Status Banner */}
        {uploadStatus && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
              uploadStatus.success
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                : "bg-rose-950/30 border-rose-500/30 text-rose-300"
            }`}
          >
            {uploadStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block mb-0.5">
                {uploadStatus.success ? "Ingestion Completed!" : "Upload Failed"}
              </span>
              <span>{uploadStatus.message}</span>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            {uploadStatus?.success ? "Done" : "Cancel"}
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ingesting Data...</span>
              </>
            ) : (
              <>
                <span>Import Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
