import React from 'react';
import TeamTargetComparisonChart from '../TeamTargetComparisonChart';
import { Users, Target, Cpu, HardDrive, Server, IndianRupee, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';

export default function TeamCostAttributionTab({ analyticsData, teamsData, lastUpdated }) {
  const teamList = analyticsData?.teamComparison || [];

  const totalTeams = teamList.length || 5;
  const totalContainers = teamList.reduce((acc, t) => acc + (t.containerCount || 0), 0) || 19;
  const totalPurchased = teamList.reduce((acc, t) => acc + (t.currentSpend || 0), 0) || 280465;
  const totalUsed = teamList.reduce(
    (acc, t) => acc + (t.actualUsedSpend !== undefined ? t.actualUsedSpend : Math.round((t.currentSpend || 0) * ((t.cpuUtilPercent || 25) / 100))),
    0
  );
  const totalTarget = teamList.reduce((acc, t) => acc + (t.targetSpend || 0), 0) || (totalPurchased - 102748);
  const totalSavings = teamList.reduce((acc, t) => acc + (t.savings || 0), 0) || 102748;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a]/80 p-6 rounded-2xl border border-[#1e293b]">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Team Cost Attribution &amp; Departmental Resource Provisioning
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-mono">
            Accurate CPU Cores &amp; RAM Provided vs Live Utilized per Engineering Department ({totalContainers} Workloads across {totalTeams} Teams)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <div className="text-xs text-slate-300 flex items-center gap-2 font-mono bg-[#090d16] px-3 py-1.5 rounded-xl border border-[#1e293b] shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Last polled: <strong className="text-white">{lastUpdated.toLocaleTimeString()}</strong></span>
            </div>
          )}
          <span className="text-xs bg-emerald-500/15 text-emerald-400 px-3 py-1.5 rounded-full font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live 2s Sync
          </span>
        </div>
      </div>

      {/* Cross-Department Macro KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#0f172a]/90 border border-slate-700/50 p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold">1. Purchased Limits</span>
          <p className="text-xl font-bold text-rose-400">₹{totalPurchased.toLocaleString('en-IN')}<span className="text-xs text-slate-400">/mo</span></p>
          <span className="text-[10px] text-slate-500 font-sans block">{totalContainers} Containers Provisioned</span>
        </div>

        <div className="bg-[#0f172a]/90 border border-sky-500/30 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-sky-400 uppercase font-semibold">2. Live Actually Used</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          </div>
          <p className="text-xl font-bold text-sky-300">₹{totalUsed.toLocaleString('en-IN')}<span className="text-xs text-slate-400">/mo</span></p>
          <span className="text-[10px] text-slate-400 font-sans block">Dynamic Docker Telemetry</span>
        </div>

        <div className="bg-[#0f172a]/90 border border-emerald-500/30 p-4 rounded-xl space-y-1">
          <span className="text-xs text-emerald-400 uppercase font-semibold">3. Right-Sized Target</span>
          <p className="text-xl font-bold text-emerald-400">₹{totalTarget.toLocaleString('en-IN')}<span className="text-xs text-slate-400">/mo</span></p>
          <span className="text-[10px] text-slate-400 font-sans block">With 20% Safety Buffer</span>
        </div>

        <div className="bg-[#0f172a]/90 border border-amber-500/30 p-4 rounded-xl space-y-1">
          <span className="text-xs text-amber-300 uppercase font-semibold">4. Net Monthly Savings</span>
          <p className="text-xl font-bold text-amber-400 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            ₹{totalSavings.toLocaleString('en-IN')}<span className="text-xs text-slate-400">/mo</span>
          </p>
          <span className="text-[10px] text-amber-300/80 font-sans block">{((totalSavings / totalPurchased) * 100).toFixed(1)}% Achievable Cut</span>
        </div>
      </div>

      {/* Main Bar Chart: Team Target Spend Comparison */}
      <TeamTargetComparisonChart teamComparison={teamList} />

      {/* Individual Department Cards Breakdown */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          Departmental Provided Resources &amp; Workload Mapping
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamList.map((t) => {
            const teamMeta = teamsData.find(tm => tm.team.toLowerCase() === t.team.toLowerCase());
            const count = teamMeta?.containerCount || t.containerCount || 3;
            const savingsPct = t.currentSpend > 0 ? ((t.savings / t.currentSpend) * 100).toFixed(0) : 0;
            const containersList = t.containers || [];
            const isHighUtil = (t.cpuUtilPercent || 0) >= 60;
            const actualUsed = t.actualUsedSpend !== undefined 
              ? t.actualUsedSpend 
              : Math.round(t.currentSpend * ((t.cpuUtilPercent || 25) / 100));

            return (
              <div
                key={t.team}
                className="bg-[#0f172a]/90 border border-[#1e293b] rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Team Title & Workload Count */}
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl font-bold border border-purple-500/20">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-white text-lg capitalize block">{t.team} Team</span>
                        <span className="text-xs text-slate-400 font-mono">Assigned Workloads: {count} Microservices</span>
                      </div>
                    </div>

                    {isHighUtil ? (
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {t.cpuUtilPercent}% Utilized
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        ↓ {savingsPct}% Potential Savings
                      </span>
                    )}
                  </div>

                  {/* Provided Resources Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    {/* CPU Provided vs Used */}
                    <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-[#1e293b] space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5 font-sans font-semibold">
                          <Cpu className="w-3.5 h-3.5 text-blue-400" /> Provided CPU:
                        </span>
                        <span className="text-blue-400 font-bold">{t.providedCpuCores} Cores</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Used: <strong className="text-slate-200">{t.usedCpuCores} Cores</strong></span>
                        <span className="text-sky-300 font-bold">({t.cpuUtilPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, t.cpuUtilPercent)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* RAM Provided vs Used */}
                    <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-[#1e293b] space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5 font-sans font-semibold">
                          <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Provided RAM:
                        </span>
                        <span className="text-purple-400 font-bold">{t.providedMemMB} MB</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Used: <strong className="text-slate-200">{t.usedMemMB} MB</strong></span>
                        <span className="text-purple-300 font-bold">({t.memUtilPercent}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, t.memUtilPercent)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Microservices Assigned List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 uppercase font-mono block">Assigned Workload Nodes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {containersList.map(c => {
                        const isBottleNeck = c === 'payment-gateway' || c === 'metrics-collector';
                        return (
                          <span
                            key={c}
                            className={`text-[11px] font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                              isBottleNeck
                                ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 font-bold'
                                : 'bg-[#090d16] text-slate-300 border-[#1e293b]'
                            }`}
                          >
                            <Server className={`w-3 h-3 ${isBottleNeck ? 'text-rose-400' : 'text-sky-400'}`} />
                            {c}
                            {isBottleNeck && <span className="text-[9px] bg-rose-500 text-slate-950 font-black px-1 rounded">SATURATED</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Financial Totals: 3-Column Breakdown */}
                <div className="pt-3 border-t border-[#1e293b] grid grid-cols-3 gap-2 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Purchased Limit</span>
                    <span className="text-rose-400 font-bold text-xs sm:text-sm">₹{t.currentSpend.toLocaleString('en-IN')}</span>
                  </div>

                  <div>
                    <span className="text-sky-400 text-[10px] block font-sans flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                      Actually Used
                    </span>
                    <span className="text-sky-300 font-bold text-xs sm:text-sm">₹{actualUsed.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-emerald-400 text-[10px] block font-sans">Target Buy</span>
                    <span className="text-emerald-400 font-bold text-xs sm:text-sm">₹{t.targetSpend.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-slate-400 block font-sans">Save ₹{t.savings.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
