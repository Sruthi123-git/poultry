import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Skull,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  PlusCircle,
  Filter,
} from 'lucide-react';
import {
  calculateDailyMortalityRate,
  calculateCumulativeMortalityRate,
  calculateSurvivalRate,
} from '../../utils/calculations';
import { MortalityTrendChart } from '../common/Charts';

interface MortalityViewProps {
  onOpenDailyEntry: () => void;
}

export const MortalityView: React.FC<MortalityViewProps> = ({ onOpenDailyEntry }) => {
  const { activeBatch, dailyRecords, latestRecord, settings } = useFarm();
  const { isDark } = useTheme();
  const [filterShed, setFilterShed] = useState<'all' | 'shed-1' | 'shed-2'>('all');

  if (!activeBatch || !latestRecord) {
    return <div className="p-8 text-center">No active batch data available.</div>;
  }

  const startingChicks = activeBatch.initialChicks;
  const currentLive = latestRecord.totalLiveBirds;
  const todayDead = latestRecord.totalMortalityToday;
  const cumulativeDead = latestRecord.cumulativeMortalityToDate;
  const dailyRate = calculateDailyMortalityRate(todayDead, startingChicks);
  const cumulativeRate = calculateCumulativeMortalityRate(cumulativeDead, startingChicks);
  const survivalRate = calculateSurvivalRate(cumulativeDead, startingChicks);

  // Shed breakdowns
  const s1DeadToday = latestRecord.shed1.deadChicks;
  const s2DeadToday = latestRecord.shed2.deadChicks;

  let s1Cumulative = 0;
  let s2Cumulative = 0;
  dailyRecords.forEach(r => {
    s1Cumulative += r.shed1.deadChicks;
    s2Cumulative += r.shed2.deadChicks;
  });

  const isDailySpike = dailyRate >= settings.alertMortalityThresholdPercent;

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Skull className="w-6 h-6 text-rose-500" />
            <span>Chick Mortality Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated calculations: Live Chicks = Previous Live − Today's Dead • Mortality % = Total Dead / Starting × 100
          </p>
        </div>
        <button
          onClick={onOpenDailyEntry}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Daily Mortality Record</span>
        </button>
      </div>

      {/* ALERT BANNER IF ELEVATED MORTALITY */}
      {isDailySpike && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-sm">Elevated Mortality Alert</h4>
            <p className="mt-0.5 leading-relaxed">
              Today's mortality rate of <strong>{dailyRate}% ({todayDead} birds)</strong> exceeds the configured farm threshold of {settings.alertMortalityThresholdPercent}%. Inspect shed ventilation, drinker line flow, and check for signs of early bacterial infection.
            </p>
          </div>
        </div>
      )}

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Today's Deaths
          </span>
          <div className="text-3xl font-extrabold font-display text-rose-600 dark:text-rose-400 mt-1">
            {todayDead}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">birds</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Shed 1: {s1DeadToday}</span>
            <span>Shed 2: {s2DeadToday}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Cumulative Deaths
          </span>
          <div className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            {cumulativeDead}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">birds</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>S1: {s1Cumulative}</span>
            <span>S2: {s2Cumulative}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Current Live Chicks
          </span>
          <div className="text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            {currentLive.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">birds</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>of {startingChicks.toLocaleString()} starting</span>
            <span>Day {latestRecord.dayOfBatch}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Survival Rate
          </span>
          <div className="text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            {survivalRate}%
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Mortality: {cumulativeRate}%</span>
            <span className="font-semibold text-emerald-600">Optimal Target</span>
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          Daily & Cumulative Chick Mortality Curve
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Visual analysis of shed-specific losses across the batch growth cycle
        </p>
        <div className="h-72 sm:h-80">
          <MortalityTrendChart records={dailyRecords} isDark={isDark} />
        </div>
      </div>

      {/* DAILY MORTALITY LOG TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Daily Chick Mortality Log
          </h3>
          <span className="text-xs text-slate-500">
            Showing {dailyRecords.length} recorded days
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Day</th>
                <th className="p-3">Date</th>
                <th className="p-3">Shed 1 Dead</th>
                <th className="p-3">Shed 2 Dead</th>
                <th className="p-3">Today Total</th>
                <th className="p-3">Daily Mortality %</th>
                <th className="p-3">Cumulative Dead</th>
                <th className="p-3">Current Live</th>
                <th className="p-3">Survival %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...dailyRecords].reverse().map(r => {
                const dayMortRate = calculateDailyMortalityRate(r.totalMortalityToday, startingChicks);
                const survRate = calculateSurvivalRate(r.cumulativeMortalityToDate, startingChicks);

                return (
                  <tr key={r.date} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      Day {r.dayOfBatch}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{r.date}</td>
                    <td className="p-3 text-rose-600 font-semibold">{r.shed1.deadChicks}</td>
                    <td className="p-3 text-rose-600 font-semibold">{r.shed2.deadChicks}</td>
                    <td className="p-3 font-bold text-rose-600 dark:text-rose-400">
                      {r.totalMortalityToday}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          dayMortRate > settings.alertMortalityThresholdPercent
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {dayMortRate}%
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {r.cumulativeMortalityToDate}
                    </td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {r.totalLiveBirds.toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {survRate}%
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
