import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Fan,
  Wind,
  Cpu,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { evaluateFanRecommendation } from '../../utils/calculations';
import { EnvironmentTrendChart } from '../common/Charts';

interface EnvironmentViewProps {
  onOpenDailyEntry: () => void;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ onOpenDailyEntry }) => {
  const { activeBatch, latestRecord, dailyRecords, settings } = useFarm();
  const { isDark } = useTheme();

  // Mode simulator toggle: IoT Live Sensor vs Manual Farm Entry
  const [telemetryMode, setTelemetryMode] = useState<'manual' | 'iot_simulation'>('manual');

  if (!activeBatch || !latestRecord) {
    return <div className="p-8 text-center">No batch data available.</div>;
  }

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

  // Heat Index Calculation (Temperature + Humidity discomfort indicator)
  const calculateHeatIndex = (temp: number, hum: number) => {
    return Number((temp + (hum * 0.1)).toFixed(1));
  };

  const s1HeatIndex = calculateHeatIndex(latestRecord.shed1.temperatureCelsius, latestRecord.shed1.humidityPercent);
  const s2HeatIndex = calculateHeatIndex(latestRecord.shed2.temperatureCelsius, latestRecord.shed2.humidityPercent);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Telemetry Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-cyan-500" />
            <span>Environment & Fan Recommendation System</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time thermal comfort monitoring, Heat Index, and actionable ventilation advisory
          </p>
        </div>

        {/* Telemetry Switch: Manual vs IoT Simulator */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setTelemetryMode('manual')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              telemetryMode === 'manual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Farmer Manual Entry</span>
          </button>
          <button
            onClick={() => setTelemetryMode('iot_simulation')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              telemetryMode === 'iot_simulation'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>IoT Sensor Simulator</span>
          </button>
        </div>
      </div>

      {/* PRODUCT PRINCIPLE CALLOUT BANNER */}
      <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-950 dark:text-cyan-200 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Decision Support Principle:</strong> This system evaluates ambient temperature and humidity against bird age thresholds to recommend <strong>Fan Status (ON / OFF)</strong>. Physical switches are controlled manually by the farmer until hardware IoT controllers are connected.
        </div>
      </div>

      {/* AMBIENT WEATHER OVERVIEW */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-slate-50 dark:from-cyan-950/40 dark:to-slate-900 border border-cyan-200 dark:border-cyan-900 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner">
              ☀️
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ambient Outside Weather
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
                31.5°C • Mostly Sunny
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Location: {settings.location} • Wind: 8 km/h NW • Outside Humidity: 58%
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDailyEntry}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md"
          >
            + Update Weather / Temp
          </button>
        </div>
      </div>

      {/* SHED 1 & SHED 2 ENVIRONMENT & FAN ADVISORY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHED 1 ENVIRONMENT */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                S1
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">SHED 1 Environment</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data source: {telemetryMode === 'manual' ? 'Manual Daily Entry' : 'Wireless Sensor Node #1'}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                s1Fan.recommendedFan === 'ON'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              }`}
            >
              {s1Fan.recommendedFan === 'ON' ? '🔴 High Temp Alert' : '🟢 Optimal'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-900 dark:text-rose-300 uppercase block">
                Temperature
              </span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-display mt-1">
                {latestRecord.shed1.temperatureCelsius}°C
              </div>
              <span className="text-[10px] text-slate-500">Max limit: {settings.alertTempMaxCelsius}°C</span>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900">
              <span className="text-[10px] font-bold text-cyan-900 dark:text-cyan-300 uppercase block">
                Humidity
              </span>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-display mt-1">
                {latestRecord.shed1.humidityPercent}%
              </div>
              <span className="text-[10px] text-slate-500">Max: {settings.alertHumidityMaxPercent}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase block">
                Heat Index
              </span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-display mt-1">
                {s1HeatIndex}
              </div>
              <span className="text-[10px] text-slate-500">Thermal load</span>
            </div>
          </div>

          {/* Recommended Fan Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              s1Fan.recommendedFan === 'ON'
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
            }`}
          >
            <div
              className={`p-3 rounded-xl shrink-0 ${
                s1Fan.recommendedFan === 'ON' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              <Fan className={`w-6 h-6 ${s1Fan.recommendedFan === 'ON' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Recommended Fan Status:
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    s1Fan.recommendedFan === 'ON' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {s1Fan.recommendedFan}
                </span>
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed">{s1Fan.message}</p>
            </div>
          </div>
        </div>

        {/* SHED 2 ENVIRONMENT */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-green-600 text-white font-bold text-xs flex items-center justify-center">
                S2
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">SHED 2 Environment</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data source: {telemetryMode === 'manual' ? 'Manual Daily Entry' : 'Wireless Sensor Node #2'}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                s2Fan.recommendedFan === 'ON'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              }`}
            >
              {s2Fan.recommendedFan === 'ON' ? '🔴 High Temp Alert' : '🟢 Optimal'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-900 dark:text-rose-300 uppercase block">
                Temperature
              </span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-display mt-1">
                {latestRecord.shed2.temperatureCelsius}°C
              </div>
              <span className="text-[10px] text-slate-500">Max limit: {settings.alertTempMaxCelsius}°C</span>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900">
              <span className="text-[10px] font-bold text-cyan-900 dark:text-cyan-300 uppercase block">
                Humidity
              </span>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-display mt-1">
                {latestRecord.shed2.humidityPercent}%
              </div>
              <span className="text-[10px] text-slate-500">Max: {settings.alertHumidityMaxPercent}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase block">
                Heat Index
              </span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-display mt-1">
                {s2HeatIndex}
              </div>
              <span className="text-[10px] text-slate-500">Thermal load</span>
            </div>
          </div>

          {/* Recommended Fan Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              s2Fan.recommendedFan === 'ON'
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
            }`}
          >
            <div
              className={`p-3 rounded-xl shrink-0 ${
                s2Fan.recommendedFan === 'ON' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              <Fan className={`w-6 h-6 ${s2Fan.recommendedFan === 'ON' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Recommended Fan Status:
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    s2Fan.recommendedFan === 'ON' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {s2Fan.recommendedFan}
                </span>
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed">{s2Fan.message}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ENVIRONMENT TREND CHART */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          Flock Micro-Climate History (Temperature & Humidity Trends)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Tracking thermal variations between Shed 1 and Shed 2 across batch life
        </p>
        <div className="h-72 sm:h-80">
          <EnvironmentTrendChart records={dailyRecords} isDark={isDark} />
        </div>
      </div>
    </div>
  );
};
