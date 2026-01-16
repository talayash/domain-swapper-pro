import type { StateCreator } from 'zustand';
import type { Settings } from '~/types';
import { DEFAULT_SETTINGS } from '~/types';

export interface SettingsSlice {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  settings: { ...DEFAULT_SETTINGS },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }));
  },

  resetSettings: () => {
    set(() => ({
      settings: { ...DEFAULT_SETTINGS }
    }));
  }
});
