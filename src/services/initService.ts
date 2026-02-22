// src/services/initService.ts
// Orquestra inicialização do app em 5 etapas

import { getDatabase } from '@/repositories/database';
import * as configRepo from '@/repositories/configRepository';
import * as savingsRepo from '@/repositories/savingsRepository';
import * as cacheRepo from '@/repositories/cacheRepository';
import { fetchBitcoinData } from '@/services/bitcoinService';
import { fetchSelicRate } from '@/services/selicService';
import { useAppStore } from '@/stores/useAppStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useMarketStore } from '@/stores/useMarketStore';
import { FALLBACK_MARKET_DATA } from '@/constants/fallbackMarketData';
//import { seedTestSavings } from '@/services/devSeed';
import type { BtcData } from '@/types';

const CACHE_KEY_BTC = 'btc_data';
const CACHE_KEY_SELIC = 'selic_rate';

export async function initializeApp(): Promise<void> {
    const { setLoading, setError, setReady, setHasCache } =
        useAppStore.getState();

    setLoading(true);
    setError(null);

    try {
        // 1. Abre SQLite + migrations
        getDatabase();

        // ⚠️ TEMPORÁRIO — seed de teste (remover depois)
        //seedTestSavings();

        // 2. Carrega config (fixedRate)
        useConfigStore.getState().loadConfig();

        // 3. Carrega economias salvas
        useSavingsStore.getState().loadSavings();

        // 4. Fetch paralelo: BTC + SELIC
        await fetchMarketData();

        // 5. Marca como pronto
        setReady();
    } catch (err) {
        if (__DEV__) {
            console.error('[initService]', err);
        }
        setError(
            err instanceof Error ? err.message : 'Erro ao inicializar o app',
        );
        setLoading(false);
    }
}

async function fetchMarketData(): Promise<void> {
    const { setHasCache, setError } = useAppStore.getState();
    const { setMarketData } = useMarketStore.getState();

    try {
        const [btcData, selicRate] = await Promise.all([
            fetchBitcoinData(),
            fetchSelicRate(),
        ]);

        // Sucesso → salva cache + atualiza store
        cacheRepo.set(CACHE_KEY_BTC, btcData);
        cacheRepo.set(CACHE_KEY_SELIC, { rate: selicRate });

        const todayStr = new Date().toISOString().slice(0, 10);

        setMarketData({
            btcPrice: btcData.currentPrice,
            cagr1y: btcData.cagr1y,
            cagr5y: btcData.cagr5y,
            cagr10y: btcData.cagr10y,
            selicRate,
            lastFetchDate: todayStr,
        });

        setHasCache(true);
        useAppStore.getState().setDataSource('live');
    } catch {
        // Falha → tenta cache
        loadFromCache();
    }
}

function loadFromCache(): void {
    const { setHasCache, setDataSource } = useAppStore.getState();
    const { setMarketData } = useMarketStore.getState();

    const btcCache = cacheRepo.get(CACHE_KEY_BTC);
    const selicCache = cacheRepo.get(CACHE_KEY_SELIC);

    if (btcCache != null && selicCache != null) {
        const btcData = JSON.parse(btcCache.value) as BtcData;
        const selicData = JSON.parse(selicCache.value) as { rate: number };

        setMarketData({
            btcPrice: btcData.currentPrice,
            cagr1y: btcData.cagr1y,
            cagr5y: btcData.cagr5y,
            cagr10y: btcData.cagr10y,
            selicRate: selicData.rate,
            lastFetchDate: btcCache.fetched_at.slice(0, 10),
        });

        setHasCache(true);
        setDataSource('cache');
    } else {
        // Sem cache → usa fallback embutido no build
        loadFromFallback();
    }
}

function loadFromFallback(): void {
    const { setHasCache, setDataSource } = useAppStore.getState();
    const { setMarketData } = useMarketStore.getState();

    setMarketData({
        btcPrice: FALLBACK_MARKET_DATA.btcPrice,
        cagr1y: FALLBACK_MARKET_DATA.cagr1y,
        cagr5y: FALLBACK_MARKET_DATA.cagr5y,
        cagr10y: FALLBACK_MARKET_DATA.cagr10y,
        selicRate: FALLBACK_MARKET_DATA.selicRate,
        lastFetchDate: FALLBACK_MARKET_DATA.fetchedAt.slice(0, 10),
    });

    setHasCache(false);
    setDataSource('fallback');
}
