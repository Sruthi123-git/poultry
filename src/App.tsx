import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FarmProvider, useFarm } from './context/FarmContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { DailyEntryModal } from './components/dailyEntry/DailyEntryModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ShedDetailView } from './components/sheds/ShedDetailView';
import { MortalityView } from './components/mortality/MortalityView';
import { FeedView } from './components/feed/FeedView';
import { WeightView } from './components/weight/WeightView';
import { EnvironmentView } from './components/environment/EnvironmentView';
import { WaterTankView } from './components/water/WaterTankView';
import { AlertsView } from './components/alerts/AlertsView';
import { BatchComparisonView } from './components/comparison/BatchComparisonView';
import { BatchManagementView } from './components/batches/BatchManagementView';
import { FarmHistoryView } from './components/history/FarmHistoryView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainAppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { loading } = useFarm();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDailyEntryOpen, setIsDailyEntryOpen] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl animate-bounce shadow-lg shadow-emerald-600/30">
          🐔
        </div>
        <h2 className="text-xl font-bold mt-4 font-display">Venkateshwara Poultry Farm</h2>
        <p className="text-xs text-emerald-400 mt-1">Initializing persistent farm database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenDailyEntry={() => setIsDailyEntryOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onNavigateToAlerts={() => setCurrentTab('alerts')}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={tab => setCurrentTab(tab)}
              onOpenDailyEntry={() => setIsDailyEntryOpen(true)}
            />
          )}

          {currentTab === 'shed-1' && (
            <ShedDetailView
              shedId="shed-1"
              onBackToDashboard={() => setCurrentTab('dashboard')}
              onOpenDailyEntry={() => setIsDailyEntryOpen(true)}
            />
          )}

          {currentTab === 'shed-2' && (
            <ShedDetailView
              shedId="shed-2"
              onBackToDashboard={() => setCurrentTab('dashboard')}
              onOpenDailyEntry={() => setIsDailyEntryOpen(true)}
            />
          )}

          {currentTab === 'mortality' && (
            <MortalityView onOpenDailyEntry={() => setIsDailyEntryOpen(true)} />
          )}

          {currentTab === 'feed' && (
            <FeedView onOpenDailyEntry={() => setIsDailyEntryOpen(true)} />
          )}

          {currentTab === 'weight' && (
            <WeightView onOpenDailyEntry={() => setIsDailyEntryOpen(true)} />
          )}

          {currentTab === 'environment' && (
            <EnvironmentView onOpenDailyEntry={() => setIsDailyEntryOpen(true)} />
          )}

          {currentTab === 'water' && (
            <WaterTankView onOpenDailyEntry={() => setIsDailyEntryOpen(true)} />
          )}

          {currentTab === 'alerts' && <AlertsView />}

          {currentTab === 'comparison' && <BatchComparisonView />}

          {currentTab === 'batches' && <BatchManagementView />}

          {currentTab === 'history' && <FarmHistoryView />}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Rapid Daily Entry Modal */}
      <DailyEntryModal
        isOpen={isDailyEntryOpen}
        onClose={() => setIsDailyEntryOpen(false)}
      />

      {/* Global Toast Notifications Stack */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FarmProvider>
          <MainAppLayout />
        </FarmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
