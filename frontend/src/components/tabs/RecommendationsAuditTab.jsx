import React from 'react';
import Recommendations from '../Recommendations';
import { Lightbulb, FileText, Filter, Sparkles, RefreshCw } from 'lucide-react';

export default function RecommendationsAuditTab({
  recommendations,
  teamFilter,
  setTeamFilter,
  severityFilter,
  setSeverityFilter,
  onOpenReportModal,
  lastUpdated
}) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            FinOps Actionable Recommendations &amp; Audit Hub
          </h2>
          <p className="text-sm text-slate-400">Automated right-sizing recommendations and mentor audit report generator</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <div className="text-xs text-slate-300 flex items-center gap-2 font-mono bg-[#090d16] px-3 py-1.5 rounded-xl border border-[#1e293b] shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Last polled: <strong className="text-white">{lastUpdated.toLocaleTimeString()}</strong></span>
            </div>
          )}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all"
          >
            <FileText className="w-4 h-4" />
            Export Executive Audit Report
          </button>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Interactive Recommendation Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          {/* Team Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Team:</span>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Teams</option>
              <option value="payments">Payments</option>
              <option value="platform">Platform</option>
              <option value="growth">Growth</option>
              <option value="infra">Infra</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="HIGH">Severe Waste (&lt;10%)</option>
              <option value="MEDIUM">Moderate Waste (10-20%)</option>
            </select>
          </div>

          {(teamFilter !== 'All' || severityFilter !== 'All') && (
            <button
              onClick={() => { setTeamFilter('All'); setSeverityFilter('All'); }}
              className="text-blue-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Actionable Recommendations Cards List */}
      <Recommendations recommendations={recommendations} />
    </div>
  );
}
