// src/rules/savingsRules.ts
// Funções puras de economia. Sem dependência de React/Zustand/SQLite.

import type {
    Saving,
    NewSaving,
    EnrichedSaving,
    CAGRs,
    SummaryTotals,
    ChartDataPoint,
} from '@/types';
import {
    calculateFixedIncome,
    calculateProjections,
    calculateCurrentFixedValue,
    calculateCurrentBtcValue,
} from './projectionRules';

/** Capitaliza apenas a primeira letra da string */
export function capitalizeFirst(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Valida dados antes de salvar */
export function validateSaving(
    amount: number,
    btcPrice: number,
    description: string,
    investmentType: string,
): { valid: boolean; error?: string } {
    if (amount <= 0) return { valid: false, error: 'Valor deve ser maior que zero.' };
    if (btcPrice <= 0) return { valid: false, error: 'Preço do BTC indisponível.' };
    if (description.trim().length === 0)
        return { valid: false, error: 'Descrição não pode estar vazia.' };
    if (investmentType !== 'RF' && investmentType !== 'BTC')
        return { valid: false, error: 'Tipo de investimento inválido.' };
    return { valid: true };
}

/** Constrói objeto NewSaving para inserção */
export function buildNewSaving(
    amount: number,
    description: string,
    investmentType: 'RF' | 'BTC',
    fixedRate: number,
    btcPrice: number,
    selicRate: number,
    cagrs: CAGRs,
): NewSaving {
    const projections = calculateProjections(amount, fixedRate, btcPrice, cagrs);
    const p1 = projections[0]!; // 1y
    const p5 = projections[1]!; // 5y
    const p10 = projections[2]!; // 10y

    return {
        amount,
        description: description.trim(),
        investment_type: investmentType,
        fixed_rate_at_save: fixedRate,
        selic_at_save: selicRate,
        btc_price_at_save: btcPrice,
        btc_equivalent: btcPrice > 0 ? amount / btcPrice : 0,
        cagr_1y_at_save: cagrs.y1,
        cagr_5y_at_save: cagrs.y5,
        cagr_10y_at_save: cagrs.y10,
        proj_1y_rf: p1.fixedIncome,
        proj_5y_rf: p5.fixedIncome,
        proj_10y_rf: p10.fixedIncome,
        proj_1y_btc: p1.bitcoin,
        proj_5y_btc: p5.bitcoin,
        proj_10y_btc: p10.bitcoin,
    };
}

/** Enriquece savings com projeções atualizadas (para Histórico) */
export function enrichWithProjections(
    savings: Saving[],
    currentFixedRate: number,
    currentBtcPrice: number,
): EnrichedSaving[] {
    return savings.map((s) => {
        const savedAt = new Date(s.created_at);
        const currentFixedValue = calculateCurrentFixedValue(
            s.amount,
            currentFixedRate,
            savedAt,
        );
        const currentBtcValue = calculateCurrentBtcValue(
            s.btc_equivalent,
            currentBtcPrice,
        );

        return {
            ...s,
            currentFixedValue,
            currentFixedGainPercent:
                s.amount > 0 ? ((currentFixedValue - s.amount) / s.amount) * 100 : 0,
            currentBtcValue,
            currentBtcGainPercent:
                s.amount > 0 ? ((currentBtcValue - s.amount) / s.amount) * 100 : 0,
        };
    });
}

/** Calcula totais para SummaryCards */
export function calculateTotals(
    savings: Saving[],
    currentFixedRate: number,
    currentBtcPrice: number,
): SummaryTotals {
    let totalSaved = 0;
    let investedProjection = 0;
    const rfPortion = { count: 0, totalSaved: 0, projection: 0 };
    const btcPortion = { count: 0, totalSaved: 0, projection: 0 };

    for (const s of savings) {
        totalSaved += s.amount;
        const savedAt = new Date(s.created_at);

        if (s.investment_type === 'RF') {
            const currentVal = calculateCurrentFixedValue(s.amount, currentFixedRate, savedAt);
            rfPortion.count += 1;
            rfPortion.totalSaved += s.amount;
            rfPortion.projection += currentVal;
            investedProjection += currentVal;
        } else {
            const currentVal = calculateCurrentBtcValue(s.btc_equivalent, currentBtcPrice);
            btcPortion.count += 1;
            btcPortion.totalSaved += s.amount;
            btcPortion.projection += currentVal;
            investedProjection += currentVal;
        }
    }

    const investedGain = investedProjection - totalSaved;
    const investedGainPercent = totalSaved > 0 ? (investedGain / totalSaved) * 100 : 0;

    return {
        totalSaved,
        investedProjection,
        investedGain,
        investedGainPercent,
        rfPortion,
        btcPortion,
    };
}

const MONTH_LABELS = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
] as const;

const MAX_CHART_MONTHS = 6;

/** Constrói dados para gráfico de barras empilhadas agrupado por mês (últimos 6 meses) */
export function buildChartData(savings: Saving[]): ChartDataPoint[] {
    if (savings.length === 0) return [];

    // Agrupa por YYYY-MM
    const monthMap = new Map<string, { rf: number; btc: number }>();

    for (const s of savings) {
        const monthKey = s.created_at.slice(0, 7); // 'YYYY-MM'
        const entry = monthMap.get(monthKey) ?? { rf: 0, btc: 0 };

        if (s.investment_type === 'RF') {
            entry.rf += s.amount;
        } else {
            entry.btc += s.amount;
        }

        monthMap.set(monthKey, entry);
    }

    // Ordena por mês crescente e pega últimos 6
    const sortedKeys = [...monthMap.keys()].sort();
    const recentKeys = sortedKeys.slice(-MAX_CHART_MONTHS);

    return recentKeys.map((monthKey) => {
        const entry = monthMap.get(monthKey)!;
        const monthIndex = parseInt(monthKey.slice(5, 7), 10) - 1;

        return {
            month: monthKey,
            label: MONTH_LABELS[monthIndex] ?? '',
            rfAmount: entry.rf,
            btcAmount: entry.btc,
            total: entry.rf + entry.btc,
        };
    });
}
