import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

export default function SeverityPieChart({ distribution = [] }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#090d16] border border-[#1e293b] p-3 rounded-xl shadow-2xl text-xs space-y-1 font-mono">
          <p className="font-bold text-white font-sans">{data.name}</p>
          <p className="font-extrabold text-sm" style={{ color: data.color }}>
            {data.value} Container{data.value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0f172a]/80 border border-[#1e293b] rounded-xl p-6 shadow-xl backdrop-blur-sm flex flex-col h-full justify-between">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
          <PieIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Waste Severity Breakdown</h3>
          <p className="text-xs text-slate-400">Distribution of workloads by utilization tier</p>
        </div>
      </div>

      <div className="w-full h-72 my-auto">
        {distribution.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-mono">
            Loading severity distribution...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, bottom: 25, left: 10 }}>
              <Pie
                data={distribution}
                cx="50%"
                cy="42%"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={6}
                dataKey="value"
              >
                {distribution.map((entry, index) => (
                  <Cell key={`severity-cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
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
