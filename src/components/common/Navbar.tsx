import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Bell,
  Sun,
  Moon,
  PlusCircle,
  LogOut,
  Layers,
  Menu,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

interface NavbarProps {
  onOpenDailyEntry: () => void;
  onToggleSidebar: () => void;
  onNavigateToAlerts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDailyEntry,
  onToggleSidebar,
  onNavigateToAlerts,
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const {
    activeBatch,
    batches,
    switchActiveBatch,
    unacknowledgedAlertsCount,
    resetToDemoData,
    settings,
  } = useFarm();

  const todayStr = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left: Mobile Menu & Farm Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white text-xl shadow-md shadow-emerald-600/20 shrink-0">
              🐔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  {settings.farmName || 'Venkateshwara Poultry Farm'}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live System
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Smart Poultry Farm Management & Decision Support
              </p>
            </div>
          </div>
        </div>

        {/* Center: Greeting & Date */}
        <div className="hidden xl:flex flex-col items-center justify-center">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>Welcome back, {user?.name ? user.name.split(' ')[0] : 'Farmer'}</span>
            <span className="text-base">👋</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{todayStr}</span>
        </div>

        {/* Right: Actions, Batch Selector, Theme, Alerts, Quick Add, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Batch Selector */}
          {batches.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <select
                value={activeBatch?.id || ''}
                onChange={e => switchActiveBatch(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
                aria-label="Select active batch"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id} className="dark:bg-slate-900">
                    {b.name} {b.status === 'active' ? '(Active)' : '(Archived)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Demo Reset Helper Button */}
          <button
            onClick={resetToDemoData}
            title="Reset realistic demo dataset"
            className="hidden md:flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[11px] font-medium">Reset Demo</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Alerts Bell */}
          <button
            onClick={onNavigateToAlerts}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Smart Farm Alerts"
            aria-label="View farm alerts"
          >
            <Bell className="w-4 h-4" />
            {unacknowledgedAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unacknowledgedAlertsCount}
              </span>
            )}
          </button>

          {/* Primary Action: Rapid Daily Entry Modal Trigger */}
          <button
            onClick={onOpenDailyEntry}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-sm shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">+ Add Today's Data</span>
            <span className="sm:hidden">+ Data</span>
          </button>

          {/* Logout button */}
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
