import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

export default function SeverityPieChart({ distribution = [] }) {
  const totalContainers = distribution.reduce((sum, item) => sum + (item.value || 0), 0);
  const activeDistribution = distribution.filter((item) => (item.value || 0) > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalContainers > 0 ? ((data.value / totalContainers) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#090d16] border border-[#1e293b] p-3 rounded-xl shadow-2xl text-xs space-y-1 font-mono">
          <p className="font-bold text-white font-sans">{data.name}</p>
          <p className="font-extrabold text-sm" style={{ color: data.color }}>
            {data.value} Workload{data.value !== 1 ? 's' : ''} ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0f172a]/90 border border-[#1e293b] rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1e293b]/70 pb-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">Waste Severity Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of workloads by utilization tier</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live 2s
        </span>
      </div>

      {/* Donut Chart with Guaranteed Centered Badge */}
      <div className="w-full h-56 my-auto relative flex items-center justify-center">
        {distribution.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-mono">
            Loading severity distribution...
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeDistribution}
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
                  {activeDistribution.map((entry) => (
                    <Cell key={`severity-cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Pixel-perfect HTML Center Overlay: Cannot collide or drift */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-3xl font-black font-mono text-white tracking-tight leading-none drop-shadow-md">
                {totalContainers}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 font-sans">
                Workloads
              </span>
            </div>
          </>
        )}
      </div>

      {/* Breakdown Legend with Real-Time Counts & % */}
      <div className="space-y-2 pt-3 border-t border-[#1e293b]/70 font-mono text-xs">
        {distribution.map((entry) => {
          const pct = totalContainers > 0 ? ((entry.value / totalContainers) * 100).toFixed(0) : 0;
          return (
            <div
              key={entry.name}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-900/50 border border-[#1e293b]/50 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-300 font-sans text-xs font-medium">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">{entry.value}</span>
                <span className="text-[10px] text-slate-400 font-sans">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
