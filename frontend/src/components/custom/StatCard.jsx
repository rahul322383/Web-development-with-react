import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const StatCard = ({ title, value, change, icon: Icon, trend = 'up', loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
      data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              {value}
            </p>
            {change !== undefined && (
              <div className="flex items-center space-x-1">
                {trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-rose-500" />
                )}
                <span className={`text-xs font-medium ${
                  trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {change}%
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-indigo-50 p-3">
              <Icon className="h-6 w-6 text-indigo-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};