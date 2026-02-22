// src/hooks/useCurrencyInput.ts
// Hook para formatação de input monetário BRL

import { useState, useCallback, useMemo, useRef } from 'react';
import { debounce } from '@/utils/debounce';

type UseCurrencyInputReturn = {
    displayValue: string;
    numericValue: number;
    onChangeText: (text: string) => void;
    reset: () => void;
};

/**
 * Hook que gerencia input monetário com debounce.
 * Exibe valor formatado (sem prefix) e expõe numericValue em centavos→reais.
 * Ex: "35000" → displayValue "350,00" → numericValue 350.
 */
export function useCurrencyInput(delayMs = 300): UseCurrencyInputReturn {
    const [rawCents, setRawCents] = useState(0);
    const [debouncedCents, setDebouncedCents] = useState(0);

    const debouncedSetRef = useRef(
        debounce((cents: number) => {
            setDebouncedCents(cents);
        }, delayMs),
    );

    const onChangeText = useCallback((text: string) => {
        // Remove tudo que não é dígito
        const digits = text.replace(/\D/g, '');
        const cents = parseInt(digits, 10) || 0;
        setRawCents(cents);
        debouncedSetRef.current(cents);
    }, []);

    const displayValue = useMemo(() => {
        if (rawCents === 0) return '';
        const reais = (rawCents / 100).toFixed(2);
        const parts = reais.split('.');
        const intPart = (parts[0] ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decPart = parts[1] ?? '00';
        return `${intPart},${decPart}`;
    }, [rawCents]);

    const numericValue = useMemo(() => debouncedCents / 100, [debouncedCents]);

    const reset = useCallback(() => {
        setRawCents(0);
        setDebouncedCents(0);
    }, []);

    return { displayValue, numericValue, onChangeText, reset };
}
