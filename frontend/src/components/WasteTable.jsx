import React from 'react';
import { AlertCircle, ArrowRight, Zap, TrendingDown } from 'lucide-react';

export default function WasteTable({ waste = [] }) {
  return (
    <div className="bg-[#0f172a]/80 border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm space-y-0">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1e293b] flex items-center justify-between bg-[#090d16]/90">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">Financial Resource Waste &amp; Right-Sizing Matrix</h3>
            <p className="text-xs text-slate-400 font-mono">Comparing Allocated Limit Cost vs Actual Usage Cost vs Right-Sized Buy Target</p>
          </div>
        </div>
        <span className="text-xs bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full font-mono font-bold border border-amber-500/30">
          {waste.length} Wasteful Workloads Detected
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e293b] bg-[#090d16]/60 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Workload &amp; Team</th>
              <th className="py-4 px-4 text-rose-400">1. Purchased (Limit)</th>
              <th className="py-4 px-4 text-sky-400">2. Actually Used</th>
              <th className="py-4 px-4 text-emerald-400">3. Recommended Buy</th>
              <th className="py-4 px-6 text-right text-emerald-400">4. Net Monthly Savings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/60 text-xs font-mono">
            {waste.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400 font-mono">
                  No resource waste detected. Infrastructure operating at optimal capacity!
                </td>
              </tr>
            ) : (
              waste.map((item) => {
                const isSevere = item.cpuUtilizationPercent < 10;
                const actualCostEst = Math.round(item.currentMonthlyCost * (item.cpuUtilizationPercent / 100));

                return (
                  <tr
                    key={item.containerName}
                    className={`transition-colors ${
                      isSevere
                        ? 'bg-rose-950/15 hover:bg-rose-900/25 border-l-4 border-l-rose-500'
                        : 'bg-amber-950/10 hover:bg-amber-900/20 border-l-4 border-l-amber-500'
                    }`}
                  >
                    {/* Workload Name & Team */}
                    <td className="py-4 px-6 font-bold text-white font-mono">
                      <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${isSevere ? 'text-rose-400' : 'text-amber-400'}`} />
                        <span>{item.containerName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize font-sans block mt-0.5">
                        Team: {item.team}
                      </span>
                    </td>

                    {/* 1. Purchased Limit */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-rose-300">₹{item.currentMonthlyCost.toLocaleString('en-IN')}/mo</span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.currentCpuLimit} Cores &bull; {item.currentMemLimitMB} MB
                        </span>
                      </div>
                    </td>

                    {/* 2. Actually Used */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sky-300">₹{actualCostEst.toLocaleString('en-IN')}/mo</span>
                        <span className="text-[10px] text-amber-300 block font-sans font-bold">
                          {item.cpuUtilizationPercent}% Utilized ({item.avgCpuUsed} Cores)
                        </span>
                      </div>
                    </td>

                    {/* 3. Recommended Buy */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-emerald-300">₹{item.rightSizedMonthlyCost.toLocaleString('en-IN')}/mo</span>
                        <span className="text-[10px] text-emerald-400 block">
                          Buy: {item.recommendedCpuLimit} Cores &bull; {item.recommendedMemLimitMB} MB
                        </span>
                      </div>
                    </td>

                    {/* 4. Net Monthly Savings */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 font-extrabold text-sm text-emerald-400">
                        <TrendingDown className="w-4 h-4" />
                        <span>Save ₹{item.estimatedMonthlySavings.toLocaleString('en-IN')}/mo</span>
                      </div>
                      <span className="text-[10px] text-emerald-300/80 font-sans block">
                        Right-sizing 20% safety buffer
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
