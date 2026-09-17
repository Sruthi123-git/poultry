import React from 'react';
import { Droplets, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { calculateWaterTankStatus } from '../../utils/calculations';

interface WaterTankVisualProps {
  shedName: string;
  currentLevelLiters: number;
  tankCapacityLiters: number;
  waterUsedTodayLiters: number;
  avgDailyWaterLiters?: number;
  onQuickRefill?: () => void;
}

export const WaterTankVisual: React.FC<WaterTankVisualProps> = ({
  shedName,
  currentLevelLiters,
  tankCapacityLiters,
  waterUsedTodayLiters,
  avgDailyWaterLiters = 800,
  onQuickRefill,
}) => {
  const { percentage, status, label, action, hoursRemaining } = calculateWaterTankStatus(
    currentLevelLiters,
    tankCapacityLiters,
    avgDailyWaterLiters
  );

  const isCritical = status === 'critical';
  const isWarning = status === 'warning';

  const statusColors = {
    sufficient: {
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      liquid: 'from-sky-400 via-blue-500 to-blue-600',
      liquidTop: 'bg-sky-300',
      border: 'border-slate-300 dark:border-slate-700',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    warning: {
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      liquid: 'from-amber-400 via-amber-500 to-amber-600',
      liquidTop: 'bg-amber-300',
      border: 'border-amber-400 dark:border-amber-700',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    critical: {
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse',
      liquid: 'from-rose-400 via-rose-500 to-rose-600',
      liquidTop: 'bg-rose-300',
      border: 'border-rose-500 dark:border-rose-700 shadow-glow-rose',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    },
  };

  const currentTheme = statusColors[status];

  return (
    <div
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
        isCritical
          ? 'border-rose-400 dark:border-rose-800/80 shadow-md shadow-rose-500/10'
          : 'border-slate-200 dark:border-slate-800 shadow-card'
      }`}
    >
      {/* Tank Title & Status Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {shedName} Water Tank
          </h3>
        </div>
        <span
          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentTheme.badge}`}
        >
          {currentTheme.icon}
          <span>{label}</span>
        </span>
      </div>

      {/* Main Tank Body Visual */}
      <div className="mt-4 flex items-center gap-5">
        {/* Cylindrical Industrial Water Tank */}
        <div className="relative w-24 h-40 rounded-2xl border-4 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex flex-col justify-end shadow-inner shrink-0">
          {/* Tank Level Markings */}
          <div className="absolute inset-y-0 left-1 w-2 flex flex-col justify-between py-2 text-[8px] font-mono text-slate-400 pointer-events-none z-10">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {/* Animated Liquid Level */}
          <div
            className={`w-full bg-gradient-to-t ${currentTheme.liquid} transition-all duration-700 relative`}
            style={{ height: `${percentage}%` }}
          >
            {/* Wave top effect */}
            <div className={`absolute -top-2 left-0 right-0 h-3 ${currentTheme.liquidTop} opacity-60 rounded-full blur-[1px]`} />
          </div>

          {/* Centered Percentage Tag */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="font-extrabold text-xl font-display text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Tank Metrics & Advisory */}
        <div className="flex-1 space-y-2.5">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
              Current Volume
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {currentLevelLiters.toLocaleString()} L{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                / {tankCapacityLiters.toLocaleString()} L
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Used Today
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {waterUsedTodayLiters.toLocaleString()} L
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Remaining
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                ~{hoursRemaining} hrs
              </span>
            </div>
          </div>

          {/* Action Callout */}
          <div
            className={`p-2 rounded-xl text-xs font-medium flex items-start gap-1.5 ${
              isCritical
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900'
                : isWarning
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
            }`}
          >
            <span className="shrink-0 mt-0.5">{isCritical ? '🔴' : isWarning ? '🟡' : '🟢'}</span>
            <span className="leading-snug">{action}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
