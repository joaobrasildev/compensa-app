// src/stores/useAppStore.ts
// Estado global do app (loading, ready, error, legal modal)

import { create } from 'zustand';

type AppState = {
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
    hasCache: boolean;
    legalVisible: boolean;
    setReady: () => void;
    setLoading: (v: boolean) => void;
    setError: (msg: string | null) => void;
    setHasCache: (v: boolean) => void;
    setLegalVisible: (v: boolean) => void;
};

export const useAppStore = create<AppState>()((set) => ({
    isReady: false,
    isLoading: true,
    error: null,
    hasCache: false,
    legalVisible: false,
    setReady: () => set({ isReady: true, isLoading: false }),
    setLoading: (v) => set({ isLoading: v }),
    setError: (msg) => set({ error: msg }),
    setHasCache: (v) => set({ hasCache: v }),
    setLegalVisible: (v) => set({ legalVisible: v }),
}));
