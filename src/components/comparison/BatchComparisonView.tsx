import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import {
  GitCompare,
  TrendingUp,
  Layers,
  Calendar,
  Scale,
  Skull,
  Wheat,
  Droplets,
  CheckCircle2,
} from 'lucide-react';
import { Batch, DailyFarmRecord } from '../../types';
import { getDailyRecordsForBatch } from '../../db/repository';
import {
  calculateDailyMortalityRate,
  calculateSurvivalRate,
  calculateFCR,
} from '../../utils/calculations';
import { Line } from 'react-chartjs-2';

export const BatchComparisonView: React.FC = () => {
  const { activeBatch, previousBatch, dailyRecords, batches } = useFarm();
  const { isDark } = useTheme();

  const [selectedBatchAId, setSelectedBatchAId] = useState<string>(activeBatch?.id || '');
  const [selectedBatchBId, setSelectedBatchBId] = useState<string>(previousBatch?.id || '');
  const [recordsA, setRecordsA] = useState<DailyFarmRecord[]>([]);
  const [recordsB, setRecordsB] = useState<DailyFarmRecord[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(28);

  const batchA = batches.find(b => b.id === selectedBatchAId) || activeBatch;
  const batchB = batches.find(b => b.id === selectedBatchBId) || previousBatch;

  useEffect(() => {
    if (selectedBatchAId) {
      getDailyRecordsForBatch(selectedBatchAId).then(setRecordsA);
    }
  }, [selectedBatchAId]);

  useEffect(() => {
    if (selectedBatchBId) {
      getDailyRecordsForBatch(selectedBatchBId).then(setRecordsB);
    }
  }, [selectedBatchBId]);

  if (!batchA || !batchB) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Requires at least two batches to compare.
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Create a second batch or reset demo data to enable rich side-by-side cycle comparisons.
        </p>
      </div>
    );
  }

  // Max age to compare
  const maxDayA = recordsA.length > 0 ? recordsA[recordsA.length - 1].dayOfBatch : 28;
  const maxDayB = recordsB.length > 0 ? recordsB[recordsB.length - 1].dayOfBatch : 42;
  const commonMaxDay = Math.min(maxDayA, maxDayB);

  const recordAAtDay = recordsA.find(r => r.dayOfBatch === selectedDay) || recordsA[recordsA.length - 1];
  const recordBAtDay = recordsB.find(r => r.dayOfBatch === selectedDay) || recordsB[recordsB.length - 1];

  // Batch A Metrics at Day
  const liveA = recordAAtDay?.totalLiveBirds || 0;
  const deadA = recordAAtDay?.cumulativeMortalityToDate || 0;
  const survA = calculateSurvivalRate(deadA, batchA.initialChicks);
  const weightA = recordAAtDay?.overallAvgWeightGrams || 0;
  const feedTodayA = recordAAtDay?.totalFeedUsedTodayKg || 0;
  const waterTodayA = recordAAtDay?.totalWaterUsedTodayLiters || 0;

  // Batch B Metrics at Day
  const liveB = recordBAtDay?.totalLiveBirds || 0;
  const deadB = recordBAtDay?.cumulativeMortalityToDate || 0;
  const survB = calculateSurvivalRate(deadB, batchB.initialChicks);
  const weightB = recordBAtDay?.overallAvgWeightGrams || 0;
  const feedTodayB = recordBAtDay?.totalFeedUsedTodayKg || 0;
  const waterTodayB = recordBAtDay?.totalWaterUsedTodayLiters || 0;

  // Deltas (A - B)
  const deltaLive = liveA - liveB;
  const deltaDead = deadA - deadB;
  const deltaWeight = weightA - weightB;
  const deltaFeed = feedTodayA - feedTodayB;
  const deltaWater = waterTodayA - waterTodayB;

  // Chart Data: Weight comparison across all common days
  const chartLabels = Array.from({ length: Math.max(recordsA.length, recordsB.length) }, (_, i) => `Day ${i + 1}`);
  const weightsA = recordsA.map(r => r.overallAvgWeightGrams);
  const weightsB = recordsB.map(r => r.overallAvgWeightGrams);

  const weightChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${batchA.name} (Current)`,
        data: weightsA,
        borderColor: '#10b981', // Emerald
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.3,
      },
      {
        label: `${batchB.name} (Previous)`,
        data: weightsB,
        borderColor: '#8b5cf6', // Violet
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Batch Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-violet-500" />
            <span>Batch Performance Comparison</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Compare current flock trajectory against historical batches normalized at the same day of life
          </p>
        </div>

        {/* Batch Selectors */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <span className="font-bold text-emerald-600">Batch A:</span>
            <select
              value={selectedBatchAId}
              onChange={e => setSelectedBatchAId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id} className="dark:bg-slate-900">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <span className="font-bold text-violet-600">Batch B:</span>
            <select
              value={selectedBatchBId}
              onChange={e => setSelectedBatchBId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id} className="dark:bg-slate-900">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AGE / DAY NORMALIZER SLIDER BAR */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Comparing at Day {selectedDay}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select bird age to inspect exact side-by-side numerical differences at that stage
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {[7, 14, 21, 28, 35, 42].map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(Math.min(day, commonMaxDay || 28))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDay === day
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        <input
          type="range"
          min="1"
          max={commonMaxDay || 28}
          value={selectedDay}
          onChange={e => setSelectedDay(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>

      {/* SIDE-BY-SIDE NUMERICAL COMPARISON CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Weight Delta */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            ⚖️ Average Weight at Day {selectedDay}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-emerald-600 font-bold block">{batchA.name.split(' ')[0]}</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {weightA} g
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-violet-600 font-bold block">{batchB.name.split(' ')[0]}</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {weightB} g
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold flex justify-between">
            <span>Numerical Delta:</span>
            <span className={deltaWeight >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {deltaWeight >= 0 ? `+${deltaWeight}g heavier` : `${deltaWeight}g lighter`}
            </span>
          </div>
        </div>

        {/* Live Birds & Survival Delta */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            🐔 Live Birds at Day {selectedDay}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-emerald-600 font-bold block">{batchA.name.split(' ')[0]}</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                {liveA.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-violet-600 font-bold block">{batchB.name.split(' ')[0]}</span>
              <span className="text-2xl font-extrabold text-violet-600 dark:text-violet-400 font-display">
                {liveB.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold flex justify-between">
            <span>Survival Rate:</span>
            <span className="text-emerald-600">
              {survA}% vs {survB}% ({deltaLive >= 0 ? `+${deltaLive} birds` : `${deltaLive} birds`})
            </span>
          </div>
        </div>

        {/* Feed Used Delta */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            🌾 Daily Feed Used at Day {selectedDay}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-emerald-600 font-bold block">{batchA.name.split(' ')[0]}</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
                {feedTodayA} kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-violet-600 font-bold block">{batchB.name.split(' ')[0]}</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
                {feedTodayB} kg
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold flex justify-between">
            <span>Intake Delta:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {deltaFeed >= 0 ? `+${deltaFeed} kg` : `${deltaFeed} kg`}
            </span>
          </div>
        </div>

        {/* Water Used Delta */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            💧 Daily Water at Day {selectedDay}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-emerald-600 font-bold block">{batchA.name.split(' ')[0]}</span>
              <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-display">
                {waterTodayA} L
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-violet-600 font-bold block">{batchB.name.split(' ')[0]}</span>
              <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-display">
                {waterTodayB} L
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold flex justify-between">
            <span>Water Delta:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {deltaWater >= 0 ? `+${deltaWater} L` : `${deltaWater} L`}
            </span>
          </div>
        </div>
      </div>

      {/* DUAL WEIGHT CURVES COMPARISON CHART */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          Flock Growth Trajectory: {batchA.name} vs {batchB.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Day-by-day weight curve comparison from chick placement to harvest
        </p>
        <div className="h-72 sm:h-80">
          <Line
            data={weightChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: { color: isDark ? '#e2e8f0' : '#334155', font: { size: 11, weight: 600 } },
                },
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
                y: {
                  title: { display: true, text: 'Average Weight (g)', color: isDark ? '#94a3b8' : '#64748b' },
                  grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.6)' },
                  ticks: { color: isDark ? '#94a3b8' : '#64748b' },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
