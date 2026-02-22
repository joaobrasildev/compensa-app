// src/types/projections.ts
// Tipos das projeções

export type ProjectionPeriod = '1y' | '5y' | '10y';

/** Projeção para um período específico */
export type Projection = {
    period: ProjectionPeriod;
    label: string;           // "1 ano", "5 anos", "10 anos"
    fixedIncome: number;     // Valor projetado RF
    fixedIncomeGain: number; // % ganho RF
    bitcoin: number;         // Valor projetado BTC
    bitcoinGain: number;     // % ganho BTC
    btcEquivalent: number;   // Quanto em BTC o valor equivale
};

/** CAGRs do Bitcoin para os 3 períodos */
export type CAGRs = {
    y1: number;
    y5: number;
    y10: number;
};

/** Dados para os pontos do gráfico de crescimento */
export type ChartDataPoint = {
    date: string;
    rfValue: number;
    btcValue: number;
};
