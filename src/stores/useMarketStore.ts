// src/stores/useMarketStore.ts
// Estado de mercado (BTC, SELIC, CAGRs)

import { create } from 'zustand';

type MarketData = {
    btcPrice: number;
    selicRate: number;
    cagr1y: number;
    cagr5y: number;
    cagr10y: number;
    lastFetchDate: string | null;
};

type MarketState = MarketData & {
    setMarketData: (data: Partial<MarketData>) => void;
    reset: () => void;
};

const INITIAL: MarketData = {
    btcPrice: 0,
    selicRate: 0,
    cagr1y: 0,
    cagr5y: 0,
    cagr10y: 0,
    lastFetchDate: null,
};

export const useMarketStore = create<MarketState>()((set) => ({
    ...INITIAL,
    setMarketData: (data) => set((state) => ({ ...state, ...data })),
    reset: () => set(INITIAL),
}));
