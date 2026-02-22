// src/services/bitcoinService.ts
// Busca preço BTC e calcula CAGRs via CoinGecko

import type { BtcData } from '@/types';
import { calculateCAGR } from '@/rules/projectionRules';

const TIMEOUT_MS = 10_000;
const BASE_URL = 'https://api.coingecko.com/api/v3';

// CAGRs históricos médios do BTC/BRL como fallback quando a API gratuita
// não fornece dados suficientes (limite de 365 dias).
// Fonte: cálculo baseado em dados públicos do Bitcoin.
const BTC_HISTORICAL_CAGR_1Y = 80;   // Variável, usa dado real quando disponível
const BTC_HISTORICAL_CAGR_5Y = 60;   // Média histórica 5 anos
const BTC_HISTORICAL_CAGR_10Y = 50;  // Média histórica 10 anos

type PriceResponse = {
    bitcoin: { brl: number };
};

type MarketChartResponse = {
    prices: [number, number][];
};

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    return fetch(url, { signal: controller.signal }).finally(() =>
        clearTimeout(timeoutId),
    );
}

function findClosestPrice(
    prices: [number, number][],
    targetTimestamp: number,
): number | null {
    if (prices.length === 0) return null;

    let closest = prices[0]!;
    let minDiff = Math.abs(closest[0] - targetTimestamp);

    for (let i = 1; i < prices.length; i++) {
        const entry = prices[i]!;
        const diff = Math.abs(entry[0] - targetTimestamp);
        if (diff < minDiff) {
            closest = entry;
            minDiff = diff;
        }
    }

    return closest[1];
}

export async function fetchBitcoinData(): Promise<BtcData> {
    // 1. Preço atual
    const priceRes = await fetchWithTimeout(
        `${BASE_URL}/simple/price?ids=bitcoin&vs_currencies=brl`,
        TIMEOUT_MS,
    );
    if (!priceRes.ok) {
        throw new Error(`CoinGecko price: HTTP ${priceRes.status}`);
    }
    const priceData = (await priceRes.json()) as PriceResponse;
    const currentPrice = priceData.bitcoin.brl;

    // 2. Histórico (máximo 365 dias — limite da API gratuita)
    const historyRes = await fetchWithTimeout(
        `${BASE_URL}/coins/bitcoin/market_chart?vs_currency=brl&days=365&interval=daily`,
        TIMEOUT_MS,
    );
    if (!historyRes.ok) {
        // Se histórico falhar, retorna só preço com CAGRs estimados
        if (__DEV__) console.warn(`CoinGecko history: HTTP ${historyRes.status}`);
        return {
            currentPrice,
            cagr1y: BTC_HISTORICAL_CAGR_1Y,
            cagr5y: BTC_HISTORICAL_CAGR_5Y,
            cagr10y: BTC_HISTORICAL_CAGR_10Y,
        };
    }
    const historyData = (await historyRes.json()) as MarketChartResponse;
    const prices = historyData.prices;

    const now = Date.now();
    const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

    // API gratuita retorna no máximo ~365 dias
    // Calcular CAGR de 1 ano com dado real; 5y e 10y usam fallback histórico
    const target1y = now - MS_PER_YEAR;
    const price1y = findClosestPrice(prices, target1y);

    // Ponto mais antigo do dataset como fallback
    const oldestEntry = prices[0];
    const oldestPrice = oldestEntry != null ? oldestEntry[1] : null;
    const oldestTimestamp = oldestEntry != null ? oldestEntry[0] : now;
    const oldestYears = Math.max((now - oldestTimestamp) / MS_PER_YEAR, 0.01);

    // CAGR 1 ano: dado real da API
    const cagr1y =
        price1y != null
            ? calculateCAGR(currentPrice, price1y, 1)
            : oldestPrice != null
                ? calculateCAGR(currentPrice, oldestPrice, oldestYears)
                : BTC_HISTORICAL_CAGR_1Y;

    // CAGR 5 e 10 anos: API gratuita não tem dados suficientes, usar fallback
    const cagr5y = BTC_HISTORICAL_CAGR_5Y;
    const cagr10y = BTC_HISTORICAL_CAGR_10Y;

    return { currentPrice, cagr1y, cagr5y, cagr10y };
}
