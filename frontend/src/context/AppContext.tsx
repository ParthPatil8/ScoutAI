import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService, BackendStatus } from '../services/api';

export type ScreenTab = 
  | 'dashboard'
  | 'players'
  | 'profile'
  | 'assessment'
  | 'compare'
  | 'scouting'
  | 'datasets';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  selectedPlayerId: string;
  setSelectedPlayerId: (id: string) => void;
  comparePlayerIds: string[];
  setComparePlayerIds: React.Dispatch<React.SetStateAction<string[]>>;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  shortlistIds: string[];
  toggleShortlist: (id: string) => void;
  isShortlisted: (id: string) => boolean;
  backendStatus: BackendStatus;
  checkBackendStatus: () => Promise<void>;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  navigateToPlayer: (id: string) => void;
  navigateToAssessment: (playerId?: string) => void;
  navigateToCompare: (ids?: string[]) => void;
  isNewPlayerModalOpen: boolean;
  openNewPlayerModal: () => void;
  closeNewPlayerModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ScreenTab>('dashboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('p-arjun-verma');
  const [comparePlayerIds, setComparePlayerIds] = useState<string[]>(['p-arjun-verma', 'p-devendra-patel']);
  const [shortlistIds, setShortlistIds] = useState<string[]>(['p-arjun-verma', 'p-kabir-khan']);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({ isOnline: false });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isNewPlayerModalOpen, setIsNewPlayerModalOpen] = useState<boolean>(false);

  const openNewPlayerModal = () => setIsNewPlayerModalOpen(true);
  const closeNewPlayerModal = () => setIsNewPlayerModalOpen(false);

  const checkBackendStatus = async () => {
    const status = await ApiService.checkHealth();
    setBackendStatus(status);
  };

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const toggleShortlist = (id: string) => {
    setShortlistIds(prev => {
      const exists = prev.includes(id);
      if (exists) {
        addToast('Removed from Watchlist', 'Player removed from active shortlist', 'info');
        return prev.filter(item => item !== id);
      } else {
        addToast('Added to Watchlist', 'Player added to scout shortlist', 'success');
        return [...prev, id];
      }
    });
  };

  const isShortlisted = (id: string) => shortlistIds.includes(id);

  const addToCompare = (id: string) => {
    setComparePlayerIds(prev => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 3) {
        addToast('Comparison Limit', 'Maximum 3 players can be compared at once', 'warning');
        return prev;
      }
      addToast('Added to Comparison', 'Player added to side-by-side telemetry', 'info');
      return [...prev, id];
    });
  };

  const removeFromCompare = (id: string) => {
    setComparePlayerIds(prev => prev.filter(item => item !== id));
  };

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateToPlayer = (id: string) => {
    setSelectedPlayerId(id);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAssessment = (playerId?: string) => {
    if (playerId) setSelectedPlayerId(playerId);
    setActiveTab('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCompare = (ids?: string[]) => {
    if (ids && ids.length > 0) setComparePlayerIds(ids);
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedPlayerId,
        setSelectedPlayerId,
        comparePlayerIds,
        setComparePlayerIds,
        addToCompare,
        removeFromCompare,
        shortlistIds,
        toggleShortlist,
        isShortlisted,
        backendStatus,
        checkBackendStatus,
        isDemoMode,
        setIsDemoMode: (val) => {
          ApiService.setDemoMode(val);
          setIsDemoMode(val);
          checkBackendStatus();
        },
        toasts,
        addToast,
        removeToast,
        navigateToPlayer,
        navigateToAssessment,
        navigateToCompare,
        isNewPlayerModalOpen,
        openNewPlayerModal,
        closeNewPlayerModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
