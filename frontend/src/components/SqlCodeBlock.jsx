import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'USING', 'GROUP', 'BY', 'ORDER','HAVING', 'LIMIT', 'OFFSET', 'AS', 'AND', 'OR', 'NOT', 'IN','IS', 'NULL', 'LIKE', 'BETWEEN', 'EXISTS', 'DESC', 'ASC', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION','ALL', 'WITH', 'OVER', 'PARTITION', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER',
]);


const TOKEN_RE = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*')|( [^"]*"|`[^`]*`)|(-?\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

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

  const tokens = useMemo(() => tokenize(code || ''), [code]);
  const lineCount = (code || '').split('\n').length;

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#080a0d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0d0f13] px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
              <Code2 className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{title}</span>
            <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-0.5 font-mono text-[10px] text-slate-500">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
          </div>

          <button
            onClick={handleCopy}
            disabled={!code}
            aria-label="Copy SQL to clipboard"
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
              copied
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                : 'border-white/[0.09] bg-white/[0.03] text-slate-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        {code ? (
          <div className="flex max-h-[480px] overflow-auto font-mono text-[13px] leading-6">
            <div
              aria-hidden
              className="sticky left-0 self-stretch select-none border-r border-white/[0.05] bg-[#080a0d] px-4 py-4 text-right text-slate-600"
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="m-0 flex-1 whitespace-pre px-5 py-4 text-[#c9ccd1]">
              <code>
                {tokens.map((t, i) =>
                  t.cls ? (
                    <span key={i} className={t.cls}>
                      {t.text}
                    </span>
                  ) : (
                    <React.Fragment key={i}>{t.text}</React.Fragment>
                  )
                )}
              </code>
            </pre>
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-xs text-slate-500">No SQL was generated.</p>
        )}
      </div>
    </div>
  );
}