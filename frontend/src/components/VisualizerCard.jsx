import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Hash,
  Table2,
  Inbox,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#22d3ee', '#fb7185', '#818cf8'];
const GRID = 'rgba(255,255,255,0.06)';
const TICK = { fill: '#7b818a', fontSize: 11 };
const SUPPORTED_TYPES = new Set(['bar', 'line', 'pie', 'scatter', 'kpi', 'table', 'none']);

const compact = (n) =>
  new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const fullNumber = (n) =>
  Math.abs(n) >= 1e6
    ? compact(n)
    : n.toLocaleString(undefined, { maximumFractionDigits: 2 });

const trunc = (s, n) => {
  const t = String(s ?? '');
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

const isNumericKey = (rows, key) =>
  !!key &&
  rows.some((r) => typeof r[key] === 'number') &&
  rows.every((r) => r[key] === null || r[key] === undefined || typeof r[key] === 'number');

function formatKPI(val, format, unit, currency = 'USD') {
  if (val === null || val === undefined) return '-';
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return String(val);

  if (format === 'percentage') return `${(Math.abs(num) <= 1 ? num * 100 : num).toFixed(1)}%`;
  if (format === 'currency') {
    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${fullNumber(num)}`;
  }
  if (format === 'unit' && unit) return `${fullNumber(num)} ${unit}`;
  if (format === 'integer') return fullNumber(Math.round(num));
  return fullNumber(num);
}

const cell = (v) => {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  return String(v);
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#0d0f13]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur">
      {label !== undefined && label !== null && label !== '' && (
        <p className="text-[11px] text-slate-400">{String(label)}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="mt-0.5 font-mono text-sm font-semibold text-white">
          <span className="font-sans text-[11px] font-normal text-slate-400">{p.name ?? p.dataKey}: </span>
          {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(p.value)}
        </p>
      ))}
    </div>
  );
}

const typeMeta = {
  bar: { icon: BarChart3, label: 'Bar chart' },
  line: { icon: LineIcon, label: 'Line chart' },
  pie: { icon: PieIcon, label: 'Pie chart' },
  scatter: { icon: ScatterIcon, label: 'Scatter plot' },
  kpi: { icon: Hash, label: 'Single value' },
  table: { icon: Table2, label: 'Table' },
  none: { icon: Inbox, label: 'No results' },
};

export function VisualizerCard({
  chartType: rawChartType,
  chartConfig: rawConfig,
  data,
  summary,
  title,
  onViewTable, 
}) {
  const chartConfig = rawConfig || {};

  const numericKeys = useMemo(() => {
    const keys = [
      chartConfig.y,
      chartConfig.kpi_value_column,
      ...(Array.isArray(chartConfig.series) ? chartConfig.series : []),
    ];
    if (rawChartType === 'scatter') keys.push(chartConfig.x);
    return new Set(keys.filter(Boolean));
  }, [chartConfig, rawChartType]);

  const normalizedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map((row) => {
      const clean = { ...row };
      numericKeys.forEach((key) => {
        const v = clean[key];
        if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) clean[key] = Number(v);
      });
      return clean;
    });
  }, [data, numericKeys]);

  const columns = useMemo(
    () => (normalizedData.length ? Object.keys(normalizedData[0]) : []),
    [normalizedData]
  );

  const xKey = chartConfig.x && columns.includes(chartConfig.x) ? chartConfig.x : columns[0];
  const yKey =
    chartConfig.y && columns.includes(chartConfig.y)
      ? chartConfig.y
      : columns.find((c) => c !== xKey && isNumericKey(normalizedData, c));
  const kpiKey =
    chartConfig.kpi_value_column && columns.includes(chartConfig.kpi_value_column)
      ? chartConfig.kpi_value_column
      : yKey;

  const seriesList = useMemo(() => {
    const list = (Array.isArray(chartConfig.series) ? chartConfig.series : []).filter(
      (k) => columns.includes(k) && isNumericKey(normalizedData, k)
    );
    return list.length ? list : yKey ? [yKey] : [];
  }, [chartConfig, columns, normalizedData, yKey]);

  const validatedType = useMemo(() => {
    if (normalizedData.length === 0) return 'none';

    let type = String(rawChartType || '').toLowerCase().trim();
    if (!SUPPORTED_TYPES.has(type) || type === 'none') type = 'table';

    const numeric = (k) => isNumericKey(normalizedData, k);

    if (type === 'kpi' && !numeric(kpiKey)) type = 'table';
    if ((type === 'bar' || type === 'line' || type === 'pie') && !(xKey && numeric(yKey))) type = 'table';
    if (type === 'scatter' && !(numeric(xKey) && numeric(yKey))) type = 'table';

    return type;
  }, [rawChartType, normalizedData, xKey, yKey, kpiKey]);

  const chartTitle = chartConfig.title || title || 'Visualization';

  const pieSlices = useMemo(() => {
    if (validatedType !== 'pie') return [];
    let slices = normalizedData
      .filter((r) => typeof r[yKey] === 'number' && r[yKey] > 0)
      .map((r) => ({ name: String(r[xKey]), value: r[yKey] }))
      .sort((a, b) => b.value - a.value);

    if (slices.length > 7) {
      const rest = slices.slice(6).reduce((s, r) => s + r.value, 0);
      slices = [...slices.slice(0, 6), { name: 'Other', value: rest }];
    }
    return slices;
  }, [normalizedData, validatedType, xKey, yKey]);

  const lineData = useMemo(() => {
    if (validatedType !== 'line' || !chartConfig.sort_x) return normalizedData;
    return [...normalizedData].sort((a, b) => {
      const A = a[xKey];
      const B = b[xKey];
      if (typeof A === 'number' && typeof B === 'number') return A - B;
      return String(A).localeCompare(String(B));
    });
  }, [normalizedData, validatedType, xKey, chartConfig]);

  const renderChart = () => {
    switch (validatedType) {
      case 'none':
        return (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.015] px-6 py-14 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
              <Inbox className="h-4 w-4 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-200">No rows returned</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              The query ran, but nothing matched. Try rewording your question.
            </p>
          </div>
        );

      case 'kpi': {
        const val = normalizedData[0]?.[kpiKey];
        return (
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0d11] px-6 py-14">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-blue-500/[0.12] blur-3xl" />
            <span className="relative text-xs font-medium text-slate-400">{chartTitle}</span>
            <span className="relative mt-3 bg-gradient-to-r from-white via-[#cbd5e1] to-[#7dd3fc] bg-clip-text text-5xl font-semibold tracking-[-0.04em] text-transparent sm:text-6xl">
              {formatKPI(val, chartConfig.format, chartConfig.unit, chartConfig.currency)}
            </span>
            <span className="relative mt-3 rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 font-mono text-[11px] text-slate-500">
              {kpiKey}
            </span>
          </div>
        );
      }

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis dataKey={xKey} name={xKey} type="number" tick={TICK} tickLine={false} axisLine={{ stroke: GRID }} tickFormatter={compact} />
              <YAxis dataKey={yKey} name={yKey} type="number" tick={TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={52} />
              <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
              <Scatter data={normalizedData} fill="#60a5fa" fillOpacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'bar': {
        const horizontal = chartConfig.layout === 'horizontal';
        const tilt = !horizontal && normalizedData.length > 5;
        const height = horizontal ? Math.max(320, normalizedData.length * 34 + 48) : 340;

        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={normalizedData}
              layout={horizontal ? 'vertical' : 'horizontal'}
              margin={{ top: 8, right: 16, left: horizontal ? 8 : 0, bottom: 0 }}
            >
              <CartesianGrid stroke={GRID} vertical={horizontal} horizontal={!horizontal} />
              {horizontal ? (
                <>
                  <XAxis type="number" tick={TICK} tickLine={false} axisLine={false} tickFormatter={compact} />
                  <YAxis
                    type="category"
                    dataKey={xKey}
                    tick={TICK}
                    tickLine={false}
                    axisLine={false}
                    width={130}
                    interval={0}
                    tickFormatter={(v) => trunc(v, 18)}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xKey}
                    tick={TICK}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                    interval={normalizedData.length > 15 ? 'preserveStartEnd' : 0}
                    tickFormatter={(v) => trunc(v, 14)}
                    angle={tilt ? -30 : 0}
                    textAnchor={tilt ? 'end' : 'middle'}
                    height={tilt ? 58 : 30}
                  />
                  <YAxis tick={TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={52} />
                </>
              )}
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              {seriesList.length > 1 && <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 8, fontSize: 12 }} />}
              {seriesList.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.9}
                  maxBarSize={56}
                  radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'line': {
        const tilt = lineData.length > 8;
        return (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={lineData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis
                dataKey={xKey}
                tick={TICK}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                interval={lineData.length > 12 ? 'preserveStartEnd' : 0}
                tickFormatter={(v) => trunc(v, 12)}
                angle={tilt ? -30 : 0}
                textAnchor={tilt ? 'end' : 'middle'}
                height={tilt ? 58 : 30}
              />
              <YAxis tick={TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={52} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
              {seriesList.length > 1 && <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 8, fontSize: 12 }} />}
              {seriesList.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0d0f13', stroke: COLORS[i % COLORS.length], strokeWidth: 2 }}
                  activeDot={{ r: 5.5, strokeWidth: 2, stroke: '#0d0f13', fill: COLORS[i % COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      }

      case 'pie': {
        const total = pieSlices.reduce((s, r) => s + r.value, 0);
        return (
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="relative min-w-0">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie data={pieSlices} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3} stroke="none">
                    {pieSlices.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] text-slate-500">Total</span>
                <span className="font-mono text-xl font-semibold text-white">{compact(total)}</span>
              </div>
            </div>

            <ul className="min-w-0 space-y-1.5">
              {pieSlices.map((s, i) => (
                <li
                  key={s.name + i}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate text-xs text-slate-300">{s.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 font-mono text-xs">
                    <span className="text-slate-500">{((s.value / total) * 100).toFixed(0)}%</span>
                    <span className="text-slate-200">{fullNumber(s.value)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'table':
      default: {
        const preview = normalizedData.slice(0, 8);
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Table2 className="h-4 w-4 text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200">This result reads best as a table</p>
                {chartConfig.reason && (
                  <p className="mt-1 text-xs leading-5 text-slate-500">{chartConfig.reason}</p>
                )}
              </div>
              {onViewTable && (
                <button
                  onClick={onViewTable}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.07]"
                >
                  Full table
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-auto rounded-xl border border-white/[0.07] bg-[#0b0d11]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-white/[0.07] bg-[#0b0d11] text-slate-400">
                  <tr>
                    {columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-4 py-3 font-semibold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      {columns.map((c) => (
                        <td key={c} className="max-w-xs truncate whitespace-nowrap px-4 py-2.5 text-slate-300">
                          {cell(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {normalizedData.length > preview.length && (
              <p className="text-xs text-slate-500">
                Showing {preview.length} of {normalizedData.length} rows.
              </p>
            )}
          </div>
        );
      }
    }
  };

  const meta = typeMeta[validatedType] || typeMeta.table;
  const MetaIcon = meta.icon;
  const isChart = ['bar', 'line', 'pie', 'scatter'].includes(validatedType);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0f13] shadow-2xl">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-500/[0.07] blur-3xl" />

      <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
            <MetaIcon className="h-4 w-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-[-0.01em] text-white">{chartTitle}</h3>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {isChart && yKey && xKey ? `${yKey} by ${xKey}` : 'Auto-selected visualization'}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-300">
          {meta.label}
        </span>
      </div>

      <div className="relative p-5">{renderChart()}</div>

      {summary && (
        <div className="relative border-t border-white/[0.07] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/[0.08]">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Insight</p>
              <p className="mt-1 text-xs leading-6 text-slate-400">{summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}