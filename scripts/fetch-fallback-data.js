#!/usr/bin/env node

/**
 * scripts/fetch-fallback-data.js
 *
 * Coleta dados de mercado (BTC + SELIC) e gera src/constants/fallbackMarketData.ts
 * Roda automaticamente no prebuild do EAS Build e pode ser executado manualmente:
 *   node scripts/fetch-fallback-data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const TIMEOUT_MS = 15_000;
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'constants', 'fallbackMarketData.ts');

// CAGRs históricos médios como fallback caso a API não retorne dados suficientes
const DEFAULT_CAGR_1Y = 80;
const DEFAULT_CAGR_5Y = 60;
const DEFAULT_CAGR_10Y = 50;
const DEFAULT_BTC_PRICE = 650000;
const DEFAULT_SELIC_RATE = 14.25;

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout: ${url}`)), TIMEOUT_MS);

        https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                clearTimeout(timer);
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode} para ${url}`));
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`JSON inválido de ${url}`));
                }
            });
        }).on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

async function fetchBtcPrice() {
    try {
        const data = await fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl');
        return data.bitcoin.brl;
    } catch (err) {
        console.warn(`⚠️  Falha ao buscar preço BTC: ${err.message}. Usando default.`);
        return DEFAULT_BTC_PRICE;
    }
}

async function fetchBtcCAGRs(currentPrice) {
    try {
        const data = await fetchJSON('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=365&interval=daily');
        const prices = data.prices;
        if (!prices || prices.length < 30) throw new Error('Dados insuficientes');

        const now = Date.now();
        const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

        // Encontra preço mais próximo de 1 ano atrás
        const target1y = now - MS_PER_YEAR;
        let closest = prices[0];
        let minDiff = Math.abs(closest[0] - target1y);
        for (const entry of prices) {
            const diff = Math.abs(entry[0] - target1y);
            if (diff < minDiff) { closest = entry; minDiff = diff; }
        }
        const price1y = closest[1];

        // CAGR 1y = (current / past)^(1/1) - 1
        const cagr1y = ((currentPrice / price1y) - 1) * 100;

        return {
            cagr1y: Math.round(cagr1y * 100) / 100,
            cagr5y: DEFAULT_CAGR_5Y,
            cagr10y: DEFAULT_CAGR_10Y,
        };
    } catch (err) {
        console.warn(`⚠️  Falha ao buscar histórico BTC: ${err.message}. Usando CAGRs default.`);
        return {
            cagr1y: DEFAULT_CAGR_1Y,
            cagr5y: DEFAULT_CAGR_5Y,
            cagr10y: DEFAULT_CAGR_10Y,
        };
    }
}

async function fetchSelicRate() {
    try {
        const data = await fetchJSON('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json');
        if (!data || data.length === 0) throw new Error('Resposta vazia');
        const rate = parseFloat(data[0].valor);
        if (isNaN(rate)) throw new Error('Valor inválido');
        return rate;
    } catch (err) {
        console.warn(`⚠️  Falha ao buscar SELIC: ${err.message}. Usando default.`);
        return DEFAULT_SELIC_RATE;
    }
}

async function main() {
    console.log('🔄 Buscando dados de mercado para fallback...\n');

    const [btcPrice, selicRate] = await Promise.all([
        fetchBtcPrice(),
        fetchSelicRate(),
    ]);

    const cagrs = await fetchBtcCAGRs(btcPrice);
    const fetchedAt = new Date().toISOString();

    console.log(`  BTC Price: R$ ${btcPrice.toLocaleString('pt-BR')}`);
    console.log(`  SELIC:     ${selicRate}%`);
    console.log(`  CAGR 1y:   ${cagrs.cagr1y}%`);
    console.log(`  CAGR 5y:   ${cagrs.cagr5y}%`);
    console.log(`  CAGR 10y:  ${cagrs.cagr10y}%`);
    console.log(`  Timestamp: ${fetchedAt}\n`);

    const content = `// src/constants/fallbackMarketData.ts
// ⚠️ ARQUIVO GERADO AUTOMATICAMENTE por scripts/fetch-fallback-data.js
// Não edite manualmente. Será regenerado a cada build de produção.
// Gerado em: ${fetchedAt}

export const FALLBACK_MARKET_DATA = {
  btcPrice: ${btcPrice},
  selicRate: ${selicRate},
  cagr1y: ${cagrs.cagr1y},
  cagr5y: ${cagrs.cagr5y},
  cagr10y: ${cagrs.cagr10y},
  fetchedAt: '${fetchedAt}',
} as const;
`;

    // Garante que o diretório existe
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, content, 'utf-8');
    console.log(`✅ Fallback salvo em: src/constants/fallbackMarketData.ts`);
}

main().catch((err) => {
    console.error('❌ Erro fatal no script de fallback:', err);
    // Não falha o build — gera arquivo com defaults
    const content = `// src/constants/fallbackMarketData.ts
// ⚠️ ARQUIVO GERADO COM VALORES DEFAULT (fetch falhou)
// Gerado em: ${new Date().toISOString()}

export const FALLBACK_MARKET_DATA = {
  btcPrice: ${DEFAULT_BTC_PRICE},
  selicRate: ${DEFAULT_SELIC_RATE},
  cagr1y: ${DEFAULT_CAGR_1Y},
  cagr5y: ${DEFAULT_CAGR_5Y},
  cagr10y: ${DEFAULT_CAGR_10Y},
  fetchedAt: '${new Date().toISOString()}',
} as const;
`;

    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_PATH, content, 'utf-8');
    console.log('⚠️  Fallback salvo com valores default.');
});
