// Dados de mercado hardcoded usados como último recurso (API offline + sem cache local).
// Atualize manualmente se necessário.

export const FALLBACK_MARKET_DATA = {
  btcPrice: 650_000,
  selicRate: 15,
  cagr1y: 80,
  cagr5y: 60,
  cagr10y: 50,
  fetchedAt: '2026-02-23',
} as const;
