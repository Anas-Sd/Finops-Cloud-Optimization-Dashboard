import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users } from 'lucide-react';

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function CostByTeamChart({ teams = [] }) {
  const formattedData = teams.map(t => ({
    name: t.team.toUpperCase(),
    value: t.monthlySpend,
    containerCount: t.containerCount
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#090d16] border border-[#1e293b] p-3 rounded-xl shadow-2xl text-xs space-y-1 font-mono">
          <p className="font-bold text-white font-sans">{data.name} Team</p>
          <p className="text-sky-400 font-semibold">Monthly Spend: ₹{data.value.toLocaleString('en-IN')}</p>
          <p className="text-slate-400">Containers: {data.containerCount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0f172a]/80 border border-[#1e293b] rounded-xl p-6 shadow-xl backdrop-blur-sm flex flex-col h-full justify-between">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Monthly Spend by Team</h3>
          <p className="text-xs text-slate-400">Cost distribution across organization teams</p>
        </div>
      </div>

      <div className="w-full h-72 my-auto">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-mono">
            Loading team cost distribution...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, bottom: 25, left: 10 }}>
              <Pie
                data={formattedData}
                cx="50%"
                cy="42%"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={6}
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: '15px' }}
                formatter={(value) => <span className="text-xs text-slate-300 font-medium px-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
