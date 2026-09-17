import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Home,
  Skull,
  Wheat,
  Scale,
  Droplets,
  Thermometer,
  Fan,
  Calendar,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import {
  calculateDailyMortalityRate,
  calculateSurvivalRate,
  calculateWeightDifference,
  evaluateFanRecommendation,
} from '../../utils/calculations';
import { getExpectedWeightForAge } from '../../utils/breedStandards';
import { WaterTankVisual } from '../common/WaterTankVisual';

interface ShedDetailViewProps {
  shedId: 'shed-1' | 'shed-2';
  onBackToDashboard: () => void;
  onOpenDailyEntry: () => void;
}

export const ShedDetailView: React.FC<ShedDetailViewProps> = ({
  shedId,
  onBackToDashboard,
  onOpenDailyEntry,
}) => {
  const { activeBatch, dailyRecords, latestRecord, settings } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');

  const isShed1 = shedId === 'shed-1';
  const shedName = isShed1 ? 'Shed 1' : 'Shed 2';
  const startingChicks = activeBatch
    ? isShed1
      ? activeBatch.shed1StartingChicks
      : activeBatch.shed2StartingChicks
    : 6000;
  const tankCapacity = isShed1 ? settings.shed1TankLiters : settings.shed2TankLiters;

  if (!activeBatch || !latestRecord) {
    return <div className="p-8 text-center">No batch data available.</div>;
  }

  const latestShed = isShed1 ? latestRecord.shed1 : latestRecord.shed2;

  // Calculate cumulative deaths in this shed
  let shedCumulativeDead = 0;
  dailyRecords.forEach(r => {
    const dead = isShed1 ? r.shed1.deadChicks : r.shed2.deadChicks;
    shedCumulativeDead += dead;
  });

  const currentLive = Math.max(0, startingChicks - shedCumulativeDead);
  const todayDead = latestShed.deadChicks;
  const mortalityPercent = Number(((shedCumulativeDead / startingChicks) * 100).toFixed(2));
  const survivalPercent = calculateSurvivalRate(shedCumulativeDead, startingChicks);

  const feedUsedToday = latestShed.feedUsedKg;
  const feedPerChickGrams = currentLive > 0 ? Number(((feedUsedToday * 1000) / currentLive).toFixed(1)) : 0;

  const actualWeight = latestShed.sampleAvgWeightGrams;
  const expectedWeight = getExpectedWeightForAge(latestRecord.dayOfBatch, activeBatch.breed);
  const weightDiff = calculateWeightDifference(actualWeight, expectedWeight);

  const fanEval = evaluateFanRecommendation(
    latestShed.temperatureCelsius,
    latestShed.humidityPercent,
    latestRecord.dayOfBatch,
    settings
  );

  // Filter historical records for this shed
  const filteredRecords = dailyRecords
    .filter(r => r.date.includes(searchTerm) || `day ${r.dayOfBatch}`.includes(searchTerm.toLowerCase()))
    .reverse();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                {shedName} Complete Management
              </h2>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                Active Shed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Batch: {activeBatch.name} • Day {latestRecord.dayOfBatch} of {activeBatch.targetHarvestAgeDays}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDailyEntry}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          + Add Daily Log
        </button>
      </div>

      {/* 4 PRIMARY METRIC CARDS FOR THIS SHED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live & Starting Chicks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            🐔 Chick Population
          </span>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
            {currentLive.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">live birds</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>Starting: {startingChicks.toLocaleString()}</span>
            <span className="text-emerald-600 font-semibold">{survivalPercent}% Survival</span>
          </div>
        </div>

        {/* Mortality & Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            ☠️ Mortality Status
          </span>
          <div className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400 mt-1">
            {todayDead}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">dead today</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>Cumulative: {shedCumulativeDead} birds</span>
            <span className="font-semibold text-rose-600">{mortalityPercent}%</span>
          </div>
        </div>

        {/* Feed Usage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            🌾 Feed Consumption
          </span>
          <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
            {feedUsedToday}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kg today</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>Rate: {feedPerChickGrams} g/bird</span>
            <span className="text-amber-600 font-semibold">Standard</span>
          </div>
        </div>

        {/* Average Weight vs Target */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            ⚖️ Average Weight
          </span>
          <div className="text-2xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-1">
            {actualWeight}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">grams</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>Target: {expectedWeight}g</span>
            <span className={`font-semibold ${weightDiff.diffGrams >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {weightDiff.diffGrams >= 0 ? `+${weightDiff.diffGrams}g` : `${weightDiff.diffGrams}g`}
            </span>
          </div>
        </div>
      </div>

      {/* ENVIRONMENT, FAN ADVISORY & WATER TANK GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environment & Recommended Fan Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-500" />
              <span>{shedName} Environmental Condition</span>
            </h3>
            <span className="text-xs text-slate-400">Continuous Evaluation</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase block">
                Shed Temperature
              </span>
              <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 font-display">
                {latestShed.temperatureCelsius}°C
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Safe range: {settings.alertTempMinCelsius}°C – {settings.alertTempMaxCelsius}°C
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900">
              <span className="text-xs font-bold text-cyan-900 dark:text-cyan-300 uppercase block">
                Relative Humidity
              </span>
              <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1 font-display">
                {latestShed.humidityPercent}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Safe range: {settings.alertHumidityMinPercent}% – {settings.alertHumidityMaxPercent}%
              </p>
            </div>
          </div>

          {/* Recommended Fan Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              fanEval.recommendedFan === 'ON'
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl ${
                fanEval.recommendedFan === 'ON'
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <Fan className={`w-5 h-5 ${fanEval.recommendedFan === 'ON' ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Recommended Fan Status:
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    fanEval.recommendedFan === 'ON'
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {fanEval.recommendedFan}
                </span>
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed">{fanEval.message}</p>
            </div>
          </div>
        </div>

        {/* Dedicated Visual Water Tank for this Shed */}
        <WaterTankVisual
          shedName={shedName}
          currentLevelLiters={latestShed.waterLevelLiters}
          tankCapacityLiters={tankCapacity}
          waterUsedTodayLiters={latestShed.waterUsedLiters}
        />
      </div>

      {/* SHED COMPLETE HISTORICAL LOG TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {shedName} Daily Historical Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete chronological audit trail for this shed
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by date or day..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Day / Date</th>
                <th className="p-3">Dead Birds</th>
                <th className="p-3">Feed Used</th>
                <th className="p-3">Avg Weight</th>
                <th className="p-3">Target Diff</th>
                <th className="p-3">Water Level</th>
                <th className="p-3">Temp / RH</th>
                <th className="p-3">Fan Advisory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map(r => {
                const sData = isShed1 ? r.shed1 : r.shed2;
                const exp = getExpectedWeightForAge(r.dayOfBatch, activeBatch.breed);
                const diff = sData.sampleAvgWeightGrams - exp;
                const fEval = evaluateFanRecommendation(
                  sData.temperatureCelsius,
                  sData.humidityPercent,
                  r.dayOfBatch,
                  settings
                );

                return (
                  <tr key={r.date} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      Day {r.dayOfBatch} <span className="text-[10px] text-slate-400 block">{r.date}</span>
                    </td>
                    <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">
                      {sData.deadChicks}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {sData.feedUsedKg} kg
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {sData.sampleAvgWeightGrams} g
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          diff >= 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {diff >= 0 ? `+${diff}g` : `${diff}g`}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {sData.waterLevelLiters} L
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {sData.temperatureCelsius}°C / {sData.humidityPercent}%
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fEval.recommendedFan === 'ON'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {fEval.recommendedFan}
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
