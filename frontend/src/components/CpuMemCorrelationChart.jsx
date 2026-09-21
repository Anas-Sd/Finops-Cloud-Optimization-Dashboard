import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Layers } from 'lucide-react';

export default function CpuMemCorrelationChart({ containerList = [] }) {
  const formattedData = containerList.map(c => ({
    name: c.containerName.replace(/-service|-gateway|-worker|-engine|-api|-collector|-aggregator/, ''),
    fullName: c.containerName,
    CPU: c.cpuPercent,
    Memory: c.memPercent,
    team: c.team
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono">
          <p className="font-bold text-white font-sans">{data.fullName} ({data.team})</p>
          <p className="text-blue-400">CPU Utilization: {data.CPU}%</p>
          <p className="text-purple-400">Memory Utilization: {data.Memory}%</p>
          {(data.CPU < 20 || data.Memory < 20) && (
            <p className="text-amber-400 font-sans font-semibold pt-1 border-t border-slate-800">
              ⚠️ Flagged below 20% waste threshold
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-xl backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">CPU vs Memory Utilization Profile</h3>
          <p className="text-xs text-slate-400">Resource usage correlation per container against 20% waste threshold line</p>
        </div>
      </div>

      <div className="w-full h-72 flex-1">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Loading resource correlation chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-30} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value} %</span>} />
              <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '20% Waste Limit', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
              <Bar dataKey="CPU" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="Memory" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
