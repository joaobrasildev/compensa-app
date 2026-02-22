// src/types/market.ts
// Tipos de dados de mercado

/** Dados de Bitcoin retornados pelo serviço */
export type BtcData = {
    currentPrice: number;
    cagr1y: number;
    cagr5y: number;
    cagr10y: number;
};

/** Estado do mercado no Zustand */
export type MarketState = {
    btcPrice: number;
    selicRate: number;
    cagr1y: number;
    cagr5y: number;
    cagr10y: number;
    lastFetchDate: string | null;
    setMarketData: (data: Partial<Omit<MarketState, 'setMarketData' | 'reset'>>) => void;
    reset: () => void;
};

/** Entrada de cache de dados externos */
export type CacheEntry = {
    key: string;
    value: string;
    fetched_at: string;
};

/** Totais para os SummaryCards */
export type SummaryTotals = {
    totalSaved: number;
    investedProjection: number;
    investedGain: number;
    investedGainPercent: number;
    rfPortion: {
        count: number;
        totalSaved: number;
        projection: number;
    };
    btcPortion: {
        count: number;
        totalSaved: number;
        projection: number;
    };
};

/** Stats de disciplina */
export type DisciplineStats = {
    totalRecords: number;
    averagePerMonth: number;
    currentStreak: number;
    bestStreak: number;
    emoji: string;
};
