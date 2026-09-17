import React from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Wheat,
  Skull,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  calculateCumulativeMortalityRate,
  calculateSurvivalRate,
  calculateFCR,
  calculateWeightDifference,
} from '../../utils/calculations';
import { getExpectedWeightForAge } from '../../utils/breedStandards';

export const ReportsView: React.FC = () => {
  const { activeBatch, latestRecord, dailyRecords, previousBatch, settings, alerts } = useFarm();

  if (!activeBatch || !latestRecord) {
    return <div className="p-8 text-center">No batch records to report.</div>;
  }

  const currentDateStr = format(new Date(), 'dd MMMM yyyy, hh:mm a');
  const startingChicks = activeBatch.initialChicks;
  const currentLive = latestRecord.totalLiveBirds;
  const cumulativeDead = latestRecord.cumulativeMortalityToDate;
  const mortalityPercent = calculateCumulativeMortalityRate(cumulativeDead, startingChicks);
  const survivalPercent = calculateSurvivalRate(cumulativeDead, startingChicks);

  const totalFeedKg = dailyRecords.reduce((acc, r) => acc + r.totalFeedUsedTodayKg, 0);
  const totalWaterL = dailyRecords.reduce((acc, r) => acc + r.totalWaterUsedTodayLiters, 0);

  const expectedWeight = getExpectedWeightForAge(latestRecord.dayOfBatch, activeBatch.breed);
  const weightDiff = calculateWeightDifference(latestRecord.overallAvgWeightGrams, expectedWeight);

  const fcr = calculateFCR(
    totalFeedKg,
    currentLive,
    latestRecord.overallAvgWeightGrams,
    startingChicks
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Print Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Farm Performance & Health Report</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Executive broiler performance summary, growth analytics, biosecurity compliance, and batch audits
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="print-container bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        {/* Farm Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-emerald-600">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-md">
              🐔
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                {settings.farmName || 'Venkateshwara Poultry Farm'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {settings.location} • Ph: {settings.phone}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                Broiler Production & Quality Decision Support System
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              EXECUTIVE FARM REPORT
            </span>
            <span>Generated: {currentDateStr}</span>
            <span className="block mt-0.5">Report ID: VPF-RPT-{latestRecord.date}</span>
          </div>
        </div>

        {/* Batch Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Flock Batch</span>
            <strong className="text-sm text-slate-900 dark:text-white">{activeBatch.name}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Breed Standard</span>
            <strong className="text-sm text-slate-900 dark:text-white">{activeBatch.breed}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Placement Date</span>
            <strong className="text-sm text-slate-900 dark:text-white">{activeBatch.startDate}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Age</span>
            <strong className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">
              Day {latestRecord.dayOfBatch} of {activeBatch.targetHarvestAgeDays}
            </strong>
          </div>
        </div>

        {/* PRIMARY PERFORMANCE SCORECARD */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
            1. Key Performance Indicators (Flock Health & Growth)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <span className="text-xs text-slate-500 block">Live Chicks</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-display mt-1">
                {currentLive.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">of {startingChicks.toLocaleString()} starting</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <span className="text-xs text-slate-500 block">Survival %</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-display mt-1">
                {survivalPercent}%
              </div>
              <span className="text-[11px] text-slate-500">Mortality: {mortalityPercent}% ({cumulativeDead} dead)</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <span className="text-xs text-slate-500 block">Flock Avg Weight</span>
              <div className="text-2xl font-extrabold text-indigo-600 font-display mt-1">
                {latestRecord.overallAvgWeightGrams} g
              </div>
              <span className="text-[11px] text-slate-500">Target: {expectedWeight}g ({weightDiff.diffGrams >= 0 ? `+${weightDiff.diffGrams}g` : `${weightDiff.diffGrams}g`})</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <span className="text-xs text-slate-500 block">Feed Conversion (FCR)</span>
              <div className="text-2xl font-extrabold text-amber-600 font-display mt-1">
                {fcr}
              </div>
              <span className="text-[11px] text-slate-500">Total Feed: {totalFeedKg.toLocaleString()} kg</span>
            </div>
          </div>
        </div>

        {/* SHED 1 & SHED 2 BREAKDOWN TABLE */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
            2. Shed-Specific Telemetry & Compliance
          </h3>
          <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-700 dark:text-slate-200">
              <tr>
                <th className="p-3">Shed Unit</th>
                <th className="p-3">Starting Birds</th>
                <th className="p-3">Dead Today</th>
                <th className="p-3">Feed Today</th>
                <th className="p-3">Sample Weight</th>
                <th className="p-3">Water Level</th>
                <th className="p-3">Temp / RH</th>
                <th className="p-3">Fan Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">SHED 1</td>
                <td className="p-3">{activeBatch.shed1StartingChicks.toLocaleString()}</td>
                <td className="p-3 font-semibold text-rose-600">{latestRecord.shed1.deadChicks}</td>
                <td className="p-3">{latestRecord.shed1.feedUsedKg} kg</td>
                <td className="p-3 font-bold">{latestRecord.shed1.sampleAvgWeightGrams} g</td>
                <td className="p-3">{latestRecord.shed1.waterLevelLiters} L / {settings.shed1TankLiters}L</td>
                <td className="p-3">{latestRecord.shed1.temperatureCelsius}°C / {latestRecord.shed1.humidityPercent}%</td>
                <td className="p-3 font-bold text-rose-600">
                  {latestRecord.shed1.temperatureCelsius > settings.alertTempMaxCelsius ? 'ON (High Temp)' : 'OFF'}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">SHED 2</td>
                <td className="p-3">{activeBatch.shed2StartingChicks.toLocaleString()}</td>
                <td className="p-3 font-semibold text-rose-600">{latestRecord.shed2.deadChicks}</td>
                <td className="p-3">{latestRecord.shed2.feedUsedKg} kg</td>
                <td className="p-3 font-bold">{latestRecord.shed2.sampleAvgWeightGrams} g</td>
                <td className="p-3">{latestRecord.shed2.waterLevelLiters} L / {settings.shed2TankLiters}L</td>
                <td className="p-3">{latestRecord.shed2.temperatureCelsius}°C / {latestRecord.shed2.humidityPercent}%</td>
                <td className="p-3 font-bold text-emerald-600">
                  {latestRecord.shed2.temperatureCelsius > settings.alertTempMaxCelsius ? 'ON' : 'OFF (Normal)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ACTIVE ALERTS AUDIT SUMMARY */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
            3. Smart Decision Support & Required Actions
          </h3>
          {alerts.length === 0 ? (
            <p className="text-xs text-emerald-600 font-medium p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
              ✅ No critical anomalies detected. All flock parameters meet biosecurity standards.
            </p>
          ) : (
            <div className="space-y-2">
              {alerts.map(a => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs flex items-start gap-2"
                >
                  <span className="font-bold shrink-0">{a.severity === 'critical' ? '🔴 CRITICAL:' : '🟡 WARNING:'}</span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">[{a.shedName}] {a.title}:</span>{' '}
                    <span>{a.problem}</span>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                      Action: {a.recommendedAction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signatures & Certification */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Farm Supervisor / Technician</p>
            <div className="w-48 border-b border-slate-300 dark:border-slate-700 mt-8 mb-1"></div>
            <span>Signature & Stamp</span>
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-900 dark:text-white">Authorized Signatory</p>
            <div className="w-48 border-b border-slate-300 dark:border-slate-700 mt-8 mb-1 ml-auto"></div>
            <span>Venkateshwara Poultry Farm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
