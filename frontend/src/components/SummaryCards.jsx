import React from 'react';
import { IndianRupee, TrendingDown, AlertTriangle, PiggyBank } from 'lucide-react';

export default function SummaryCards({ summary }) {
  const total30DaySpend = summary?.total30DaySpend || 0;
  const totalWastefulContainers = summary?.totalWastefulContainers || 0;
  const potentialMonthlySavings = summary?.potentialMonthlySavings || 0;
  const potentialSavingsPercentage = summary?.potentialSavingsPercentage || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Total 30-Day Spend */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm group hover:border-slate-600 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Total Cloud Spend (30 Days)</span>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            ₹{total30DaySpend.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-slate-300 font-medium">12 Docker Containers</span> across 4 engineering teams
          </p>
        </div>
      </div>

      {/* Card 2: Wasteful Workloads Detected */}
      <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm group hover:border-amber-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-300">Underutilized Workloads</span>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-amber-400 tracking-tight">
            {totalWastefulContainers} Containers
          </div>
          <p className="mt-1 text-xs text-amber-300/80 flex items-center gap-1">
            Operating at <strong className="text-amber-200">&lt; 20% utilization</strong> against allocated limits
          </p>
        </div>
      </div>

      {/* Card 3: Potential Monthly Savings */}
      <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm group hover:border-emerald-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-300">Potential Monthly Savings</span>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight flex items-baseline gap-2">
            ₹{potentialMonthlySavings.toLocaleString('en-IN')}
            <span className="text-sm font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
              {potentialSavingsPercentage}% Reduction
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
