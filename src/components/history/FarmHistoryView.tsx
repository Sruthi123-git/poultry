import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  History,
  Search,
  Download,
  Filter,
  Calendar,
  Layers,
  FileSpreadsheet,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { DailyFarmRecord } from '../../types';

export const FarmHistoryView: React.FC = () => {
  const { activeBatch, dailyRecords, batches } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShed, setFilterShed] = useState<'all' | 'shed-1' | 'shed-2'>('all');
  const [filterMetric, setFilterMetric] = useState<string>('all');

  const filteredRecords = dailyRecords
    .filter(r => {
      const matchSearch =
        r.date.includes(searchTerm) ||
        `day ${r.dayOfBatch}`.includes(searchTerm.toLowerCase()) ||
        (r.shed1.notes && r.shed1.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.shed2.notes && r.shed2.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    })
    .reverse();

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'Batch',
      'Day',
      'Date',
      'Shed 1 Dead',
      'Shed 1 Feed (kg)',
      'Shed 1 Weight (g)',
      'Shed 1 Water Level (L)',
      'Shed 1 Temp (C)',
      'Shed 1 Humidity (%)',
      'Shed 2 Dead',
      'Shed 2 Feed (kg)',
      'Shed 2 Weight (g)',
      'Shed 2 Water Level (L)',
      'Shed 2 Temp (C)',
      'Shed 2 Humidity (%)',
      'Total Mortality Today',
      'Cumulative Mortality',
      'Total Live Birds',
      'Total Feed Used (kg)',
      'Avg Weight (g)',
      'Total Water Used (L)',
    ];

    const rows = filteredRecords.map(r => [
      activeBatch?.name || '',
      r.dayOfBatch,
      r.date,
      r.shed1.deadChicks,
      r.shed1.feedUsedKg,
      r.shed1.sampleAvgWeightGrams,
      r.shed1.waterLevelLiters,
      r.shed1.temperatureCelsius,
      r.shed1.humidityPercent,
      r.shed2.deadChicks,
      r.shed2.feedUsedKg,
      r.shed2.sampleAvgWeightGrams,
      r.shed2.waterLevelLiters,
      r.shed2.temperatureCelsius,
      r.shed2.humidityPercent,
      r.totalMortalityToday,
      r.cumulativeMortalityToDate,
      r.totalLiveBirds,
      r.totalFeedUsedTodayKg,
      r.overallAvgWeightGrams,
      r.totalWaterUsedTodayLiters,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Venkateshwara_Farm_History_${activeBatch?.name || 'Batch'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-slate-500" />
            <span>Farm History & Telemetry Logs</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Searchable, chronological ledger of all mortality, feed, weight, water, and environmental observations
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export CSV Spreadsheet</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search date, day, or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <select
            value={filterShed}
            onChange={e => setFilterShed(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Both Sheds (1 & 2)</option>
            <option value="shed-1">Shed 1 Only</option>
            <option value="shed-2">Shed 2 Only</option>
          </select>

          <span className="text-xs text-slate-500 font-medium">
            {filteredRecords.length} records found
          </span>
        </div>
      </div>

      {/* MASTER HISTORY LOG TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Day / Date</th>
                <th className="p-3">Live Chicks</th>
                <th className="p-3">Dead Today</th>
                <th className="p-3">Feed Used</th>
                <th className="p-3">Flock Weight</th>
                <th className="p-3">Water Used</th>
                <th className="p-3">Avg Temp / RH</th>
                <th className="p-3">Observations / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map(r => (
                <tr key={r.date} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    Day {r.dayOfBatch}
                    <span className="text-[10px] text-slate-400 block font-normal">{r.date}</span>
                  </td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {r.totalLiveBirds.toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">
                    {r.totalMortalityToday} <span className="text-[10px] text-slate-400 font-normal">({r.shed1.deadChicks} / {r.shed2.deadChicks})</span>
                  </td>
                  <td className="p-3 text-amber-600 font-semibold">
                    {r.totalFeedUsedTodayKg} kg
                  </td>
                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                    {r.overallAvgWeightGrams} g
                  </td>
                  <td className="p-3 text-sky-600 font-semibold">
                    {r.totalWaterUsedTodayLiters} L
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {r.avgTemperatureCelsius}°C / {r.avgHumidityPercent}%
                  </td>
                  <td className="p-3 text-slate-500 max-w-xs truncate">
                    {r.shed1.notes || r.shed2.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
