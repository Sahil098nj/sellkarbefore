import { create } from 'zustand';

interface AppState {
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  isDarkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  appLoading: boolean;
  setAppLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  onboardingComplete: false,
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
  isDarkMode: false,
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  appLoading: true,
  setAppLoading: (loading) => set({ appLoading: loading }),
}));
