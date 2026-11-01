import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService, BackendStatus } from '../services/api';
import { AuthUser, UserRole } from '../types';

export type ScreenTab = 
  | 'dashboard'
  | 'players'
  | 'profile'
  | 'assessment'
  | 'compare'
  | 'scouting'
  | 'datasets'
  | 'player-portal'
  | 'player-technique'
  | 'player-upload'
  | 'player-progress';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: AuthUser | null;
  loginAsScout: () => void;
  loginAsPlayer: (playerId?: string) => void;
  loginCustom: (email: string, role: UserRole) => void;
  logout: () => void;
  switchPortal: () => void;
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
  // Auth state: initial null shows dedicated portal login screen
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('scoutai_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ScreenTab>(() => {
    return currentUser?.role === 'PLAYER' ? 'player-portal' : 'dashboard';
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('p-arjun-verma');
  const [comparePlayerIds, setComparePlayerIds] = useState<string[]>(['p-arjun-verma', 'p-devendra-patel']);
  const [shortlistIds, setShortlistIds] = useState<string[]>(['p-arjun-verma', 'p-kabir-khan']);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({ isOnline: false });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isNewPlayerModalOpen, setIsNewPlayerModalOpen] = useState<boolean>(false);

  // Sync auth state to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('scoutai_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('scoutai_user');
    }
  }, [currentUser]);

  const loginAsScout = () => {
    const scoutUser: AuthUser = {
      id: 'scout-1',
      name: 'Vikram Rathour',
      email: 'scout@scoutai.com',
      role: 'SCOUT',
      title: 'Chief Talent Scout',
      organization: 'National Cricket Academy',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    };
    setCurrentUser(scoutUser);
    setActiveTab('dashboard');
    addToast('Welcome, Coach Vikram', 'Signed in to Scout & Coach Command Hub', 'success');
  };

  const loginAsPlayer = (playerId: string = 'p-arjun-verma') => {
    const isKabir = playerId.includes('kabir');
    const playerUser: AuthUser = {
      id: playerId,
      name: isKabir ? 'Kabir Khan' : 'Arjun Verma',
      email: isKabir ? 'kabir@scoutai.com' : 'arjun@scoutai.com',
      role: 'PLAYER',
      title: isKabir ? 'Fast Bowler' : 'Top-Order Batsman',
      organization: isKabir ? 'State Development Squad' : 'National Cricket Academy U-19',
      playerId,
      avatarUrl: isKabir 
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' 
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    setCurrentUser(playerUser);
    setSelectedPlayerId(playerId);
    setActiveTab('player-portal');
    addToast(`Welcome, ${playerUser.name}`, 'Signed in to Player Performance Portal', 'success');
  };

  const loginCustom = (email: string, role: UserRole) => {
    if (role === 'SCOUT') {
      loginAsScout();
    } else {
      loginAsPlayer();
    }
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('Signed Out', 'You have been logged out of ScoutAI', 'info');
  };

  const switchPortal = () => {
    if (currentUser?.role === 'SCOUT') {
      loginAsPlayer();
    } else {
      loginAsScout();
    }
  };

  const openNewPlayerModal = () => setIsNewPlayerModalOpen(true);
  const closeNewPlayerModal = () => setIsNewPlayerModalOpen(false);

  const checkBackendStatus = async () => {
    const status = await ApiService.checkHealth();
    setBackendStatus(status);
  };

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 15000);
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
    setActiveTab(currentUser?.role === 'PLAYER' ? 'player-portal' : 'profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAssessment = (playerId?: string) => {
    if (playerId) setSelectedPlayerId(playerId);
    setActiveTab(currentUser?.role === 'PLAYER' ? 'player-upload' : 'assessment');
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
        currentUser,
        loginAsScout,
        loginAsPlayer,
        loginCustom,
        logout,
        switchPortal,
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
