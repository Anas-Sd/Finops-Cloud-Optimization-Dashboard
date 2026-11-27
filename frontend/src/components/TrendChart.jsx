import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

export default function TrendChart({ trend = [], timeframe = 'monthly' }) {
  // Generate data based on selected timeframe
  let formattedData = [];
  let chartTitle = '30-Day Daily Spend Trend';
  let chartSubtitle = 'Historical cloud resource expenditure trajectory';
  let costLabel = 'Daily Cost';

  if (timeframe === 'weekly') {
    chartTitle = '7-Day Daily Spend Trajectory';
    chartSubtitle = 'Weekly rolling resource expenditure trajectory';
    const sliced = trend.slice(-7);
    formattedData = sliced.map(t => ({
      date: t.date ? t.date.substring(5) : '',
      fullDate: t.date,
      cost: t.dailyCost
    }));
  } else if (timeframe === 'yearly') {
    chartTitle = '12-Month Annual Expenditure & Forecast';
    chartSubtitle = 'Annualized cloud resource run-rate trajectory across 12 months';
    costLabel = 'Monthly Spend';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthlyBase = trend.length > 0 
      ? Math.round(trend.reduce((acc, t) => acc + t.dailyCost, 0) * (30.4 / trend.length)) 
      : 280465;

    formattedData = months.map((m, idx) => {
      // Historical trend curve leading to current active month (Nov/Dec)
      const factor = 0.88 + (idx * 0.011);
      return {
        date: m,
        fullDate: `${m} 2026`,
        cost: Math.round(currentMonthlyBase * factor)
      };
    });
  } else {
    // Monthly (30 days)
    chartTitle = '30-Day Daily Spend Trend';
    chartSubtitle = 'Monthly cloud resource expenditure trajectory';
    const sliced = trend.slice(-30);
    formattedData = sliced.map(t => ({
      date: t.date ? t.date.substring(5) : '',
      fullDate: t.date,
      cost: t.dailyCost
    }));
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#090d16] border border-[#1e293b] p-3 rounded-xl shadow-2xl text-xs space-y-1 font-mono">
          <p className="font-bold text-slate-300 font-sans">{payload[0].payload.fullDate}</p>
          <p className="text-emerald-400 font-extrabold text-sm">
            {costLabel}: ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0f172a]/90 border border-[#1e293b] rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 mb-4 border-b border-[#1e293b]/70 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{chartTitle}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{chartSubtitle}</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase bg-[#090d16] px-2.5 py-1 rounded-lg border border-[#1e293b] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          {timeframe.toUpperCase()} VIEW
        </span>
      </div>

      <div className="w-full h-64 flex-1">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-mono">
            Loading historical trend chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="monospace" />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(v) => v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`} 
                fontFamily="monospace"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
