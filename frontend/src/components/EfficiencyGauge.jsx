import React from 'react';
import { Gauge, Cpu, HardDrive, Zap, Award } from 'lucide-react';

export default function EfficiencyGauge({ analytics }) {
  const score = analytics?.efficiencyScore || 68;
  const rating = analytics?.efficiencyRating || 'Fair';
  const totals = analytics?.resourceTotals || {
    totalCpuLimit: 10.75,
    totalCpuUsed: 3.45,
    overallCpuUtilPercent: 32.1,
    totalMemLimitMB: 4608,
    totalMemUsedMB: 1420,
    overallMemUtilPercent: 30.8
  };

  // Color theme based on score
  const getScoreColor = (val) => {
    if (val >= 80) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
    if (val >= 50) return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
    return { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
  };

  const scoreTheme = getScoreColor(score);

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">FinOps Cluster Efficiency Score</h3>
            <p className="text-xs text-slate-400">Composite efficiency index computed across all 12 workloads</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${scoreTheme.bg} ${scoreTheme.text} ${scoreTheme.border}`}>
          {rating} Score
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Metric Gauge Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-700/40 relative">
          <div className="relative flex items-center justify-center">
            <svg className="w-36 h-36">
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                className={scoreTheme.text}
                strokeDasharray={351}
                strokeDashoffset={351 - (351 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold tracking-tight ${scoreTheme.text}`}>{score}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Out of 100</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Target Score: 85+</span>
          </div>
        </div>

        {/* Total CPU Allocation vs Usage */}
        <div className="space-y-4 p-5 bg-slate-900/40 rounded-xl border border-slate-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Total CPU Cores</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">{totals.overallCpuUtilPercent}% Utilized</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Used: <strong>{totals.totalCpuUsed} Cores</strong></span>
              <span className="text-slate-400">Limit: {totals.totalCpuLimit} Cores</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, totals.overallCpuUtilPercent)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Over-provisioned by <strong className="text-amber-300 font-mono">{(totals.totalCpuLimit - totals.totalCpuUsed).toFixed(2)} Cores</strong> across active containers.
          </p>
        </div>

        {/* Total Memory Allocation vs Usage */}
        <div className="space-y-4 p-5 bg-slate-900/40 rounded-xl border border-slate-700/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>Total Memory (RAM)</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400">{totals.overallMemUtilPercent}% Utilized</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Used: <strong>{totals.totalMemUsedMB} MB</strong></span>
              <span className="text-slate-400">Limit: {totals.totalMemLimitMB} MB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, totals.overallMemUtilPercent)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Over-allocated by <strong className="text-amber-300 font-mono">{(totals.totalMemLimitMB - totals.totalMemUsedMB).toFixed(0)} MB</strong> RAM.
          </p>
        </div>
      </div>
    </div>
  );
}
