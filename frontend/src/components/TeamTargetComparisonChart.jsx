import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';

export default function TeamTargetComparisonChart({ teamComparison = [] }) {
  const formattedData = teamComparison.map(t => ({
    team: t.team.toUpperCase(),
    Current: t.currentSpend,
    Target: t.targetSpend,
    Savings: t.savings
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono">
          <p className="font-bold text-white font-sans">{data.team} Team</p>
          <p className="text-rose-400">Current Monthly Spend: ₹{data.Current.toLocaleString('en-IN')}</p>
          <p className="text-emerald-400">Right-Sized Target Spend: ₹{data.Target.toLocaleString('en-IN')}</p>
          <p className="text-amber-300 font-extrabold">Net Monthly Savings: ₹{data.Savings.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-xl backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Current vs Optimised Spend by Team</h3>
          <p className="text-xs text-slate-400">Comparing current monthly cost against right-sized target budget</p>
        </div>
      </div>

      <div className="w-full h-64 flex-1">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Loading team benchmark data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="team" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value} Spend</span>} />
              <Bar dataKey="Current" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="Target" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
