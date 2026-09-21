import React from 'react';
import TeamTargetComparisonChart from '../TeamTargetComparisonChart';
import { Users, Target, Cpu, HardDrive, Server, ArrowDownRight } from 'lucide-react';

export default function TeamCostAttributionTab({ analyticsData, teamsData }) {
  const teamList = analyticsData?.teamComparison || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Team Cost Attribution &amp; Provided Resource Allocation
          </h2>
          <p className="text-sm text-slate-400">Exact CPU Cores &amp; RAM Provided vs Used per Engineering Team</p>
        </div>
      </div>

      {/* Main Chart */}
      <TeamTargetComparisonChart teamComparison={teamList} />

      {/* Individual Team Cards Breakdown */}
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

            return (
              <div
                key={t.team}
                className="bg-[#0f172a]/80 border border-[#1e293b] rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Team Title & Workload Count */}
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-white text-lg capitalize block">{t.team} Team</span>
                        <span className="text-xs text-slate-400 font-mono">Assigned Workloads: {count} Microservices</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      ↓ {savingsPct}% Potential Savings
                    </span>
                  </div>

                  {/* Provided Resources Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    {/* CPU Provided vs Used */}
                    <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-[#1e293b] space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5 font-sans font-semibold">
                          <Cpu className="w-3.5 h-3.5 text-blue-400" /> Provided CPU:
                        </span>
                        <span className="text-blue-400 font-bold">{t.providedCpuCores || '1.50'} Cores</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Used: <strong className="text-slate-200">{t.usedCpuCores || '0.35'} Cores</strong></span>
                        <span className="text-amber-300">({t.cpuUtilPercent || 23}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: `${Math.min(100, t.cpuUtilPercent || 23)}%` }}></div>
                      </div>
                    </div>

                    {/* RAM Provided vs Used */}
                    <div className="bg-[#090d16]/80 p-3.5 rounded-xl border border-[#1e293b] space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5 font-sans font-semibold">
                          <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Provided RAM:
                        </span>
                        <span className="text-purple-400 font-bold">{t.providedMemMB || '768'} MB</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Used: <strong className="text-slate-200">{t.usedMemMB || '210'} MB</strong></span>
                        <span className="text-purple-300">({t.memUtilPercent || 27}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 bg-purple-400 rounded-full" style={{ width: `${Math.min(100, t.memUtilPercent || 27)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Microservices Assigned List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 uppercase font-mono block">Provided Microservices:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {containersList.map(c => (
                        <span key={c} className="bg-[#090d16] text-slate-200 text-[11px] font-mono px-2.5 py-1 rounded-md border border-[#1e293b] flex items-center gap-1">
                          <Server className="w-3 h-3 text-sky-400" /> {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Financial Totals */}
                <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Current Monthly Spend</span>
                    <span className="text-rose-400 font-bold text-sm">₹{t.currentSpend.toLocaleString('en-IN')}/mo</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Target Right-Sized Spend</span>
                    <span className="text-emerald-400 font-bold text-sm">₹{t.targetSpend.toLocaleString('en-IN')}/mo</span>
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
