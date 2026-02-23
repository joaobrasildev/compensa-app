// src/stores/useAppStore.ts
// Estado global do app (loading, ready, error, legal modal)

import { create } from 'zustand';

type DataSource = 'live' | 'cache' | 'fallback';

type AppState = {
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
    hasCache: boolean;
    dataSource: DataSource;
    legalVisible: boolean;
    toastVisible: boolean;
    toastMessage: string;
    toastSub: string;
    setReady: () => void;
    setLoading: (v: boolean) => void;
    setError: (msg: string | null) => void;
    setHasCache: (v: boolean) => void;
    setDataSource: (source: DataSource) => void;
    setLegalVisible: (v: boolean) => void;
    showToast: (msg: string, sub?: string) => void;
    hideToast: () => void;
};

export const useAppStore = create<AppState>()((set) => ({
    isReady: false,
    isLoading: true,
    error: null,
    hasCache: false,
    dataSource: 'live' as DataSource,
    legalVisible: false,
    toastVisible: false,
    toastMessage: '',
    toastSub: '',
    setReady: () => set({ isReady: true, isLoading: false }),
    setLoading: (v) => set({ isLoading: v }),
    setError: (msg) => set({ error: msg }),
    setHasCache: (v) => set({ hasCache: v }),
    setDataSource: (source) => set({ dataSource: source }),
    setLegalVisible: (v) => set({ legalVisible: v }),
    showToast: (msg, sub = '') => set({ toastVisible: true, toastMessage: msg, toastSub: sub }),
    hideToast: () => set({ toastVisible: false, toastMessage: '', toastSub: '' }),
}));
