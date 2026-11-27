import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Activity } from 'lucide-react';

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function CostByTeamChart({ teams = [], timeframe = 'monthly' }) {
  const [viewMode, setViewMode] = useState('live'); // 'live' or 'limit'

  const multiplier = timeframe === 'weekly' ? (7 / 30.416) : timeframe === 'yearly' ? 12 : 1;
  const unit = timeframe === 'weekly' ? '/wk' : timeframe === 'yearly' ? '/yr' : '/mo';
  const timeframeLabel = timeframe === 'weekly' ? 'Weekly' : timeframe === 'yearly' ? 'Annual' : 'Monthly';

  const formattedData = teams.map((t, index) => {
    const baseVal = viewMode === 'live'
      ? (t.actualUsedSpend !== undefined ? t.actualUsedSpend : Math.round(t.monthlySpend * 0.35))
      : t.monthlySpend;
    const scaledVal = Math.round(baseVal * multiplier);

    return {
      name: t.team.toUpperCase(),
      team: t.team,
      value: Math.max(1, scaledVal),
      actualUsedSpend: t.actualUsedSpend,
      monthlySpend: t.monthlySpend,
      containerCount: t.containerCount || 3,
      color: COLORS[index % COLORS.length]
    };
  });

  const totalValue = formattedData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#090d16] border border-[#1e293b] p-3 rounded-xl shadow-2xl text-xs space-y-1 font-mono">
          <p className="font-bold text-white font-sans flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></span>
            {data.name} Team ({timeframeLabel})
          </p>
          <p className="font-extrabold text-sm text-sky-400">
            ₹{data.value.toLocaleString('en-IN')}{unit} ({pct}%)
          </p>
          <p className="text-slate-400 font-sans">
            Assigned: {data.containerCount} Microservice{data.containerCount !== 1 ? 's' : ''}
          </p>
          <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-1">
            {viewMode === 'live' ? 'Dynamic Monitored Expenditure' : 'Contracted Limit Capacity'}
          </p>
        </div>
      );
    }
    return null;
  };

  const centerBadgeText = totalValue >= 100000 
    ? `₹${(totalValue / 100000).toFixed(1)}L` 
    : `₹${Math.round(totalValue / 1000)}k`;

  return (
    <div className="bg-[#0f172a]/90 border border-[#1e293b] rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b]/70 pb-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">
              {timeframeLabel} Spend by Team
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Cost distribution across 5 engineering departments</p>
          </div>
        </div>

        {/* View Toggle & Live Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-900/90 rounded-lg p-0.5 border border-[#1e293b] text-[11px] font-mono">
            <button
              onClick={() => setViewMode('live')}
              className={`px-2.5 py-1 rounded-md transition-all font-bold flex items-center gap-1 ${
                viewMode === 'live'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              Live Used
            </button>
            <button
              onClick={() => setViewMode('limit')}
              className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                viewMode === 'limit'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Budget Limit
            </button>
          </div>

          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded-full font-mono font-bold border border-emerald-500/30 flex items-center gap-1 shadow-sm shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            2s
          </span>
        </div>
      </div>

      {/* Donut Chart with Centered HTML Badge */}
      <div className="w-full h-56 my-auto relative flex items-center justify-center">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-mono">
            Loading team cost distribution...
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={4}
                  cornerRadius={5}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                  stroke="#0f172a"
                  strokeWidth={2}
                >
                  {formattedData.map((entry) => (
                    <Cell key={`team-cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Guaranteed Centered Center Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xl font-black font-mono text-white tracking-tight leading-none drop-shadow-md">
                {centerBadgeText}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-sans">
                {viewMode === 'live' ? 'Live' : 'Budget'} ({timeframeLabel})
              </span>
            </div>
          </>
        )}
      </div>

      {/* Custom Team Breakdown List */}
      <div className="space-y-1.5 pt-3 border-t border-[#1e293b]/70 font-mono text-xs">
        {formattedData.map((entry) => {
          const pct = totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(0) : 0;
          return (
            <div
              key={entry.name}
              className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-900/40 border border-[#1e293b]/40 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-300 font-sans text-xs font-medium capitalize">{entry.team} Team</span>
                <span className="text-[10px] text-slate-500 font-mono">({entry.containerCount} svcs)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">₹{entry.value.toLocaleString('en-IN')}{unit}</span>
                <span className="text-[10px] text-slate-400 font-sans">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
