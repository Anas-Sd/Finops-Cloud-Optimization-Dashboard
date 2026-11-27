import React from 'react';
import { IndianRupee, TrendingDown, AlertTriangle, PiggyBank } from 'lucide-react';

export default function SummaryCards({ summary, timeframe = 'monthly' }) {
  const baseMonthlySpend = summary?.total30DaySpend || 280465;
  const totalWastefulContainers = summary?.totalWastefulContainers !== undefined ? summary.totalWastefulContainers : 12;
  const baseMonthlySavings = summary?.potentialMonthlySavings || 102748;
  const potentialSavingsPercentage = summary?.potentialSavingsPercentage || 36.6;
  const totalContainers = summary?.totalContainers || 19;
  const totalTeams = summary?.totalTeams || 5;

  // Timeframe multipliers (weekly = ~7/30.4 days, monthly = 1x, yearly = 12x)
  const multiplier = timeframe === 'weekly' ? (7 / 30.416) : timeframe === 'yearly' ? 12 : 1;
  const timeframePeriod = timeframe === 'weekly' ? '7 Days' : timeframe === 'yearly' ? '365 Days' : '30 Days';
  const timeframeLabel = timeframe === 'weekly' ? 'Weekly' : timeframe === 'yearly' ? 'Annual' : 'Monthly';

  const displaySpend = Math.round(baseMonthlySpend * multiplier);
  const displaySavings = Math.round(baseMonthlySavings * multiplier);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Total Spend */}
      <div className="bg-[#0f172a]/90 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm group hover:border-slate-600 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Total Cloud Spend ({timeframePeriod})</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-black text-white tracking-tight font-mono">
            ₹{displaySpend.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-slate-300 font-medium">{totalContainers} Docker Containers</span> across {totalTeams} engineering teams
          </p>
        </div>
      </div>

      {/* Card 2: Wasteful Workloads Detected */}
      <div className="bg-[#0f172a]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm group hover:border-amber-500/50 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-300">Underutilized Workloads</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Live
            </span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-black text-amber-400 tracking-tight font-mono">
            {totalWastefulContainers} Containers
          </div>
          <p className="mt-1 text-xs text-amber-300/80 flex items-center gap-1">
            Operating at <strong className="text-amber-200 font-mono">&lt; 20% utilization</strong> against limits
          </p>
        </div>
      </div>

      {/* Card 3: Potential Savings */}
      <div className="bg-[#0f172a]/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm group hover:border-emerald-500/50 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-300">Potential {timeframeLabel} Savings</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-black text-emerald-400 tracking-tight flex items-baseline gap-2 font-mono">
            ₹{displaySavings.toLocaleString('en-IN')}
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {potentialSavingsPercentage}% Cut
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-300/80 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Achievable via right-sizing declared CPU &amp; Memory limits
          </p>
        </div>
      </div>
    </div>
  );
}
