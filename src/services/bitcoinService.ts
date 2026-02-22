// src/services/bitcoinService.ts
// Busca preço BTC e calcula CAGRs via CoinGecko

import type { BtcData } from '@/types';
import { calculateCAGR } from '@/rules/projectionRules';

const TIMEOUT_MS = 10_000;
const BASE_URL = 'https://api.coingecko.com/api/v3';

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
    const priceData = (await priceRes.json()) as PriceResponse;
    const currentPrice = priceData.bitcoin.brl;

    // 2. Histórico (últimos 10 anos)
    const historyRes = await fetchWithTimeout(
        `${BASE_URL}/coins/bitcoin/market_chart?vs_currency=brl&days=3650&interval=daily`,
        TIMEOUT_MS,
    );
    const historyData = (await historyRes.json()) as MarketChartResponse;
    const prices = historyData.prices;

    const now = Date.now();
    const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

    // Encontrar preços de ~1, ~5, ~10 anos atrás
    const target1y = now - MS_PER_YEAR;
    const target5y = now - 5 * MS_PER_YEAR;
    const target10y = now - 10 * MS_PER_YEAR;

    const price1y = findClosestPrice(prices, target1y);
    const price5y = findClosestPrice(prices, target5y);
    const price10y = findClosestPrice(prices, target10y);

    // Ponto mais antigo do dataset como fallback
    const oldestEntry = prices[0];
    const oldestPrice = oldestEntry != null ? oldestEntry[1] : null;
    const oldestTimestamp = oldestEntry != null ? oldestEntry[0] : now;
    const oldestYears = Math.max((now - oldestTimestamp) / MS_PER_YEAR, 0.01);

    // CAGRs — se não tem data suficiente, usa ponto mais antigo
    const cagr1y =
        price1y != null
            ? calculateCAGR(currentPrice, price1y, 1)
            : oldestPrice != null
                ? calculateCAGR(currentPrice, oldestPrice, oldestYears)
                : 0;

    const cagr5y =
        price5y != null
            ? calculateCAGR(currentPrice, price5y, 5)
            : oldestPrice != null
                ? calculateCAGR(currentPrice, oldestPrice, oldestYears)
                : 0;

    const cagr10y =
        price10y != null
            ? calculateCAGR(currentPrice, price10y, 10)
            : oldestPrice != null
                ? calculateCAGR(currentPrice, oldestPrice, oldestYears)
                : 0;

    return { currentPrice, cagr1y, cagr5y, cagr10y };
}
