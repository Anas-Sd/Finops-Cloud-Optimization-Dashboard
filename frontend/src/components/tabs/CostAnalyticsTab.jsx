import React, { useState } from 'react';
import EfficiencyGauge from '../EfficiencyGauge';
import SummaryCards from '../SummaryCards';
import TeamTargetComparisonChart from '../TeamTargetComparisonChart';
import CostByTeamChart from '../CostByTeamChart';
import TrendChart from '../TrendChart';
import { BarChart3, Calendar, RefreshCw } from 'lucide-react';

export default function CostAnalyticsTab({ summaryData, analyticsData, teamsData, trendData, lastUpdated }) {
  const [timeframe, setTimeframe] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner with Timeframe Filter & Polled Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a]/80 p-6 rounded-2xl border border-[#1e293b]">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            Executive Cost &amp; Spend Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-mono">Macro financial trajectory, efficiency scores, and departmental expenditure distribution</p>
        </div>

        {/* Timeframe Filter Buttons & Live Polled Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <div className="text-xs text-slate-300 flex items-center gap-2 font-mono bg-[#090d16] px-3 py-1.5 rounded-xl border border-[#1e293b] shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Last polled: <strong className="text-white">{lastUpdated.toLocaleTimeString()}</strong></span>
            </div>
          )}
          <div className="flex bg-[#090d16] p-1 rounded-xl border border-[#1e293b] font-mono text-xs shadow-inner">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                timeframe === 'weekly'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                timeframe === 'monthly'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('yearly')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                timeframe === 'yearly'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Yearly
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live 2s Sync
          </div>
        </div>
      </div>

      {/* 1. FinOps Cluster Efficiency Score Card (Gauge + Resource Totals Below) */}
      <EfficiencyGauge analytics={analyticsData} />

      {/* 2. Summary KPI Cards Below Score Card (Weekly / Monthly / Yearly scaled) */}
      <SummaryCards summary={summaryData} timeframe={timeframe} />

      {/* 3. Charts Grid: The Bar Graph & The Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamTargetComparisonChart teamComparison={analyticsData?.teamComparison || []} timeframe={timeframe} />
        <CostByTeamChart teams={teamsData} timeframe={timeframe} />
      </div>

      {/* 4. Historical / Projected Spend Trajectory */}
      <TrendChart trend={trendData} timeframe={timeframe} />
    </div>
  );
}
