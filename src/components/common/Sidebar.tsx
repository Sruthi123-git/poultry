import React from 'react';
import {
  LayoutDashboard,
  Home,
  Skull,
  Wheat,
  Scale,
  CloudSun,
  Droplets,
  AlertOctagon,
  GitCompare,
  FolderKanban,
  History,
  FileText,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export type NavTab =
  | 'dashboard'
  | 'shed-1'
  | 'shed-2'
  | 'mortality'
  | 'feed'
  | 'weight'
  | 'environment'
  | 'water'
  | 'alerts'
  | 'comparison'
  | 'batches'
  | 'history'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { unacknowledgedAlertsCount, activeBatch, latestRecord } = useFarm();

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    section?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      section: 'Core Overview',
    },
    {
      id: 'shed-1',
      label: 'Shed 1 Management',
      icon: <Home className="w-4 h-4 text-emerald-500" />,
      badge: latestRecord ? `${latestRecord.shed1.deadChicks} dead today` : undefined,
      section: 'Shed Operations',
    },
    {
      id: 'shed-2',
      label: 'Shed 2 Management',
      icon: <Home className="w-4 h-4 text-emerald-500" />,
      badge: latestRecord ? `${latestRecord.shed2.deadChicks} dead today` : undefined,
    },
    {
      id: 'mortality',
      label: 'Chick Mortality',
      icon: <Skull className="w-4 h-4 text-rose-500" />,
      section: 'Flock Analytics',
    },
    {
      id: 'feed',
      label: 'Feed Management',
      icon: <Wheat className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'weight',
      label: 'Weight & Growth',
      icon: <Scale className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'environment',
      label: 'Weather & Fans',
      icon: <CloudSun className="w-4 h-4 text-cyan-500" />,
    },
    {
      id: 'water',
      label: 'Water Tanks (2)',
      icon: <Droplets className="w-4 h-4 text-sky-500" />,
    },
    {
      id: 'alerts',
      label: 'Smart Alert Center',
      icon: <AlertOctagon className="w-4 h-4 text-red-500" />,
      badge: unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      section: 'Decision Support',
    },
    {
      id: 'comparison',
      label: 'Batch Comparison',
      icon: <GitCompare className="w-4 h-4 text-violet-500" />,
    },
    {
      id: 'batches',
      label: 'Batch Lifecycle',
      icon: <FolderKanban className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'history',
      label: 'Farm History Log',
      icon: <History className="w-4 h-4 text-slate-500" />,
      section: 'Records & Reports',
    },
    {
      id: 'reports',
      label: 'Printable Reports',
      icon: <FileText className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'settings',
      label: 'Farm Settings',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
    },
  ];

  const handleItemClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-40 lg:z-10 h-full lg:h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐔</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Venkateshwara Farm</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Batch Summary Chip */}
        {activeBatch && (
          <div className="p-3 mx-3 mt-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Active Batch
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                Day {latestRecord?.dayOfBatch || 1}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
              {activeBatch.name}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              <span>{activeBatch.initialChicks.toLocaleString()} starting</span>
              <span>{activeBatch.breed}</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              {item.section && (
                <div className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 ${idx === 0 ? 'pb-1' : 'pt-3 pb-1'}`}>
                  {item.section}
                </div>
              )}
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  currentTab === item.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`${currentTab === item.id ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || (currentTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Venkateshwara Farm OS v2.4
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            2 Sheds • 12,000 Cap
          </p>
        </div>
      </aside>
    </>
  );
};
