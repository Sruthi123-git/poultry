import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DailyFarmRecord } from '../../types';
import { getExpectedWeightForAge } from '../../utils/breedStandards';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeightGrowthChartProps {
  records: DailyFarmRecord[];
  breedName?: string;
  isDark?: boolean;
}

export const WeightGrowthChart: React.FC<WeightGrowthChartProps> = ({
  records,
  breedName = 'Vencobb 430Y',
  isDark = false,
}) => {
  const labels = records.map(r => `Day ${r.dayOfBatch}`);
  const actualWeights = records.map(r => r.overallAvgWeightGrams);
  const expectedWeights = records.map(r => getExpectedWeightForAge(r.dayOfBatch, breedName));

  const data = {
    labels,
    datasets: [
      {
        label: 'Actual Flock Weight (g)',
        data: actualWeights,
        borderColor: '#10b981', // Emerald
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      },
      {
        label: `Expected Standard Target (${breedName})`,
        data: expectedWeights,
        borderColor: isDark ? '#94a3b8' : '#64748b',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 11, weight: 600 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#0f172a',
        padding: 10,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw} g`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.6)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 10 },
          callback: (value: any) => `${value} g`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

interface MortalityTrendChartProps {
  records: DailyFarmRecord[];
  isDark?: boolean;
}

export const MortalityTrendChart: React.FC<MortalityTrendChartProps> = ({ records, isDark }) => {
  const labels = records.map(r => `D${r.dayOfBatch}`);
  const s1Deaths = records.map(r => r.shed1.deadChicks);
  const s2Deaths = records.map(r => r.shed2.deadChicks);
  const cumulative = records.map(r => r.cumulativeMortalityToDate);

  const data = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Shed 1 Dead',
        data: s1Deaths,
        backgroundColor: '#f43f5e', // Rose
        borderRadius: 4,
        stack: 'daily',
      },
      {
        type: 'bar' as const,
        label: 'Shed 2 Dead',
        data: s2Deaths,
        backgroundColor: '#fb7185', // Rose light
        borderRadius: 4,
        stack: 'daily',
      },
      {
        type: 'line' as const,
        label: 'Cumulative Mortality',
        data: cumulative,
        borderColor: '#e11d48',
        borderWidth: 2,
        pointRadius: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 11, weight: 600 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#0f172a',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Daily Dead', color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } },
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.6)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Total Cumulative', color: '#e11d48', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#e11d48' },
      },
    },
  };

  return <Bar data={data as any} options={options as any} />;
};

interface FeedTrendChartProps {
  records: DailyFarmRecord[];
  isDark?: boolean;
}

export const FeedTrendChart: React.FC<FeedTrendChartProps> = ({ records, isDark }) => {
  const labels = records.map(r => `D${r.dayOfBatch}`);
  const s1Feed = records.map(r => r.shed1.feedUsedKg);
  const s2Feed = records.map(r => r.shed2.feedUsedKg);

  const data = {
    labels,
    datasets: [
      {
        label: 'Shed 1 Feed (kg)',
        data: s1Feed,
        backgroundColor: '#eab308', // Amber
        borderRadius: 4,
      },
      {
        label: 'Shed 2 Feed (kg)',
        data: s2Feed,
        backgroundColor: '#ca8a04', // Darker Amber
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 11, weight: 600 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } },
      },
      y: {
        title: { display: true, text: 'Feed Used (kg)', color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } },
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.6)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

interface EnvironmentTrendChartProps {
  records: DailyFarmRecord[];
  isDark?: boolean;
}

export const EnvironmentTrendChart: React.FC<EnvironmentTrendChartProps> = ({ records, isDark }) => {
  const labels = records.map(r => `D${r.dayOfBatch}`);
  const s1Temp = records.map(r => r.shed1.temperatureCelsius);
  const s2Temp = records.map(r => r.shed2.temperatureCelsius);
  const s1Hum = records.map(r => r.shed1.humidityPercent);

  const data = {
    labels,
    datasets: [
      {
        label: 'Shed 1 Temp (°C)',
        data: s1Temp,
        borderColor: '#ef4444',
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Shed 2 Temp (°C)',
        data: s2Temp,
        borderColor: '#f97316',
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Humidity (%)',
        data: s1Hum,
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#334155',
          font: { size: 11, weight: 600 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Temperature (°C)', color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } },
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.6)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Humidity (%)', color: '#06b6d4', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#06b6d4' },
      },
    },
  };

  return <Line data={data} options={options as any} />;
};
