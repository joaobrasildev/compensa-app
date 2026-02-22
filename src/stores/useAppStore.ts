// src/stores/useAppStore.ts
// Estado global do app (loading, ready, error)

import { create } from 'zustand';

type AppState = {
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
    hasCache: boolean;
    setReady: () => void;
    setLoading: (v: boolean) => void;
    setError: (msg: string | null) => void;
    setHasCache: (v: boolean) => void;
};

export const useAppStore = create<AppState>()((set) => ({
    isReady: false,
    isLoading: true,
    error: null,
    hasCache: false,
    setReady: () => set({ isReady: true, isLoading: false }),
    setLoading: (v) => set({ isLoading: v }),
    setError: (msg) => set({ error: msg }),
    setHasCache: (v) => set({ hasCache: v }),
}));
