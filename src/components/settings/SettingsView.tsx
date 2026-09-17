import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  Settings,
  Save,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { exportDatabaseToJson, importDatabaseFromJson } from '../../db/repository';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, addToast } = useFarm();

  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(form);
    setSaving(false);
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const json = await exportDatabaseToJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Venkateshwara_Farm_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      addToast({
        type: 'success',
        title: 'Backup Downloaded',
        message: 'Complete database export saved locally.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export database backup.',
      });
    }
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      const content = event.target?.result as string;
      const success = await importDatabaseFromJson(content);
      if (success) {
        window.location.reload();
      } else {
        addToast({
          type: 'error',
          title: 'Import Error',
          message: 'Invalid JSON backup format.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-500" />
          <span>Farm Configuration & Alert Thresholds</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Customize farm profile, shed capacities, water tank sizes, and decision support thresholds
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* FARM PROFILE SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Farm Identity & Location
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Farm Name
              </label>
              <input
                type="text"
                value={form.farmName}
                onChange={e => handleChange('farmName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Farmer / Owner Name
              </label>
              <input
                type="text"
                value={form.farmerName}
                onChange={e => handleChange('farmerName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Farm Location / Address
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* SHED INFRASTRUCTURE & TANK CAPACITIES */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Shed Capacity & Water Tank Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Shed 1 Specs */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-xs text-emerald-600 uppercase block">Shed 1 Unit</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Chick Capacity
                  </label>
                  <input
                    type="number"
                    value={form.shed1Capacity}
                    onChange={e => handleChange('shed1Capacity', parseInt(e.target.value, 10) || 6000)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tank Capacity (L)
                  </label>
                  <input
                    type="number"
                    value={form.shed1TankLiters}
                    onChange={e => handleChange('shed1TankLiters', parseInt(e.target.value, 10) || 1000)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Shed 2 Specs */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-xs text-green-600 uppercase block">Shed 2 Unit</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Chick Capacity
                  </label>
                  <input
                    type="number"
                    value={form.shed2Capacity}
                    onChange={e => handleChange('shed2Capacity', parseInt(e.target.value, 10) || 6000)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tank Capacity (L)
                  </label>
                  <input
                    type="number"
                    value={form.shed2TankLiters}
                    onChange={e => handleChange('shed2TankLiters', parseInt(e.target.value, 10) || 1000)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DECISION SUPPORT ALERT THRESHOLDS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Smart Decision Support Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ☠️ Daily Mortality Spike Trigger (%)
              </label>
              <input
                type="number"
                step="0.05"
                value={form.alertMortalityThresholdPercent}
                onChange={e => handleChange('alertMortalityThresholdPercent', parseFloat(e.target.value) || 0.25)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                🌾 Critical Feed Depletion (Days)
              </label>
              <input
                type="number"
                value={form.alertFeedRemainingDaysCritical}
                onChange={e => handleChange('alertFeedRemainingDaysCritical', parseInt(e.target.value, 10) || 2)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                💧 Critical Water Tank Level (%)
              </label>
              <input
                type="number"
                value={form.alertWaterLevelPercentCritical}
                onChange={e => handleChange('alertWaterLevelPercentCritical', parseInt(e.target.value, 10) || 15)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                🌡️ Maximum Safe Temp (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.alertTempMaxCelsius}
                onChange={e => handleChange('alertTempMaxCelsius', parseFloat(e.target.value) || 28.5)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                🌡️ Minimum Safe Temp (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.alertTempMinCelsius}
                onChange={e => handleChange('alertTempMinCelsius', parseFloat(e.target.value) || 20.0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ⚖️ Weight Lag Warning (grams)
              </label>
              <input
                type="number"
                value={form.alertWeightLagGrams}
                onChange={e => handleChange('alertWeightLagGrams', parseInt(e.target.value, 10) || 80)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings & Thresholds'}</span>
          </button>
        </div>
      </form>

      {/* DATABASE BACKUP, RESTORE & RESET */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Database Management & Backup
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          All farm data is stored permanently inside the browser’s encrypted IndexedDB storage.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Database Backup</span>
          </button>

          <label className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Restore JSON Backup</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            type="button"
            onClick={resetToDemoData}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900 transition-colors ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Realistic 28-day Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
