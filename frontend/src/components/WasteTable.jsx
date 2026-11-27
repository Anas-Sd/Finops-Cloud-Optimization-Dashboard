import React from 'react';
import { AlertCircle, Zap, TrendingDown, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function WasteTable({ waste = [] }) {
  // Sort: 1. Overdue/Capacity Deficit first, 2. Actively using second, 3. Idle third
  const displayItems = [...waste].sort((a, b) => {
    const isDeficitA = a.status === 'Under-Provisioned' || a.severity === 'CRITICAL_DEFICIT' || (a.cpuUtilizationPercent || 0) >= 85;
    const isDeficitB = b.status === 'Under-Provisioned' || b.severity === 'CRITICAL_DEFICIT' || (b.cpuUtilizationPercent || 0) >= 85;

    if (isDeficitA && !isDeficitB) return -1;
    if (!isDeficitA && isDeficitB) return 1;

    const isOptimalA = a.status === 'Optimal' || a.severity === 'HEALTHY' || (a.cpuUtilizationPercent || 0) >= 20;
    const isOptimalB = b.status === 'Optimal' || b.severity === 'HEALTHY' || (b.cpuUtilizationPercent || 0) >= 20;

    if (isOptimalA && !isOptimalB) return -1;
    if (!isOptimalA && isOptimalB) return 1;

    if (isOptimalA && isOptimalB) {
      return (b.cpuUtilizationPercent || 0) - (a.cpuUtilizationPercent || 0);
    }

    return (b.estimatedMonthlySavings || 0) - (a.estimatedMonthlySavings || 0);
  });

  const underProvisionedCount = displayItems.filter(item => item.status === 'Under-Provisioned' || item.severity === 'CRITICAL_DEFICIT').length;
  const wastefulCount = displayItems.filter(item => item.status === 'Wasteful' || item.severity === 'HIGH' || item.severity === 'MEDIUM').length;
  const efficientCount = displayItems.length - wastefulCount - underProvisionedCount;

  return (
    <div className="bg-[#0f172a]/80 border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm space-y-0">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#090d16]/90">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">Financial Resource Waste &amp; Right-Sizing Matrix</h3>
            <p className="text-xs text-slate-400 font-mono">Comparing Allocated Limit Cost vs Actual Usage Cost vs Right-Sized Buy Target</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full font-mono font-bold border border-amber-500/30">
            {displayItems.length} Monitored Workloads ({wastefulCount} Idle &bull; {underProvisionedCount > 0 ? `${underProvisionedCount} Saturated Deficit • ` : ''}{efficientCount} Optimal)
          </span>

          <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live 2s Sync
          </span>
        </div>
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
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400 font-mono">
                  No workloads found.
                </td>
              </tr>
            ) : (
              displayItems.map((item) => {
                const isUnderProvisioned = item.status === 'Under-Provisioned' || item.severity === 'CRITICAL_DEFICIT';
                const isOptimal = item.status === 'Optimal' || item.severity === 'HEALTHY';
                const isSevere = item.cpuUtilizationPercent < 10;
                const actualCostEst = item.actuallyUsedCost !== undefined 
                  ? item.actuallyUsedCost 
                  : Math.round(item.currentMonthlyCost * (item.cpuUtilizationPercent / 100));

                return (
                  <tr
                    key={item.containerName}
                    className={`transition-colors ${
                      isUnderProvisioned
                        ? 'bg-rose-950/25 hover:bg-rose-900/35 border-l-4 border-l-rose-500'
                        : isOptimal
                        ? 'bg-emerald-950/10 hover:bg-emerald-900/20 border-l-4 border-l-emerald-500'
                        : isSevere
                        ? 'bg-amber-950/15 hover:bg-amber-900/25 border-l-4 border-l-amber-500'
                        : 'bg-amber-950/10 hover:bg-amber-900/20 border-l-4 border-l-amber-500'
                    }`}
                  >
                    {/* Workload Name & Team */}
                    <td className="py-4 px-6 font-bold text-white font-mono">
                      <div className="flex items-center gap-2">
                        {isUnderProvisioned ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                        ) : isOptimal ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Zap className={`w-4 h-4 shrink-0 ${isSevere ? 'text-amber-400' : 'text-amber-400'}`} />
                        )}
                        <span>{item.containerName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-sans">
                        <span className="text-[10px] text-slate-400 capitalize">
                          Team: {item.team}
                        </span>
                        {isUnderProvisioned ? (
                          <span className="text-[9px] bg-rose-500/25 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold font-mono">
                            ⚠️ Saturated Deficit ({Number(item.cpuUtilizationPercent).toFixed(2)}%)
                          </span>
                        ) : isOptimal ? (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold font-mono">
                            Optimal (&ge;20%)
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold font-mono">
                            Idle Waste (&lt;20%)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 1. Purchased Limit */}
                    <td className="py-4 px-4 font-bold text-sm">
                      <span className={isUnderProvisioned ? 'text-rose-400' : isOptimal ? 'text-slate-200' : 'text-amber-300'}>
                        ₹{item.currentMonthlyCost.toLocaleString('en-IN')}/mo
                      </span>
                    </td>

                    {/* 2. Actually Used */}
                    <td className="py-4 px-4 font-bold text-sm">
                      <span className={isUnderProvisioned ? 'text-rose-300' : 'text-sky-300'}>
                        ₹{actualCostEst.toLocaleString('en-IN')}/mo
                      </span>
                    </td>

                    {/* 3. Recommended Buy */}
                    <td className="py-4 px-4 font-bold text-sm">
                      <span className={isUnderProvisioned ? 'text-rose-400' : 'text-emerald-300'}>
                        ₹{item.rightSizedMonthlyCost.toLocaleString('en-IN')}/mo
                      </span>
                    </td>

                    {/* 4. Net Monthly Savings */}
                    <td className="py-4 px-6 text-right">
                      {isUnderProvisioned ? (
                        <div className="flex items-center justify-end gap-1.5 font-extrabold text-xs text-rose-400 font-mono">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Capacity Deficit</span>
                        </div>
                      ) : isOptimal ? (
                        <div className="flex items-center justify-end gap-1.5 font-bold text-xs text-emerald-400 font-mono">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Optimal (₹0 Waste)</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 font-extrabold text-sm text-emerald-400 font-mono">
                          <TrendingDown className="w-4 h-4" />
                          <span>Save ₹{item.estimatedMonthlySavings.toLocaleString('en-IN')}/mo</span>
                        </div>
                      )}
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
