import React from 'react';
import EfficiencyGauge from '../EfficiencyGauge';
import SummaryCards from '../SummaryCards';
import CostByTeamChart from '../CostByTeamChart';
import TrendChart from '../TrendChart';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';

export default function CostAnalyticsTab({ summaryData, analyticsData, teamsData, trendData }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Executive Cost &amp; Spend Analytics
          </h2>
          <p className="text-sm text-slate-400">Macro financial trajectory, efficiency scores, and monthly spend distribution</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Live Financial Telemetry
        </div>
      </div>

      {/* Cluster Efficiency Score Gauge */}
      <EfficiencyGauge analytics={analyticsData} />

      {/* Summary KPI Cards */}
      <SummaryCards summary={summaryData} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart trend={trendData} />
        <CostByTeamChart teams={teamsData} />
      </div>
    </div>
  );
}
