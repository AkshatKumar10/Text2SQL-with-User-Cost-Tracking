import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Hash } from 'lucide-react';

const COLORS = [
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6',
  '#34d399', '#fbbf24', '#f87171', '#a78bfa'
];

export function VisualizerCard({ chartType, chartConfig, data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
        No data available to visualize.
      </div>
    );
  }

  const xKey = chartConfig?.x || Object.keys(data[0])[0];
  const yKey = chartConfig?.y || (Object.keys(data[0]).length > 1 ? Object.keys(data[0])[1] : Object.keys(data[0])[0]);
  const chartTitle = chartConfig?.title || title || 'Analytical Visualization';

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey={xKey}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
              />
              <Bar dataKey={yKey} fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey={xKey}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ fill: '#38bdf8', r: 5 }}
                activeDot={{ r: 8, stroke: '#818cf8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
              <Pie
                data={data}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={105}
                innerRadius={50}
                paddingAngle={4}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'kpi': {
        const kpiValCol = chartConfig?.kpi_value_column || yKey;
        const val = data[0] ? data[0][kpiValCol] : 'N/A';
        return (
          <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 rounded-xl border border-indigo-500/20">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full mb-3">
              <Hash className="w-8 h-8" />
            </div>
            <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">{chartTitle}</span>
            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 mt-2">
              {typeof val === 'number' ? (Number.isInteger(val) ? val.toLocaleString() : `$${val.toLocaleString()}`) : val}
            </span>
          </div>
        );
      }

      default:
        // Default to bar chart if 2+ columns, else table
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey={xKey} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
              <Bar dataKey={yKey} fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const getIcon = () => {
    switch (chartType) {
      case 'bar': return <BarChart3 className="w-4 h-4 text-cyan-400" />;
      case 'line': return <LineIcon className="w-4 h-4 text-purple-400" />;
      case 'pie': return <PieIcon className="w-4 h-4 text-pink-400" />;
      default: return <BarChart3 className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800/70 rounded-lg">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">{chartTitle}</h3>
            <p className="text-xs text-slate-400">Agent auto-selected: <span className="uppercase text-cyan-400 font-semibold">{chartType || 'Bar'}</span></p>
          </div>
        </div>
      </div>
      <div className="w-full">
        {renderChart()}
      </div>
    </div>
  );
}
