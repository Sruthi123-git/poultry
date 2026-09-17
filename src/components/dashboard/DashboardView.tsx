import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Skull,
  Wheat,
  Scale,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Fan,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  calculateDailyMortalityRate,
  calculateCumulativeMortalityRate,
  calculateSurvivalRate,
  calculateFeedDaysRemaining,
  calculateWeightDifference,
  calculateWaterTankStatus,
  evaluateFanRecommendation,
  evaluateFarmHealth,
} from '../../utils/calculations';
import { getExpectedWeightForAge } from '../../utils/breedStandards';
import { WeightGrowthChart, MortalityTrendChart } from '../common/Charts';
import { WaterTankVisual } from '../common/WaterTankVisual';
import { NavTab } from '../common/Sidebar';

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenDailyEntry: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenDailyEntry,
}) => {
  const {
    activeBatch,
    latestRecord,
    dailyRecords,
    totalFeedStockKg,
    settings,
    alerts,
    unacknowledgedAlertsCount,
  } = useFarm();
  const { isDark } = useTheme();

  if (!activeBatch || !latestRecord) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-3xl mx-auto mb-4">
          🐔
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No Active Batch Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Start a new batch or reset the sample data to immediately view live telemetry.
        </p>
        <button
          onClick={onOpenDailyEntry}
          className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-md"
        >
          + Add First Daily Record
        </button>
      </div>
    );
  }

  // 1. Calculations
  const startingChicks = activeBatch.initialChicks;
  const currentLive = latestRecord.totalLiveBirds;
  const todayDead = latestRecord.totalMortalityToday;
  const cumulativeDead = latestRecord.cumulativeMortalityToDate;
  const dailyMortRate = calculateDailyMortalityRate(todayDead, startingChicks);
  const survivalRate = calculateSurvivalRate(cumulativeDead, startingChicks);

  const feedDays = calculateFeedDaysRemaining(totalFeedStockKg, dailyRecords);
  const feedPerBirdToday = ((latestRecord.totalFeedUsedTodayKg * 1000) / (currentLive || 1)).toFixed(1);

  const expectedWeight = getExpectedWeightForAge(latestRecord.dayOfBatch, activeBatch.breed);
  const weightDiff = calculateWeightDifference(latestRecord.overallAvgWeightGrams, expectedWeight);

  const s1Water = calculateWaterTankStatus(latestRecord.shed1.waterLevelLiters, settings.shed1TankLiters);
  const s2Water = calculateWaterTankStatus(latestRecord.shed2.waterLevelLiters, settings.shed2TankLiters);

  const s1Fan = evaluateFanRecommendation(
    latestRecord.shed1.temperatureCelsius,
    latestRecord.shed1.humidityPercent,
    latestRecord.dayOfBatch,
    settings
  );
  const s2Fan = evaluateFanRecommendation(
    latestRecord.shed2.temperatureCelsius,
    latestRecord.shed2.humidityPercent,
    latestRecord.dayOfBatch,
    settings
  );

  // Farm Health Evaluation
  const farmHealth = evaluateFarmHealth(latestRecord, activeBatch, totalFeedStockKg, settings);

  return (
    <div className="space-y-6 pb-12">
      {/* 10-Second Farm Health Condition Banner */}
      <div
        className={`p-5 rounded-3xl border shadow-card transition-all ${
          farmHealth.overallStatus === 'critical'
            ? 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-slate-50 dark:from-rose-950/40 dark:to-slate-900 border-rose-400 dark:border-rose-900'
            : farmHealth.overallStatus === 'attention'
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 dark:from-amber-950/40 dark:to-slate-900 border-amber-400 dark:border-amber-900'
            : 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-slate-50 dark:from-emerald-950/40 dark:to-slate-900 border-emerald-300 dark:border-emerald-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
                farmHealth.overallStatus === 'critical'
                  ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
                  : farmHealth.overallStatus === 'attention'
                  ? 'bg-amber-500 text-white shadow-amber-500/30'
                  : 'bg-emerald-600 text-white shadow-emerald-600/30'
              }`}
            >
              {farmHealth.overallStatus === 'critical' ? (
                <ShieldAlert className="w-6 h-6" />
              ) : farmHealth.overallStatus === 'attention' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Farm Health Overview
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white ${
                    farmHealth.overallStatus === 'critical'
                      ? 'bg-rose-600'
                      : farmHealth.overallStatus === 'attention'
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {farmHealth.overallStatus === 'critical'
                    ? '🔴 Critical'
                    : farmHealth.overallStatus === 'attention'
                    ? '🟡 Attention Required'
                    : '🟢 Normal'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
                {farmHealth.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                {farmHealth.issues.length > 0
                  ? `Identified ${farmHealth.issues.length} item(s) requiring farmer action today.`
                  : 'All biosecurity, feed, water, and environmental metrics are in safe target ranges.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center">
            {unacknowledgedAlertsCount > 0 && (
              <button
                onClick={() => onNavigateTab('alerts')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-all"
              >
                <span>View {unacknowledgedAlertsCount} Action Alert(s)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenDailyEntry}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
            >
              <span>+ Add Today's Data</span>
            </button>
          </div>
        </div>

        {/* Highlighted Urgent Action Items */}
        {farmHealth.issues.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {farmHealth.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
                  issue.severity === 'critical'
                    ? 'bg-rose-100/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                }`}
              >
                <span className="shrink-0">{issue.severity === 'critical' ? '🔴' : '🟡'}</span>
                <span className="truncate">
                  <strong>{issue.shed}:</strong> {issue.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6 TOP DASHBOARD KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Live Chicks */}
        <div
          onClick={() => onNavigateTab('mortality')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">🐔 Live Chicks</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {survivalRate}% Survival
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {currentLive.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              of {startingChicks.toLocaleString()} starting (Day {latestRecord.dayOfBatch})
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>S1: {(6000 - latestRecord.shed1.deadChicks * 10).toLocaleString()}</span>
            <span>S2: {(6000 - latestRecord.shed2.deadChicks * 10).toLocaleString()}</span>
          </div>
        </div>

        {/* 2. Today's Mortality */}
        <div
          onClick={() => onNavigateTab('mortality')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">☠️ Today Mortality</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                dailyMortRate > settings.alertMortalityThresholdPercent
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {dailyMortRate}%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400">
              {todayDead}{' '}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">birds</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total cumulative: {cumulativeDead} dead ({((cumulativeDead / startingChicks) * 100).toFixed(2)}%)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>S1: {latestRecord.shed1.deadChicks}</span>
            <span>S2: {latestRecord.shed2.deadChicks}</span>
          </div>
        </div>

        {/* 3. Feed Used Today & Stock */}
        <div
          onClick={() => onNavigateTab('feed')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">🌾 Feed Today</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                feedDays.status === 'critical'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : feedDays.status === 'warning'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              ~{feedDays.days}d stock
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">
              {latestRecord.totalFeedUsedTodayKg.toLocaleString()}{' '}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">kg</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stock: {totalFeedStockKg.toLocaleString()} kg ({feedPerBirdToday}g/bird)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>S1: {latestRecord.shed1.feedUsedKg} kg</span>
            <span>S2: {latestRecord.shed2.feedUsedKg} kg</span>
          </div>
        </div>

        {/* 4. Average Weight */}
        <div
          onClick={() => onNavigateTab('weight')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">⚖️ Avg Weight</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                weightDiff.diffGrams >= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {weightDiff.diffGrams >= 0 ? `+${weightDiff.diffGrams}g` : `${weightDiff.diffGrams}g`}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-display text-indigo-600 dark:text-indigo-400">
              {latestRecord.overallAvgWeightGrams}{' '}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">g</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target: {expectedWeight}g ({activeBatch.breed})
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>S1: {latestRecord.shed1.sampleAvgWeightGrams}g</span>
            <span>S2: {latestRecord.shed2.sampleAvgWeightGrams}g</span>
          </div>
        </div>

        {/* 5. Water Tanks Status */}
        <div
          onClick={() => onNavigateTab('water')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">💧 Water Status</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                s2Water.status === 'critical' || s1Water.status === 'critical'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                  : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
              }`}
            >
              {s2Water.status === 'critical' || s1Water.status === 'critical' ? '🔴 Refill Req' : '🟢 Normal'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-display text-sky-600 dark:text-sky-400">
              S1: {s1Water.percentage}% • S2: {s2Water.percentage}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Used: {latestRecord.totalWaterUsedTodayLiters.toLocaleString()} L today
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>S1: {latestRecord.shed1.waterLevelLiters}L</span>
            <span className={s2Water.percentage <= 18 ? 'text-rose-500 font-bold' : ''}>
              S2: {latestRecord.shed2.waterLevelLiters}L
            </span>
          </div>
        </div>

        {/* 6. Environment & Fan Advisory */}
        <div
          onClick={() => onNavigateTab('environment')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">🌡️ Environment</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                s1Fan.recommendedFan === 'ON' || s2Fan.recommendedFan === 'ON'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              Fan: {s1Fan.recommendedFan === 'ON' || s2Fan.recommendedFan === 'ON' ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-display text-cyan-600 dark:text-cyan-400">
              {latestRecord.avgTemperatureCelsius}°C • {latestRecord.avgHumidityPercent}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {s1Fan.recommendedFan === 'ON' ? '🔴 S1 Fan ON advised' : '🟢 Safe comfort zone'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>S1: {latestRecord.shed1.temperatureCelsius}°C</span>
            <span>S2: {latestRecord.shed2.temperatureCelsius}°C</span>
          </div>
        </div>
      </div>

      {/* SHED 1 & SHED 2 SIDE-BY-SIDE SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHED 1 CARD */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-emerald-600/20">
                S1
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">SHED 1</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Starting: {activeBatch.shed1StartingChicks.toLocaleString()} birds
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('shed-1')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Detailed Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                Live Birds
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {(activeBatch.shed1StartingChicks - (latestRecord.shed1.deadChicks * 10)).toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                Dead Today
              </span>
              <span className="font-bold text-sm text-rose-600 dark:text-rose-400">
                {latestRecord.shed1.deadChicks} birds
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                Feed Used
              </span>
              <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                {latestRecord.shed1.feedUsedKg} kg
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                Avg Weight
              </span>
              <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                {latestRecord.shed1.sampleAvgWeightGrams} g
              </span>
            </div>
          </div>

          {/* Environmental & Fan Recommendation Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>{latestRecord.shed1.temperatureCelsius}°C</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <span>{latestRecord.shed1.humidityPercent}% RH</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Recommended Fan:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                  s1Fan.recommendedFan === 'ON'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300'
                }`}
              >
                <Fan className={`w-3 h-3 ${s1Fan.recommendedFan === 'ON' ? 'animate-spin' : ''}`} />
                {s1Fan.recommendedFan}
              </span>
            </div>
          </div>
        </div>

        {/* SHED 2 CARD */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-green-600/20">
                S2
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">SHED 2</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Starting: {activeBatch.shed2StartingChicks.toLocaleString()} birds
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('shed-2')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Detailed Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                Live Birds
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {(activeBatch.shed2StartingChicks - (latestRecord.shed2.deadChicks * 10)).toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                Dead Today
              </span>
              <span className="font-bold text-sm text-rose-600 dark:text-rose-400">
                {latestRecord.shed2.deadChicks} birds
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                Feed Used
              </span>
              <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                {latestRecord.shed2.feedUsedKg} kg
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                Avg Weight
              </span>
              <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                {latestRecord.shed2.sampleAvgWeightGrams} g
              </span>
            </div>
          </div>

          {/* Environmental & Fan Recommendation Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>{latestRecord.shed2.temperatureCelsius}°C</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <span>{latestRecord.shed2.humidityPercent}% RH</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Recommended Fan:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                  s2Fan.recommendedFan === 'ON'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300'
                }`}
              >
                <Fan className={`w-3 h-3 ${s2Fan.recommendedFan === 'ON' ? 'animate-spin' : ''}`} />
                {s2Fan.recommendedFan}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION: Weight Progression vs Breed Curve + Mortality Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Growth Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-500" />
                <span>Flock Growth vs {activeBatch.breed} Standard</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actual daily average bird weight compared against commercial breed target curve
              </p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg">
              Day {latestRecord.dayOfBatch}
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <WeightGrowthChart
              records={dailyRecords}
              breedName={activeBatch.breed}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Mortality Trend Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Skull className="w-4 h-4 text-rose-500" />
                <span>Mortality Tracking (Shed 1 & Shed 2)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily bird mortality breakdown and cumulative curve over batch duration
              </p>
            </div>
            <span className="text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-lg">
              {cumulativeDead} Total Dead
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <MortalityTrendChart records={dailyRecords} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* DUAL WATER TANKS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span>Water Tanks Telemetry</span>
          </h3>
          <button
            onClick={() => onNavigateTab('water')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View Water Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WaterTankVisual
            shedName="Shed 1"
            currentLevelLiters={latestRecord.shed1.waterLevelLiters}
            tankCapacityLiters={settings.shed1TankLiters}
            waterUsedTodayLiters={latestRecord.shed1.waterUsedLiters}
          />
          <WaterTankVisual
            shedName="Shed 2"
            currentLevelLiters={latestRecord.shed2.waterLevelLiters}
            tankCapacityLiters={settings.shed2TankLiters}
            waterUsedTodayLiters={latestRecord.shed2.waterUsedLiters}
          />
        </div>
      </div>
    </div>
  );
};
