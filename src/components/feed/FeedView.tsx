import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Wheat,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Truck,
  PackageCheck,
  Scale,
  Calendar,
  X,
} from 'lucide-react';
import {
  calculateFeedDaysRemaining,
  calculateFeedPerChickGrams,
  calculateFCR,
} from '../../utils/calculations';
import { FeedTrendChart } from '../common/Charts';
import { FeedDelivery } from '../../types';

interface FeedViewProps {
  onOpenDailyEntry: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onOpenDailyEntry }) => {
  const {
    activeBatch,
    dailyRecords,
    latestRecord,
    feedDeliveries,
    totalFeedStockKg,
    settings,
    addFeedRestock,
  } = useFarm();
  const { isDark } = useTheme();

  // Restock Feed Delivery Modal State
  const [showRestockModal, setShowRestockModal] = useState<boolean>(false);
  const [restockDate, setRestockDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState<string>('Godrej Agrovet Feed Mill');
  const [feedType, setFeedType] = useState<'Pre-Starter' | 'Starter' | 'Finisher'>('Starter');
  const [bagsCount, setBagsCount] = useState<string>('100');
  const [kgPerBag, setKgPerBag] = useState<string>('50');
  const [costPerKg, setCostPerKg] = useState<string>('40');
  const [invoice, setInvoice] = useState<string>('');
  const [restockNotes, setRestockNotes] = useState<string>('');

  if (!activeBatch || !latestRecord) {
    return <div className="p-8 text-center">No active batch data available.</div>;
  }

  // Calculations
  const currentLive = latestRecord.totalLiveBirds;
  const feedUsedToday = latestRecord.totalFeedUsedTodayKg;
  const feedPerChick = calculateFeedPerChickGrams(feedUsedToday, currentLive);

  const totalBatchFeedConsumedKg = dailyRecords.reduce((acc, r) => acc + r.totalFeedUsedTodayKg, 0);
  const totalFeedDeliveredKg = feedDeliveries.reduce((acc, d) => acc + d.quantityKg, 0);

  const feedDays = calculateFeedDaysRemaining(totalFeedStockKg, dailyRecords);

  const currentFCR = calculateFCR(
    totalBatchFeedConsumedKg,
    currentLive,
    latestRecord.overallAvgWeightGrams,
    activeBatch.initialChicks
  );

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bags = parseInt(bagsCount, 10) || 0;
    const kgBag = parseFloat(kgPerBag) || 50;
    const totalKg = bags * kgBag;

    if (totalKg <= 0) return;

    const delivery: FeedDelivery = {
      batchId: activeBatch.id,
      date: restockDate,
      supplier: supplier.trim() || 'Feed Mill',
      feedType,
      quantityKg: totalKg,
      bagsCount: bags,
      costPerKg: parseFloat(costPerKg) || undefined,
      invoiceNumber: invoice.trim() || undefined,
      notes: restockNotes.trim() || undefined,
    };

    await addFeedRestock(delivery);
    setShowRestockModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Wheat className="w-6 h-6 text-amber-500" />
            <span>Feed Management & Inventory Control</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Formula: Remaining Feed = Received − Used • Estimated Days = Stock / Avg Daily Usage
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowRestockModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>+ Log Feed Delivery</span>
          </button>
          <button
            onClick={onOpenDailyEntry}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            + Daily Record
          </button>
        </div>
      </div>

      {/* FEED STOCK STATUS ALERT BANNER */}
      <div
        className={`p-5 rounded-3xl border shadow-card flex items-start gap-4 ${
          feedDays.status === 'critical'
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-100'
            : feedDays.status === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-100'
            : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
        }`}
      >
        <div
          className={`p-3 rounded-2xl ${
            feedDays.status === 'critical'
              ? 'bg-rose-600 text-white'
              : feedDays.status === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {feedDays.status === 'critical' ? (
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          ) : feedDays.status === 'warning' ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">
              {feedDays.status === 'critical'
                ? '🔴 Feed Critically Low (< 2 Days Remaining)'
                : feedDays.status === 'warning'
                ? '🟡 Feed Getting Low (Reorder Recommended)'
                : '🟢 Feed Stock Sufficient'}
            </h3>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white/40 dark:bg-black/40">
              ~{feedDays.days} Days Remaining
            </span>
          </div>
          <p className="text-xs font-medium mt-1 leading-relaxed">
            Current feed balance is <strong>{totalFeedStockKg.toLocaleString()} kg</strong>. Based on your recent 3-day average consumption of <strong>{feedDays.avgDailyUsageKg} kg/day</strong>, feed will deplete in approximately <strong>{feedDays.days} days</strong>.
          </p>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Remaining Feed in Stock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Remaining Feed Stock
          </span>
          <div className="text-3xl font-extrabold font-display text-amber-600 dark:text-amber-400 mt-1">
            {totalFeedStockKg.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kg</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>~{Math.round(totalFeedStockKg / 50)} bags (50kg)</span>
            <span className="font-bold text-amber-600">~{feedDays.days} days left</span>
          </div>
        </div>

        {/* Feed Used Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Feed Used Today
          </span>
          <div className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            {feedUsedToday.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">kg</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Shed 1: {latestRecord.shed1.feedUsedKg} kg</span>
            <span>Shed 2: {latestRecord.shed2.feedUsedKg} kg</span>
          </div>
        </div>

        {/* Feed Per Chick */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Feed Consumption / Chick
          </span>
          <div className="text-3xl font-extrabold font-display text-indigo-600 dark:text-indigo-400 mt-1">
            {feedPerChick}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">g / bird / day</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>For {currentLive.toLocaleString()} live birds</span>
            <span className="text-emerald-600 font-semibold">Standard intake</span>
          </div>
        </div>

        {/* Feed Conversion Ratio (FCR) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Feed Conversion Ratio (FCR)
          </span>
          <div className="text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            {currentFCR}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>Total Feed: {totalBatchFeedConsumedKg.toLocaleString()} kg</span>
            <span className="font-semibold text-emerald-600">High Efficiency</span>
          </div>
        </div>
      </div>

      {/* FEED TREND CHART */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          Daily Feed Consumption Trend (Shed 1 vs Shed 2)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Tracking feed quantity distributed to each shed across all batch days
        </p>
        <div className="h-72 sm:h-80">
          <FeedTrendChart records={dailyRecords} isDark={isDark} />
        </div>
      </div>

      {/* INCOMING FEED DELIVERIES LOG */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500" />
              <span>Feed Shipments Received</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total received in batch: {totalFeedDeliveredKg.toLocaleString()} kg
            </p>
          </div>
          <button
            onClick={() => setShowRestockModal(true)}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            + Add New Shipment
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Delivery Date</th>
                <th className="p-3">Supplier / Mill</th>
                <th className="p-3">Feed Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Bags (50kg)</th>
                <th className="p-3">Cost / kg</th>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...feedDeliveries].reverse().map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{d.date}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{d.supplier}</td>
                  <td className="p-3">
                    <span className="font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {d.feedType}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                    {d.quantityKg.toLocaleString()} kg
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{d.bagsCount} bags</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {d.costPerKg ? `₹${d.costPerKg}` : '—'}
                  </td>
                  <td className="p-3 font-mono text-slate-500">{d.invoiceNumber || '—'}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate">{d.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK FEED MODAL */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Log Incoming Feed Shipment
                </h3>
              </div>
              <button
                onClick={() => setShowRestockModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={restockDate}
                  onChange={e => setRestockDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Feed Supplier / Mill
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  placeholder="e.g. Godrej Agrovet / Suguna Feeds"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Feed Stage Type
                  </label>
                  <select
                    value={feedType}
                    onChange={e => setFeedType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Pre-Starter">Pre-Starter (0-10 Days)</option>
                    <option value="Starter">Starter (11-24 Days)</option>
                    <option value="Finisher">Finisher (25+ Days)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bags Count (50 kg bags)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bagsCount}
                    onChange={e => setBagsCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cost per kg (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={costPerKg}
                    onChange={e => setCostPerKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice # / DC Number
                  </label>
                  <input
                    type="text"
                    value={invoice}
                    onChange={e => setInvoice(e.target.value)}
                    placeholder="INV-2026-XXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs flex justify-between font-semibold">
                <span>Total Shipment Weight:</span>
                <span className="text-amber-700 dark:text-amber-300">
                  {((parseInt(bagsCount, 10) || 0) * (parseFloat(kgPerBag) || 50)).toLocaleString()} kg
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                >
                  Save Feed Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
