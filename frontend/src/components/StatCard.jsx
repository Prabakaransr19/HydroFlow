import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, unit = '', icon: Icon, trend, trendValue, subtitle, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-sky-50 text-sky-600 border-sky-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${selectedColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
          {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
        </div>

        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}

        {trend && (
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium">
            {trend === 'up' ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                <TrendingUp className="w-3 h-3" /> +{trendValue}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[11px]">
                <TrendingDown className="w-3 h-3" /> -{trendValue}
              </span>
            )}
            <span className="text-slate-400 text-[11px]">vs previous cycle</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
