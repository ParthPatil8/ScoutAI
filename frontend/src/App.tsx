import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { PlayerDiscoveryScreen } from './components/players/PlayerDiscoveryScreen';
import { PlayerProfileScreen } from './components/profile/PlayerProfileScreen';
import { AssessmentWorkspace } from './components/assessment/AssessmentWorkspace';
import { PlayerComparisonScreen } from './components/compare/PlayerComparisonScreen';
import { ScoutWorkspace } from './components/scouting/ScoutWorkspace';
import { DatasetSystemScreen } from './components/datasets/DatasetSystemScreen';

const MainScreen: React.FC = () => {
  const { activeTab, openNewPlayerModal } = useApp();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardScreen onOpenNewPlayerModal={openNewPlayerModal} />;
    case 'players':
      return <PlayerDiscoveryScreen onOpenNewPlayerModal={openNewPlayerModal} />;
    case 'profile':
      return <PlayerProfileScreen />;
    case 'assessment':
      return <AssessmentWorkspace />;
    case 'compare':
      return <PlayerComparisonScreen />;
    case 'scouting':
      return <ScoutWorkspace />;
    case 'datasets':
      return <DatasetSystemScreen />;
    default:
      return <DashboardScreen onOpenNewPlayerModal={openNewPlayerModal} />;
  }
};

export function App() {
  return (
    <AppProvider>
      <AppLayout>
        <MainScreen />
      </AppLayout>
    </AppProvider>
  );
}

export default App;
