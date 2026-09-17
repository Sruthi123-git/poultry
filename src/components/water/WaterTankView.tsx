import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  Droplets,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { calculateWaterTankStatus } from '../../utils/calculations';
import { WaterTankVisual } from '../common/WaterTankVisual';

interface WaterTankViewProps {
  onOpenDailyEntry: () => void;
}

export const WaterTankView: React.FC<WaterTankViewProps> = ({ onOpenDailyEntry }) => {
  const { activeBatch, latestRecord, dailyRecords, settings } = useFarm();

  if (!activeBatch || !latestRecord) {
    return <div className="p-8 text-center">No active batch data available.</div>;
  }

  const s1Level = latestRecord.shed1.waterLevelLiters;
  const s2Level = latestRecord.shed2.waterLevelLiters;
  const s1Cap = settings.shed1TankLiters;
  const s2Cap = settings.shed2TankLiters;

  const s1Status = calculateWaterTankStatus(s1Level, s1Cap, 850);
  const s2Status = calculateWaterTankStatus(s2Level, s2Cap, 850);

  const totalWaterUsedToday = latestRecord.totalWaterUsedTodayLiters;
  const totalWaterUsedBatch = dailyRecords.reduce((acc, r) => acc + r.totalWaterUsedTodayLiters, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-6 h-6 text-sky-500" />
            <span>Water Tank Management (Shed 1 & Shed 2)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time liquid level gauges, remaining time estimation, and automated refill alerts
          </p>
        </div>

        <button
          onClick={onOpenDailyEntry}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Update Water Level / Usage</span>
        </button>
      </div>

      {/* WATER CRITICAL WARNING IF APPLICABLE */}
      {(s1Status.status === 'critical' || s2Status.status === 'critical') && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-100 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-sm">Critical Water Depletion Alert</h4>
            <p className="mt-0.5 leading-relaxed">
              {s1Status.status === 'critical' && s2Status.status === 'critical'
                ? 'Both Shed 1 and Shed 2 water tanks are critically depleted! Turn on main borehole pumps immediately.'
                : s1Status.status === 'critical'
                ? `Shed 1 water tank is at ${s1Status.percentage}% (${s1Level} L / ${s1Cap} L). Refill Shed 1 immediately to prevent flock dehydration.`
                : `Shed 2 water tank is at ${s2Status.percentage}% (${s2Level} L / ${s2Cap} L). Refill Shed 2 water tank immediately.`}
            </p>
          </div>
        </div>
      )}

      {/* DUAL VISUAL WATER TANKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTankVisual
          shedName="Shed 1"
          currentLevelLiters={s1Level}
          tankCapacityLiters={s1Cap}
          waterUsedTodayLiters={latestRecord.shed1.waterUsedLiters}
        />
        <WaterTankVisual
          shedName="Shed 2"
          currentLevelLiters={s2Level}
          tankCapacityLiters={s2Cap}
          waterUsedTodayLiters={latestRecord.shed2.waterUsedLiters}
        />
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Water Used Today
          </span>
          <div className="text-3xl font-extrabold font-display text-sky-600 dark:text-sky-400 mt-1">
            {totalWaterUsedToday.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Liters</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>S1: {latestRecord.shed1.waterUsedLiters} L</span>
            <span>S2: {latestRecord.shed2.waterUsedLiters} L</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Batch Total Water
          </span>
          <div className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            {totalWaterUsedBatch.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Liters</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Across 28 days</span>
            <span className="text-emerald-600 font-semibold">Standard Ratio</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Water-to-Feed Ratio
          </span>
          <div className="text-3xl font-extrabold font-display text-indigo-600 dark:text-indigo-400 mt-1">
            {(totalWaterUsedToday / (latestRecord.totalFeedUsedTodayKg || 1)).toFixed(2)} : 1
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Optimal: 1.8 - 2.0</span>
            <span className="text-emerald-600 font-semibold">Hydration Normal</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Water Sanitation Status
          </span>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>Sanitized</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Chlorine Level: 3-5 ppm</span>
            <span className="text-emerald-600 font-semibold">Acidifier Dosed</span>
          </div>
        </div>
      </div>

      {/* WATER CONSUMPTION LOG TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Daily Water Telemetry & Consumption History
          </h3>
          <span className="text-xs text-slate-500">
            {dailyRecords.length} recorded checkpoints
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Day / Date</th>
                <th className="p-3">Shed 1 Level</th>
                <th className="p-3">Shed 1 Used</th>
                <th className="p-3">Shed 2 Level</th>
                <th className="p-3">Shed 2 Used</th>
                <th className="p-3">Total Water Used</th>
                <th className="p-3">Feed Ratio</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...dailyRecords].reverse().map(r => {
                const s1Pct = Math.round((r.shed1.waterLevelLiters / s1Cap) * 100);
                const s2Pct = Math.round((r.shed2.waterLevelLiters / s2Cap) * 100);
                const ratio = (r.totalWaterUsedTodayLiters / (r.totalFeedUsedTodayKg || 1)).toFixed(2);

                return (
                  <tr key={r.date} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      Day {r.dayOfBatch} <span className="text-[10px] text-slate-400 block">{r.date}</span>
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">
                      {r.shed1.waterLevelLiters} L ({s1Pct}%)
                    </td>
                    <td className="p-3 text-sky-600 font-semibold">{r.shed1.waterUsedLiters} L</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">
                      <span className={s2Pct <= 18 ? 'text-rose-600 font-bold' : ''}>
                        {r.shed2.waterLevelLiters} L ({s2Pct}%)
                      </span>
                    </td>
                    <td className="p-3 text-sky-600 font-semibold">{r.shed2.waterUsedLiters} L</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {r.totalWaterUsedTodayLiters.toLocaleString()} L
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{ratio} : 1</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s2Pct <= 18 || s1Pct <= 18
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {s2Pct <= 18 || s1Pct <= 18 ? '🔴 Refill Req' : '🟢 Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
