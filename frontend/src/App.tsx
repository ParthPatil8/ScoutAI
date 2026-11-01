import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { PlayerDiscoveryScreen } from './components/players/PlayerDiscoveryScreen';
import { PlayerProfileScreen } from './components/profile/PlayerProfileScreen';
import { AssessmentWorkspace } from './components/assessment/AssessmentWorkspace';
import { PlayerComparisonScreen } from './components/compare/PlayerComparisonScreen';
import { ScoutWorkspace } from './components/scouting/ScoutWorkspace';
import { DatasetSystemScreen } from './components/datasets/DatasetSystemScreen';
import { PlayerPortalScreen } from './components/player-portal/PlayerPortalScreen';

const MainScreen: React.FC = () => {
  const { currentUser, activeTab, openNewPlayerModal } = useApp();

  // If not logged in, render the dedicated portal login screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Player Portal Routes
  if (currentUser.role === 'PLAYER') {
    switch (activeTab) {
      case 'player-portal':
      case 'player-technique':
      case 'player-progress':
        return <PlayerPortalScreen />;
      case 'player-upload':
      case 'assessment':
        return <AssessmentWorkspace />;
      default:
        return <PlayerPortalScreen />;
    }
  }

  // Scout & Coach Portal Routes
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

export function AppContent() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppLayout>
      <MainScreen />
    </AppLayout>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
