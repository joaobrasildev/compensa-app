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

/** Constrói dados para gráfico de crescimento acumulado */
export function buildChartData(
    savings: Saving[],
    currentFixedRate: number,
    currentBtcPrice: number,
): ChartDataPoint[] {
    if (savings.length === 0) return [];

    // Ordena por data crescente
    const sorted = [...savings].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    let cumulativeRf = 0;
    let cumulativeBtc = 0;

    return sorted.map((s) => {
        const savedAt = new Date(s.created_at);
        cumulativeRf += calculateCurrentFixedValue(s.amount, currentFixedRate, savedAt);
        cumulativeBtc += calculateCurrentBtcValue(s.btc_equivalent, currentBtcPrice);

        return {
            date: s.created_at.slice(0, 10), // YYYY-MM-DD
            rfValue: cumulativeRf,
            btcValue: cumulativeBtc,
        };
    });
}
