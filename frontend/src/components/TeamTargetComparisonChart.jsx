import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';

export default function TeamTargetComparisonChart({ teamComparison = [], timeframe = 'monthly' }) {
  const multiplier = timeframe === 'weekly' ? (7 / 30.416) : timeframe === 'yearly' ? 12 : 1;
  const unit = timeframe === 'weekly' ? '/wk' : timeframe === 'yearly' ? '/yr' : '/mo';
  const timeframeLabel = timeframe === 'weekly' ? 'Weekly' : timeframe === 'yearly' ? 'Annual' : 'Monthly';

  const formattedData = teamComparison.map((t) => {
    const rawLimit = t.currentSpend || 0;
    const rawUsed = t.actualUsedSpend !== undefined 
      ? t.actualUsedSpend 
      : Math.round(rawLimit * ((t.cpuUtilPercent || 25) / 100));
    const rawTarget = t.targetSpend || rawLimit;
    const rawSavings = t.savings || Math.max(0, rawLimit - rawTarget);

    return {
      team: t.team.toUpperCase(),
      rawTeam: t.team,
      Limit: Math.round(rawLimit * multiplier),
      Used: Math.round(rawUsed * multiplier),
      Target: Math.round(rawTarget * multiplier),
      Savings: Math.round(rawSavings * multiplier)
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#090d16] border border-[#1e293b] p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-mono">
          <p className="font-bold text-white font-sans text-sm capitalize">{data.rawTeam} Team ({timeframeLabel})</p>
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <p className="text-rose-400 flex justify-between gap-4">
              <span>1. Purchased Limit:</span>
              <strong>₹{data.Limit.toLocaleString('en-IN')}{unit}</strong>
            </p>
            <p className="text-sky-400 flex justify-between gap-4">
              <span>2. Actually Used (Live):</span>
              <strong>₹{data.Used.toLocaleString('en-IN')}{unit}</strong>
            </p>
            <p className="text-emerald-400 flex justify-between gap-4">
              <span>3. Right-Sized Target:</span>
              <strong>₹{data.Target.toLocaleString('en-IN')}{unit}</strong>
            </p>
            <p className="text-amber-300 font-extrabold flex justify-between gap-4 pt-1 border-t border-slate-800/80">
              <span>Net Savings:</span>
              <span>₹{data.Savings.toLocaleString('en-IN')}{unit}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalTargetSpend = formattedData.reduce((acc, t) => acc + t.Target, 0);

  return (
    <div className="bg-[#0f172a]/90 border border-[#1e293b] rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1e293b]/70 pb-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">
              {timeframeLabel} Spend by Team
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Purchased Limit vs Live Utilization vs Right-Sized Target</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live 2s Sync
        </span>
      </div>

      {/* Bar Chart Container */}
      <div className="w-full h-72 my-auto">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-mono">
            Loading team benchmark data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="team" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="monospace" />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} fontFamily="monospace" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px' }}
                formatter={(value) => {
                  const labels = {
                    Limit: '1. Purchased Limit',
                    Used: '2. Live Actually Used',
                    Target: '3. Right-Sized Target'
                  };
                  return <span className="text-xs text-slate-300 font-medium px-1 font-sans">{labels[value] || value}</span>;
                }}
              />
              <Bar dataKey="Limit" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} isAnimationActive={true} animationDuration={500} />
              <Bar dataKey="Used" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={16} isAnimationActive={true} animationDuration={500} />
              <Bar dataKey="Target" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} isAnimationActive={true} animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Insight */}
      <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-[#1e293b]/70">
        <span>Dynamic FinOps scaling active ({timeframeLabel} View)</span>
        <span className="text-emerald-400 font-bold">Total Target: ₹{totalTargetSpend.toLocaleString('en-IN')}{unit}</span>
      </div>
    </div>
  );
}
