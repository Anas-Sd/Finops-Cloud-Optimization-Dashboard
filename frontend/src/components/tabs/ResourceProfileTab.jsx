import React from 'react';
import CpuMemCorrelationChart from '../CpuMemCorrelationChart';
import { Layers, Cpu, HardDrive, Zap, RefreshCw } from 'lucide-react';

export default function ResourceProfileTab({ analyticsData, lastUpdated }) {
  const containerList = analyticsData?.containerUtilizationList || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-400" />
            Resource Profile &amp; Correlation Matrix
          </h2>
          <p className="text-sm text-slate-400">Comparing CPU vs Memory utilization across container workloads</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <div className="text-xs text-slate-300 flex items-center gap-2 font-mono bg-[#090d16] px-3 py-1.5 rounded-xl border border-[#1e293b] shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Last polled: <strong className="text-white">{lastUpdated.toLocaleTimeString()}</strong></span>
            </div>
          )}
          <span className="text-xs bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live 2s Sync
          </span>
        </div>
      </div>

      {/* Main Bar Chart */}
      <CpuMemCorrelationChart containerList={containerList} />

      {/* Microservice Workload Profile Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Container Utilization Profile Index
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {containerList.map((c) => {
            const isDeficit = c.cpuPercent >= 85;
            const isIdle = c.cpuPercent < 20;

            return (
              <div
                key={c.containerName}
                className={`border rounded-xl p-5 shadow-xl backdrop-blur-sm space-y-3 transition-all ${
                  isDeficit 
                    ? 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500/60'
                    : isIdle 
                    ? 'border-amber-500/30 bg-[#0f172a]/90 hover:border-amber-500/50' 
                    : 'border-slate-700/60 bg-[#0f172a]/90 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">{c.containerName}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    isDeficit
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isIdle
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {isDeficit ? '⚠️ Capacity Deficit' : isIdle ? 'Idle / Wasteful' : 'Optimal / Efficient'}
                  </span>
                </div>

                <div className="space-y-2 pt-2 text-xs font-mono">
                  {/* CPU Progress */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-blue-400" /> CPU Util:</span>
                      <span className="font-bold">{c.cpuPercent}% ({c.cpuUsed} / {c.cpuLimit} Cores)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: `${Math.min(100, c.cpuPercent)}%` }}></div>
                    </div>
                  </div>

                  {/* RAM Progress */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-purple-400" /> RAM Util:</span>
                      <span className="font-bold">{c.memPercent}% ({c.memUsed} / {c.memLimit} MB)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className="h-1.5 bg-purple-400 rounded-full" style={{ width: `${Math.min(100, c.memPercent)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex justify-between text-xs text-slate-400 font-mono">
                  <span>Team: <strong className="text-slate-200 capitalize">{c.team}</strong></span>
                  <span>Cost: <strong className="text-slate-200">₹{c.monthlyCost}/mo</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
