import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'USING', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN', 'EXISTS', 'DESC', 'ASC', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'ALL', 'WITH', 'OVER', 'PARTITION', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER',
]);

const TOKEN_RE = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*')|("[^"]*"|`[^`]*`)|(-?\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

const styles = {
  comment: 'italic text-slate-500',
  string: 'text-emerald-300',
  quoted: 'text-slate-200',
  number: 'text-amber-300',
  keyword: 'font-semibold text-blue-400',
  func: 'text-violet-300',
};

function tokenize(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    const [full, comment, str, quoted, num, word] = m;
    let cls;
    if (comment) cls = styles.comment;
    else if (str) cls = styles.string;
    else if (quoted) cls = styles.quoted;
    else if (num) cls = styles.number;
    else if (word) {
      if (KEYWORDS.has(word.toUpperCase())) cls = styles.keyword;
      else if (text[m.index + full.length] === '(') cls = styles.func;
    }
    out.push({ text: full, cls });
    last = m.index + full.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

export function SqlCodeBlock({ code, title = 'Generated SQL' }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const sql = code || '';
  const tokens = useMemo(() => tokenize(sql), [sql]);
  const lineCount = sql ? sql.split('\n').length : 0;

  const handleCopy = async () => {
    if (!sql) return;

    try {
      await navigator.clipboard.writeText(sql);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = sql;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textarea);
      }
    }

    setCopied(true);
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#080a0d] shadow-2xl">
        <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-[#0d0f13] px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
              <Code2 className="h-3.5 w-3.5 text-blue-400" />
            </div>

            <span className="min-w-0 truncate text-xs font-semibold text-slate-200">
              {title}
            </span>

            {lineCount > 0 && (
              <span className="shrink-0 rounded-md border border-white/[0.07] bg-white/[0.025] px-1.5 py-0.5 font-mono text-[9px] text-slate-500 sm:px-2 sm:text-[10px]">
                {lineCount} {lineCount === 1 ? 'line' : 'lines'}
              </span>
            )}
          </div>

          <button onClick={handleCopy} disabled={!sql} aria-label="Copy SQL to clipboard" className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition sm:h-auto sm:px-3 sm:py-1.5 sm:text-xs ${copied ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-white/[0.09] bg-white/[0.03] text-slate-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'} disabled:cursor-not-allowed disabled:opacity-40`}>
            {copied ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {sql ? (
          <div className="max-h-[60vh] min-h-0 w-full overflow-auto font-mono text-[11px] leading-5 sm:max-h-[480px] sm:text-[13px] sm:leading-6">
            <div className="flex min-w-max">
              <div aria-hidden className="sticky left-0 z-10 shrink-0 select-none self-stretch border-r border-white/[0.05] bg-[#080a0d] px-2.5 py-3 text-right text-slate-600 sm:px-4 sm:py-4">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i} className="min-h-5 sm:min-h-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              <pre className="m-0 min-w-max whitespace-pre px-3 py-3 text-[#c9ccd1] sm:px-5 sm:py-4">
                <code>
                  {tokens.map((token, index) =>
                    token.cls ? (
                      <span key={index} className={token.cls}>
                        {token.text}
                      </span>
                    ) : (
                      <React.Fragment key={index}>
                        {token.text}
                      </React.Fragment>
                    )
                  )}
                </code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[180px] items-center justify-center px-4 py-10 sm:min-h-[220px]">
            <p className="text-center text-xs text-slate-500">
              No SQL was generated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}