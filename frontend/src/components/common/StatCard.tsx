import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlight?: boolean;
  unit?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
  unit,
}) => {
  return (
    <div className={`relative bg-scout-card p-5 border transition-all duration-200 hud-border ${
      highlight 
        ? 'border-scout-neon/50 shadow-neon-sm' 
        : 'border-scout-border hover:border-scout-borderLight'
    }`}>
      {/* Top telemetry header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs uppercase tracking-wider text-scout-muted font-medium">
          {title}
        </span>
        {icon && (
          <div className={`p-1.5 ${highlight ? 'text-scout-neon' : 'text-scout-dim'}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Main numerical metric */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold tracking-tight font-mono text-white">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-scout-neon font-semibold uppercase">
            {unit}
          </span>
        )}
      </div>

      {/* Subtitle & Trend */}
      <div className="mt-2.5 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-scout-muted truncate pr-2">
            {subtitle}
          </span>
        )}
        {trend && (
          <span className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] px-1.5 py-0.5 ${
            trend.isPositive ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
          }`}>
            {trend.isPositive ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
