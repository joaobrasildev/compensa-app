// src/hooks/useProjections.ts
// Hook que calcula projeções memoizadas a partir de valor + dados de mercado

import { useMemo } from 'react';
import { calculateProjections } from '@/rules/projectionRules';
import type { Projection, CAGRs } from '@/types';

type UseProjectionsParams = {
    amount: number;
    fixedRate: number;
    btcPrice: number;
    cagrs: CAGRs;
};

export function useProjections({
    amount,
    fixedRate,
    btcPrice,
    cagrs,
}: UseProjectionsParams): Projection[] {
    return useMemo(
        () => calculateProjections(amount, fixedRate, btcPrice, cagrs),
        [amount, fixedRate, btcPrice, cagrs.y1, cagrs.y5, cagrs.y10],
    );
}
