import React from 'react';
import SeverityPieChart from '../SeverityPieChart';
import WasteTable from '../WasteTable';
import { AlertOctagon, TrendingDown, ShieldAlert } from 'lucide-react';

export default function WasteRightSizingTab({ analyticsData, wasteData, summaryData }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-amber-400" />
            Cloud Waste &amp; Right-Sizing Hub
          </h2>
          <p className="text-sm text-slate-400">Identification of underutilized workloads (&lt;20% usage) and safety-buffered right-sizing</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Identified Monthly Savings</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">
              ₹{(summaryData?.potentialMonthlySavings || 0).toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Grid with Severity Breakdown & Waste Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SeverityPieChart distribution={analyticsData?.severityDistribution} />

        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Right-Sizing Safety Buffer Methodology
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our FinOps algorithm analyzes the 24-hour peak CPU and Memory usage per container and applies a <strong>20% safety buffer</strong> above peak demand. This ensures zero application performance degradation while eliminating over-provisioned idle cloud capacity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/60">
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/40 font-mono text-xs">
              <span className="text-slate-400 block">Formula (CPU Target Limit):</span>
              <span className="text-emerald-400 font-bold">Max(0.1 Cores, Peak_CPU_Used * 1.2)</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/40 font-mono text-xs">
              <span className="text-slate-400 block">Formula (Memory Target Limit):</span>
              <span className="text-purple-400 font-bold">Max(32 MB, Peak_RAM_Used * 1.2)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Wasteful Workloads Table */}
      <WasteTable waste={wasteData} />
    </div>
  );
}
