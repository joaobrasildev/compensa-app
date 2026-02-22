// src/types/savings.ts
// Tipos das economias

/** Registro de economia salvo no SQLite */
export type Saving = {
    id: number;
    amount: number;
    description: string;
    investment_type: 'RF' | 'BTC';
    fixed_rate_at_save: number;
    selic_at_save: number;
    btc_price_at_save: number;
    btc_equivalent: number;
    cagr_1y_at_save: number | null;
    cagr_5y_at_save: number | null;
    cagr_10y_at_save: number | null;
    proj_1y_rf: number | null;
    proj_5y_rf: number | null;
    proj_10y_rf: number | null;
    proj_1y_btc: number | null;
    proj_5y_btc: number | null;
    proj_10y_btc: number | null;
    created_at: string;
};

/** Dados para inserção de nova economia (sem id e created_at) */
export type NewSaving = Omit<Saving, 'id' | 'created_at'>;

/** Saving enriquecido com projeções atualizadas (para exibição no Histórico) */
export type EnrichedSaving = Saving & {
    currentFixedValue: number;
    currentFixedGainPercent: number;
    currentBtcValue: number;
    currentBtcGainPercent: number;
};
