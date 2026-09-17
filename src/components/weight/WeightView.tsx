import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Scale,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  calculateWeightDifference,
  calculateADG,
} from '../../utils/calculations';
import {
  getBreedStandards,
  getExpectedWeightForAge,
  VENCOBB_430_STANDARDS,
  COBB_500_STANDARDS,
  ROSS_308_STANDARDS,
} from '../../utils/breedStandards';
import { WeightGrowthChart } from '../common/Charts';

interface WeightViewProps {
  onOpenDailyEntry: () => void;
}

export const WeightView: React.FC<WeightViewProps> = ({ onOpenDailyEntry }) => {
  const { activeBatch, dailyRecords, latestRecord } = useFarm();
  const { isDark } = useTheme();
  const [selectedBreed, setSelectedBreed] = useState<string>(activeBatch?.breed || 'Vencobb 430Y');

  if (!activeBatch || !latestRecord) {
    return <div className="p-8 text-center">No active batch data available.</div>;
  }

  const currentAge = latestRecord.dayOfBatch;
  const currentActualWeight = latestRecord.overallAvgWeightGrams;
  const currentExpectedWeight = getExpectedWeightForAge(currentAge, selectedBreed);
  const weightDiff = calculateWeightDifference(currentActualWeight, currentExpectedWeight);

  // ADG Calculation
  const currentADG = calculateADG(currentActualWeight, 42, currentAge);

  // Day-over-Day Weight Gain
  const previousRecord = dailyRecords.length > 1 ? dailyRecords[dailyRecords.length - 2] : null;
  const dailyGain = previousRecord
    ? currentActualWeight - previousRecord.overallAvgWeightGrams
    : currentActualWeight - 42;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breed Target Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-500" />
            <span>Flock Growth & Weight Monitoring</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Formula: Weight Difference = Actual − Expected • ADG = (Current Weight − 42g) / Age Days
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Breed Standard Selection */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-600 dark:text-slate-400">Standard:</span>
            <select
              value={selectedBreed}
              onChange={e => setSelectedBreed(e.target.value)}
              className="bg-transparent font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="Vencobb 430Y" className="dark:bg-slate-900">Vencobb 430Y Standard</option>
              <option value="Cobb 500" className="dark:bg-slate-900">Cobb 500 Standard</option>
              <option value="Ross 308" className="dark:bg-slate-900">Ross 308 Standard</option>
            </select>
          </div>

          <button
            onClick={onOpenDailyEntry}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            + Record Sample Weight
          </button>
        </div>
      </div>

      {/* GROWTH STATUS BANNER */}
      <div
        className={`p-5 rounded-3xl border shadow-card flex items-start gap-4 ${
          weightDiff.status === 'critical'
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-100'
            : weightDiff.status === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-100'
            : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
        }`}
      >
        <div
          className={`p-3 rounded-2xl ${
            weightDiff.status === 'critical'
              ? 'bg-rose-600 text-white'
              : weightDiff.status === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {weightDiff.status === 'critical' ? (
            <AlertTriangle className="w-6 h-6" />
          ) : weightDiff.status === 'warning' ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">
              {weightDiff.status === 'critical'
                ? '🔴 Growth Significantly Below Target'
                : weightDiff.status === 'warning'
                ? '🟡 Growth Slightly Below Target'
                : '🟢 Flock Growth On Track'}
            </h3>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white/50 dark:bg-black/40">
              {weightDiff.diffGrams >= 0 ? `+${weightDiff.diffGrams}g Delta` : `${weightDiff.diffGrams}g Delta`}
            </span>
          </div>
          <p className="text-xs font-medium mt-1 leading-relaxed">
            At <strong>Day {currentAge}</strong>, average flock weight is <strong>{currentActualWeight} g</strong> vs expected {selectedBreed} benchmark of <strong>{currentExpectedWeight} g</strong>. {weightDiff.label}.
          </p>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Actual Average Weight */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Current Avg Weight
          </span>
          <div className="text-3xl font-extrabold font-display text-indigo-600 dark:text-indigo-400 mt-1">
            {currentActualWeight}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">grams</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>S1: {latestRecord.shed1.sampleAvgWeightGrams}g</span>
            <span>S2: {latestRecord.shed2.sampleAvgWeightGrams}g</span>
          </div>
        </div>

        {/* Expected Standard Weight */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Expected Standard Weight
          </span>
          <div className="text-3xl font-extrabold font-display text-slate-800 dark:text-slate-200 mt-1">
            {currentExpectedWeight}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">grams</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Standard: {selectedBreed}</span>
            <span>Day {currentAge}</span>
          </div>
        </div>

        {/* Weight Difference */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Weight Difference
          </span>
          <div
            className={`text-3xl font-extrabold font-display mt-1 ${
              weightDiff.diffGrams >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {weightDiff.diffGrams >= 0 ? `+${weightDiff.diffGrams}` : weightDiff.diffGrams}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">g</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Status: {weightDiff.status === 'on_track' ? 'On Track' : 'Lagging'}</span>
            <span className="font-semibold">{Math.abs(Number(((weightDiff.diffGrams / currentExpectedWeight) * 100).toFixed(1)))}% delta</span>
          </div>
        </div>

        {/* Average Daily Gain (ADG) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Average Daily Gain (ADG)
          </span>
          <div className="text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            {currentADG}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">g / day</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>24h Gain: +{dailyGain}g</span>
            <span className="font-semibold text-emerald-600">High Growth</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE WEIGHT GROWTH CHART */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          Actual Flock Growth vs Expected {selectedBreed} Target Curve
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Visual trajectory of daily recorded bird weights compared against standard broiler performance targets
        </p>
        <div className="h-72 sm:h-80">
          <WeightGrowthChart
            records={dailyRecords}
            breedName={selectedBreed}
            isDark={isDark}
          />
        </div>
      </div>

      {/* WEIGHT & GROWTH TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Daily Weight Performance Table
          </h3>
          <span className="text-xs text-slate-500">
            {dailyRecords.length} recorded age checkpoints
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Age (Days)</th>
                <th className="p-3">Date</th>
                <th className="p-3">Shed 1 Weight</th>
                <th className="p-3">Shed 2 Weight</th>
                <th className="p-3">Actual Avg Weight</th>
                <th className="p-3">Expected Weight</th>
                <th className="p-3">Difference</th>
                <th className="p-3">ADG (g/day)</th>
                <th className="p-3">Growth Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...dailyRecords].reverse().map(r => {
                const exp = getExpectedWeightForAge(r.dayOfBatch, selectedBreed);
                const diff = calculateWeightDifference(r.overallAvgWeightGrams, exp);
                const adg = calculateADG(r.overallAvgWeightGrams, 42, r.dayOfBatch);

                return (
                  <tr key={r.date} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      Day {r.dayOfBatch}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{r.date}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{r.shed1.sampleAvgWeightGrams} g</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{r.shed2.sampleAvgWeightGrams} g</td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {r.overallAvgWeightGrams} g
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{exp} g</td>
                    <td className="p-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          diff.diffGrams >= 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : diff.diffGrams >= -35
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {diff.diffGrams >= 0 ? `+${diff.diffGrams}g` : `${diff.diffGrams}g`}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {adg} g
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          diff.status === 'on_track'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : diff.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {diff.status === 'on_track'
                          ? '🟢 On Track'
                          : diff.status === 'warning'
                          ? '🟡 Slightly Below'
                          : '🔴 Significantly Below'}
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
