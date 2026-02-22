// src/rules/projectionRules.ts
// Funções puras de projeção financeira. Sem dependência de React/Zustand/SQLite.

import type { Projection, CAGRs } from '@/types';

const PERIOD_CONFIG = [
    { period: '1y' as const, label: '1 ano', years: 1, cagrKey: 'y1' as const },
    { period: '5y' as const, label: '5 anos', years: 5, cagrKey: 'y5' as const },
    { period: '10y' as const, label: '10 anos', years: 10, cagrKey: 'y10' as const },
] as const;

/** Renda fixa: V = amount × (1 + rate)^years */
export function calculateFixedIncome(
    amount: number,
    annualRate: number,
    years: number,
): number {
    return amount * Math.pow(1 + annualRate / 100, years);
}

/** BTC: V = amount × (1 + cagr)^years */
export function calculateBitcoin(
    amount: number,
    cagr: number,
    years: number,
): number {
    return amount * Math.pow(1 + cagr / 100, years);
}

/** CAGR = (Vfinal / Vinicial)^(1/n) - 1 */
export function calculateCAGR(
    currentPrice: number,
    historicalPrice: number,
    years: number,
): number {
    if (historicalPrice <= 0 || years <= 0) return 0;
    return (Math.pow(currentPrice / historicalPrice, 1 / years) - 1) * 100;
}

/** Gera as 3 projeções completas (1y, 5y, 10y) */
export function calculateProjections(
    amount: number,
    fixedRate: number,
    btcPrice: number,
    cagrs: CAGRs,
): Projection[] {
    return PERIOD_CONFIG.map(({ period, label, years, cagrKey }) => {
        const rf = calculateFixedIncome(amount, fixedRate, years);
        const btc = calculateBitcoin(amount, cagrs[cagrKey], years);
        const btcEquivalent = btcPrice > 0 ? btc / btcPrice : 0;

        return {
            period,
            label,
            fixedIncome: rf,
            fixedIncomeGain: amount > 0 ? ((rf - amount) / amount) * 100 : 0,
            bitcoin: btc,
            bitcoinGain: amount > 0 ? ((btc - amount) / amount) * 100 : 0,
            btcEquivalent,
        };
    });
}

/** Valor atualizado RF de economia salva: amount × (1 + currentRate)^elapsedYears */
export function calculateCurrentFixedValue(
    amount: number,
    currentRate: number,
    savedAt: Date,
): number {
    const now = new Date();
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const elapsedYears = (now.getTime() - savedAt.getTime()) / msPerYear;
    if (elapsedYears <= 0) return amount;
    return calculateFixedIncome(amount, currentRate, elapsedYears);
}

/** Valor atualizado BTC: btcEquivalent × currentBtcPrice */
export function calculateCurrentBtcValue(
    btcEquivalentAtSave: number,
    currentBtcPrice: number,
): number {
    return btcEquivalentAtSave * currentBtcPrice;
}
