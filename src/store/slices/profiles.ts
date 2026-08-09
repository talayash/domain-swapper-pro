import type { StateCreator } from 'zustand';
import type { Profile, ProfileInput, ProfileDomainEntry } from '~/types';
import { v4 as uuidv4 } from 'uuid';

export interface ProfilesSlice {
  profiles: Profile[];
  addProfile: (input: ProfileInput) => Profile;
  updateProfile: (id: string, updates: Partial<ProfileInput>) => void;
  deleteProfile: (id: string) => void;
  addProfileEntry: (profileId: string, entry: Omit<ProfileDomainEntry, 'id' | 'order'>) => void;
  updateProfileEntry: (profileId: string, entryId: string, updates: Partial<Omit<ProfileDomainEntry, 'id' | 'order'>>) => void;
  removeProfileEntry: (profileId: string, entryId: string) => void;
  reorderProfileEntries: (profileId: string, orderedIds: string[]) => void;
}

export const createProfilesSlice: StateCreator<ProfilesSlice, [], [], ProfilesSlice> = (set) => ({
  profiles: [],

  addProfile: (input) => {
    const newProfile: Profile = {
      id: uuidv4(),
      name: input.name.trim(),
      description: input.description?.trim(),
      entries: input.entries.map((entry, index) => ({
        ...entry,
        id: uuidv4(),
        url: entry.url.trim().replace(/\/+$/, ''),
        label: entry.label?.trim(),
        order: index,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      profiles: [...state.profiles, newProfile],
    }));

    return newProfile;
  },

  updateProfile: (id, updates) => {
    set((state) => ({
      profiles: state.profiles.map((profile) => {
        if (profile.id !== id) return profile;

        const updatedProfile: Profile = {
          ...profile,
          updatedAt: Date.now(),
        };

        if (updates.name !== undefined) {
          updatedProfile.name = updates.name.trim();
        }
        if (updates.description !== undefined) {
          updatedProfile.description = updates.description?.trim();
        }
        if (updates.entries !== undefined) {
          updatedProfile.entries = updates.entries.map((entry, index) => ({
            ...entry,
            id: uuidv4(),
            url: entry.url.trim().replace(/\/+$/, ''),
            label: entry.label?.trim(),
            order: index,
          }));
        }

        return updatedProfile;
      }),
    }));
  },

  deleteProfile: (id) => {
    set((state) => ({
      profiles: state.profiles.filter((profile) => profile.id !== id),
    }));
  },

  addProfileEntry: (profileId, entry) => {
    set((state) => ({
      profiles: state.profiles.map((profile) => {
        if (profile.id !== profileId) return profile;
        const maxOrder = profile.entries.length > 0
          ? Math.max(...profile.entries.map((e) => e.order))
          : -1;
        return {
          ...profile,
          entries: [
            ...profile.entries,
            {
              ...entry,
              id: uuidv4(),
              url: entry.url.trim().replace(/\/+$/, ''),
              label: entry.label?.trim(),
              order: maxOrder + 1,
            },
          ],
          updatedAt: Date.now(),
        };
      }),
    }));
  },

  updateProfileEntry: (profileId, entryId, updates) => {
    set((state) => ({
      profiles: state.profiles.map((profile) => {
        if (profile.id !== profileId) return profile;
        return {
          ...profile,
          entries: profile.entries.map((entry) => {
            if (entry.id !== entryId) return entry;
            return {
              ...entry,
              ...updates,
              url: updates.url ? updates.url.trim().replace(/\/+$/, '') : entry.url,
              label: updates.label !== undefined ? updates.label?.trim() : entry.label,
            };
          }),
          updatedAt: Date.now(),
        };
      }),
    }));
  },

  removeProfileEntry: (profileId, entryId) => {
    set((state) => ({
      profiles: state.profiles.map((profile) => {
        if (profile.id !== profileId) return profile;
        return {
          ...profile,
          entries: profile.entries.filter((e) => e.id !== entryId),
          updatedAt: Date.now(),
        };
      }),
    }));
  },

  reorderProfileEntries: (profileId, orderedIds) => {
    set((state) => ({
      profiles: state.profiles.map((profile) => {
        if (profile.id !== profileId) return profile;
        return {
          ...profile,
          entries: profile.entries.map((entry) => {
            const newOrder = orderedIds.indexOf(entry.id);
            if (newOrder === -1) return entry;
            return { ...entry, order: newOrder };
          }),
          updatedAt: Date.now(),
        };
      }),
    }));
  },
});
