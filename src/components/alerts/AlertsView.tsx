import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Check,
  Filter,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { FarmAlert } from '../../types';

export const AlertsView: React.FC = () => {
  const { alerts, unacknowledgedAlertsCount, acknowledgeAlert } = useFarm();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all'>('active');

  const filteredAlerts = alerts.filter(a => {
    if (filterStatus === 'active' && a.acknowledged) return false;
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-500" />
            <span>Smart Actionable Alert Center</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Structure: Problem + Shed + Current Value + Recommended Action
          </p>
        </div>

        {/* Severity & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Active ({unacknowledgedAlertsCount})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
          </div>

          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as any)}
            className="bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical Only</option>
            <option value="warning">🟡 Warnings Only</option>
            <option value="info">🔵 Information Only</option>
          </select>
        </div>
      </div>

      {/* ALERT CARDS LIST */}
      {filteredAlerts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-3xl mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Active Farm Alerts
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            All biosecurity, feed inventory, weight progression, water tanks, and shed temperatures are currently operating within configured safe limits.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-5 sm:p-6 rounded-3xl border shadow-card transition-all ${
                  alert.acknowledged
                    ? 'opacity-60 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : isCritical
                    ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 shadow-rose-500/5'
                    : isWarning
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 shadow-amber-500/5'
                    : 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-300 dark:border-sky-900'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Icon & Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-2xl shrink-0 ${
                        isCritical
                          ? 'bg-rose-600 text-white'
                          : isWarning
                          ? 'bg-amber-600 text-white'
                          : 'bg-sky-600 text-white'
                      }`}
                    >
                      {isCritical ? (
                        <AlertOctagon className="w-6 h-6 animate-pulse" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <Info className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-rose-600 text-white'
                              : isWarning
                              ? 'bg-amber-600 text-white'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {alert.shedName}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {alert.date}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {alert.title}
                      </h3>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        <strong>Problem:</strong> {alert.problem}
                      </p>

                      {/* Problem details grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">
                            Current Value
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {alert.currentValue}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">
                            Configured Threshold
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {alert.thresholdValue}
                          </span>
                        </div>
                      </div>

                      {/* Recommended Action Callout */}
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs font-medium flex items-start gap-2 mt-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-emerald-800 dark:text-emerald-300 uppercase text-[10px]">
                            Recommended Farmer Action:
                          </strong>
                          <span>{alert.recommendedAction}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Acknowledge Button */}
                  <div className="self-end md:self-start shrink-0">
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Acknowledged</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
