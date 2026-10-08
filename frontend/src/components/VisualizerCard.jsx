import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Hash, ScatterChart as ScatterIcon, Table as TableIcon, Inbox } from 'lucide-react';

const COLORS = [
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6',
  '#34d399', '#fbbf24', '#f87171', '#a78bfa',
  '#60a5fa', '#a78bfa', '#f472b6', '#4ade80'
];

const SUPPORTED_TYPES = new Set(['bar', 'line', 'pie', 'scatter', 'kpi', 'table', 'none']);

function formatNumberCompact(num) {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const abs = Math.abs(num);
  if (abs >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (abs >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3 && abs >= 10000) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatKPIValue(val, format, unit, currency = 'USD') {
  if (val === null || val === undefined) return '-';

  const num = typeof val === 'number' ? val : parseFloat(val);
  const isNum = !isNaN(num);

  if (!isNum) return String(val);

  if (format === 'percentage') {
    return `${(num > 1 ? num : num * 100).toFixed(1)}%`;
  }
  if (format === 'currency') {
    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${formatNumberCompact(num)}`;
  }
  if (format === 'unit' && unit) {
    return `${formatNumberCompact(num)} ${unit}`;
  }
  if (format === 'integer') {
    return formatNumberCompact(Math.round(num));
  }
  return formatNumberCompact(num);
}

export function VisualizerCard({ chartType: rawChartType, chartConfig = {}, data = [], summary, title }) {
  const normalizedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map((row) => {
      const cleanRow = { ...row };
      Object.keys(cleanRow).forEach((key) => {
        const val = cleanRow[key];
        if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
          cleanRow[key] = parseFloat(val);
        }
      });
      return cleanRow;
    });
  }, [data]);

  const columns = useMemo(() => {
    if (normalizedData.length === 0) return [];
    return Object.keys(normalizedData[0]);
  }, [normalizedData]);

  const validatedType = useMemo(() => {
    let type = String(rawChartType || '').toLowerCase().trim();
    if (!SUPPORTED_TYPES.has(type)) type = 'table';
    if (normalizedData.length === 0) return 'none';

    const xKey = chartConfig.x;
    const yKey = chartConfig.y;
    const kpiKey = chartConfig.kpi_value_column;

    if (type === 'kpi' && (!kpiKey || !columns.includes(kpiKey))) {
      type = 'table';
    }
    if (type === 'scatter') {
      const xValid = xKey && columns.includes(xKey) && typeof normalizedData[0][xKey] === 'number';
      const yValid = yKey && columns.includes(yKey) && typeof normalizedData[0][yKey] === 'number';
      if (!xValid || !yValid) type = 'table';
    }
    if (type === 'bar' || type === 'line') {
      if (!yKey || !columns.includes(yKey) || typeof normalizedData[0][yKey] !== 'number') {
        type = 'table';
      }
    }
    if (type === 'pie') {
      if (!yKey || !columns.includes(yKey) || typeof normalizedData[0][yKey] !== 'number') {
        type = 'table';
      }
    }

    return type;
  }, [rawChartType, normalizedData, columns, chartConfig]);

  const xKey = chartConfig.x || columns[0];
  const yKey = chartConfig.y || (columns[1] || columns[0]);
  const chartTitle = chartConfig.title || title || 'Data Visualization';

  const pieData = useMemo(() => {
    if (validatedType !== 'pie') return [];
    if (normalizedData.length <= 6) return normalizedData;

    const sorted = [...normalizedData].sort((a, b) => (b[yKey] || 0) - (a[yKey] || 0));
    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5);

    const otherSum = rest.reduce((acc, row) => acc + (Number(row[yKey]) || 0), 0);
    if (otherSum > 0) {
      top5.push({ [xKey]: 'Other', [yKey]: otherSum });
    }
    return top5;
  }, [normalizedData, validatedType, xKey, yKey]);

  const lineData = useMemo(() => {
    if (validatedType !== 'line') return normalizedData;
    if (!chartConfig.sort_x) return normalizedData;
    return [...normalizedData].sort((a, b) => {
      const valA = a[xKey];
      const valB = b[xKey];
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  }, [normalizedData, validatedType, xKey, chartConfig]);

  const renderChart = () => {
    switch (validatedType) {
      case 'none':
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800/80">
            <div className="p-3 bg-slate-800/60 text-slate-400 rounded-2xl mb-3">
              <Inbox className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-slate-200">No Query Results Returned</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              The query executed successfully but returned 0 rows matching your criteria.
            </p>
          </div>
        );

      case 'kpi': {
        const kpiValCol = chartConfig.kpi_value_column || yKey || columns[0];
        const val = normalizedData[0] ? normalizedData[0][kpiValCol] : null;
        const formattedVal = formatKPIValue(
          val,
          chartConfig.format,
          chartConfig.unit,
          chartConfig.currency
        );

        return (
          <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/80 rounded-2xl border border-indigo-500/20 shadow-xl">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-3 border border-indigo-500/20">
              <Hash className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{chartTitle}</span>
            <span className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 mt-2 tracking-tight">
              {formattedVal}
            </span>
            <span className="text-[11px] text-slate-500 mt-2 font-mono">{kpiValCol}</span>
          </div>
        );
      }

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey={xKey}
                name={xKey}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                unit=""
              />
              <YAxis
                dataKey={yKey}
                name={yKey}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                unit=""
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
              />
              <Scatter name={chartTitle} data={normalizedData} fill="#38bdf8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'bar': {
        const isVertical = chartConfig.layout === 'vertical';
        const seriesList = (chartConfig.series && chartConfig.series.length > 0) ? chartConfig.series : [yKey];

        return (
          <ResponsiveContainer width="100%" height={Math.max(340, normalizedData.length * (isVertical ? 30 : 0))}>
            <BarChart
              data={normalizedData}
              layout={isVertical ? 'vertical' : 'horizontal'}
              margin={{ top: 20, right: 30, left: isVertical ? 80 : 20, bottom: isVertical ? 20 : 45 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={!isVertical} horizontal={isVertical} />
              {isVertical ? (
                <>
                  <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis dataKey={xKey} type="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xKey}
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    interval={normalizedData.length > 15 ? 'preserveStartEnd' : 0}
                    angle={normalizedData.length > 8 ? -30 : 0}
                    textAnchor={normalizedData.length > 8 ? 'end' : 'middle'}
                  />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                </>
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
              />
              {seriesList.length > 1 && <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />}
              {seriesList.map((sKey, idx) => (
                <Bar
                  key={sKey}
                  dataKey={sKey}
                  fill={COLORS[idx % COLORS.length]}
                  radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'line': {
        const seriesList = (chartConfig.series && chartConfig.series.length > 0) ? chartConfig.series : [yKey];

        return (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey={xKey}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={lineData.length > 12 ? 'preserveStartEnd' : 0}
                angle={lineData.length > 8 ? -25 : 0}
                textAnchor={lineData.length > 8 ? 'end' : 'middle'}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
              />
              {seriesList.length > 1 && <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />}
              {seriesList.map((sKey, idx) => (
                <Line
                  key={sKey}
                  type="monotone"
                  dataKey={sKey}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={3}
                  dot={{ fill: COLORS[idx % COLORS.length], r: 4 }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      }

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
              />
              <Pie
                data={pieData}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={55}
                paddingAngle={4}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '15px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'table':
      default:
        return (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 max-h-96">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-sans">
                {normalizedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    {columns.map((col) => {
                      const val = row[col];
                      let displayVal = val;
                      if (val === null || val === undefined) displayVal = '-';
                      else if (typeof val === 'boolean') displayVal = val ? 'True' : 'False';
                      else if (typeof val === 'number') displayVal = formatNumberCompact(val);

                      return (
                        <td key={col} className="px-4 py-2.5 whitespace-nowrap max-w-xs truncate">
                          {String(displayVal)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  const getIcon = () => {
    switch (validatedType) {
      case 'bar': return <BarChart3 className="w-4 h-4 text-cyan-400" />;
      case 'line': return <LineIcon className="w-4 h-4 text-purple-400" />;
      case 'pie': return <PieIcon className="w-4 h-4 text-pink-400" />;
      case 'scatter': return <ScatterIcon className="w-4 h-4 text-indigo-400" />;
      case 'kpi': return <Hash className="w-4 h-4 text-emerald-400" />;
      case 'none': return <Inbox className="w-4 h-4 text-slate-500" />;
      case 'table':
      default: return <TableIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">{chartTitle}</h3>
            <p className="text-xs text-slate-400">
              Visualization Mode:{' '}
              <span className="uppercase text-cyan-400 font-semibold font-mono">
                {validatedType}
              </span>
            </p>
          </div>
        </div>
      </div>

      {summary && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-cyan-400">Analyst Summary: </span>
          {summary}
        </div>
      )}

      <div className="w-full">
        {renderChart()}
      </div>
    </div>
  );
}
