import React from 'react';
import { Lightbulb, CheckCircle2, ArrowRight, TrendingDown } from 'lucide-react';

export default function Recommendations({ recommendations = [] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">FinOps Right-Sizing Action Cards</h3>
            <p className="text-xs text-slate-400">Step-by-step recommendation: Purchased Cost &rarr; Actual Usage &rarr; Target Buy &rarr; Savings</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {recommendations.length} Actionable Recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-[#0f172a]/40 rounded-2xl border border-[#1e293b] text-slate-400 font-mono">
            No recommendations generated. Infrastructure operating at optimal capacity!
          </div>
        ) : (
          recommendations.map((rec) => {
            const currentCost = rec.currentMonthlyCost;
            const savings = rec.potentialMonthlySavings;
            const targetCost = currentCost - savings;

            return (
              <div
                key={rec.id}
                className="bg-[#0f172a]/80 border border-[#1e293b] hover:border-sky-500/40 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-white text-base leading-snug">{rec.title}</h4>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        rec.severity === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rec.severity} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.message}</p>
                </div>

                {/* 4-Step Financial & Resource Comparison Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#090d16]/80 rounded-xl border border-[#1e293b] font-mono text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-rose-400 font-sans block">1. Purchased</span>
                    <span className="font-bold text-white block">₹{currentCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-0.5 border-x border-[#1e293b] px-2">
                    <span className="text-[10px] text-emerald-400 font-sans block">2. Buy Instead</span>
                    <span className="font-bold text-emerald-300 block">₹{targetCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-0.5 pl-1 text-right">
                    <span className="text-[10px] text-emerald-400 font-sans block">3. Net Savings</span>
                    <span className="font-bold text-emerald-400 block">₹{savings.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Config Action:</span>
                    <code className="bg-[#090d16] text-sky-300 px-2 py-0.5 rounded text-[11px]">
                      {rec.action}
                    </code>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
