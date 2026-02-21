# 📋 Plano de Execução — Compensa App

> Aplicativo pessoal de controle comportamental financeiro.
> "Quanto você teria se tivesse investido em vez de gastar?"

---

## 1. Stack Recomendada

| Camada | Tecnologia | Versão Alvo |
|---|---|---|
| Framework | React Native (Expo SDK 52+) | ~0.76 |
| Linguagem | TypeScript | 5.x |
| Navegação | React Navigation 7 (Material Top Tabs) | 7.x |
| Banco Local | **expo-sqlite** (SQLite via Expo) | SDK 52+ |
| Estado Global | Zustand | 5.x |
| Gráficos | react-native-chart-kit ou victory-native | última estável |
| HTTP Client | fetch nativo (sem axios — zero deps extras) | — |
| Formatação Numérica | Intl nativo + helper functions | — |
| Testes | Jest + React Native Testing Library | — |
| Build & Publish | EAS Build + EAS Submit | — |

---

## 2. Justificativa do Banco Local — SQLite via expo-sqlite

### Por que SQLite?

| Critério | SQLite | AsyncStorage | MMKV | WatermelonDB |
|---|---|---|---|---|
| Consultas relacionais | ✅ SQL completo | ❌ key-value | ❌ key-value | ✅ (usa SQLite por baixo) |
| Performance com 1k+ registros | ✅ Excelente | ⚠️ Degrada | ✅ Boa | ✅ Excelente |
| Suporte App Store / Play Store | ✅ Nativo | ✅ | ✅ | ✅ |
| Complexidade de setup | ✅ Baixa (expo-sqlite) | ✅ Mínima | ⚠️ Requer native modules | ⚠️ Boilerplate alto |
| Agregações (SUM, AVG, GROUP BY) | ✅ Nativo | ❌ Manual | ❌ Manual | ✅ Via query |
| Backup/Export futuro | ✅ Arquivo .db | ❌ | ❌ | ⚠️ Complexo |

### Decisão

**expo-sqlite** é a escolha ideal porque:

1. O app precisa de **agregações** (total acumulado, média mensal, ranking top 5) — SQL resolve nativamente.
2. A modelagem tem **estrutura relacional** (economias com projeções vinculadas).
3. É **nativo do Expo SDK 52+** — zero configuração extra, zero native modules manuais.
4. SQLite é o banco **mais testado em produção mobile** do planeta (usado por WhatsApp, Signal, etc.).
5. Compatível com **App Store e Google Play** sem restrições.
6. O arquivo `.db` pode ser facilmente exportado no futuro se o usuário quiser backup.

### Configuração de Armazenamento

- **Dados de configuração** (taxa do usuário, timestamp da última busca): tabela `config` no SQLite (key-value simples).
- **Dados de economias**: tabela `savings` com campos estruturados.
- **Cache de dados externos**: tabela `external_data_cache` com TTL.

> **Nota:** AsyncStorage NÃO será usado. Tudo centralizado no SQLite para consistência.

---

## 3. Estrutura de Pastas

```
compensa-app/
├── app.json                          # Config Expo
├── App.tsx                           # Entry point
├── eas.json                          # Config EAS Build
├── tsconfig.json
├── package.json
│
├── src/
│   ├── app/
│   │   └── Navigation.tsx            # Setup do Top Tabs
│   │
│   ├── screens/
│   │   ├── SimulatorScreen.tsx        # Aba 1 — Simulador
│   │   └── HistoryScreen.tsx          # Aba 2 — Histórico + Métricas + Ranking
│   │
│   ├── components/
│   │   ├── simulator/
│   │   │   ├── InputSection.tsx       # Inputs: valor, taxa
│   │   │   ├── MarketInfo.tsx         # BTC price + SELIC display
│   │   │   ├── ProjectionCard.tsx     # Card de projeção (1a, 5a, 10a)
│   │   │   └── SaveButton.tsx         # "Resolvi Economizar"
│   │   │
│   │   ├── history/
│   │   │   ├── SavingsList.tsx        # Lista de economias
│   │   │   ├── SavingsItem.tsx        # Item individual
│   │   │   ├── TotalsSummary.tsx      # Totais acumulados
│   │   │   ├── TopRanking.tsx         # Top 5 maiores
│   │   │   ├── DisciplineIndex.tsx    # Índice de disciplina
│   │   │   └── GrowthChart.tsx        # Gráfico comparativo
│   │   │
│   │   └── common/
│   │       ├── CurrencyText.tsx       # Formatação BRL
│   │       ├── PercentageText.tsx     # Formatação %
│   │       └── LoadingOverlay.tsx     # Loading durante fetch
│   │
│   ├── database/
│   │   ├── connection.ts             # Inicialização do SQLite
│   │   ├── migrations.ts            # Versionamento de schema
│   │   ├── repositories/
│   │   │   ├── savingsRepository.ts  # CRUD economias
│   │   │   ├── configRepository.ts   # CRUD configurações
│   │   │   └── cacheRepository.ts    # Cache dados externos
│   │   └── schema.ts                # Definição das tabelas
│   │
│   ├── services/
│   │   ├── bitcoinService.ts         # CoinGecko API
│   │   ├── selicService.ts           # Banco Central API
│   │   └── calculationService.ts     # CAGR + Juros Compostos
│   │
│   ├── store/
│   │   ├── useAppStore.ts            # Zustand — estado global
│   │   └── types.ts                  # Tipos do store
│   │
│   ├── hooks/
│   │   ├── useInitApp.ts             # Hook de inicialização
│   │   ├── useSimulator.ts           # Lógica do simulador
│   │   └── useProjections.ts         # Cálculos de projeção atualizados
│   │
│   ├── utils/
│   │   ├── calculations.ts           # Funções puras de cálculo
│   │   ├── formatters.ts             # Formatação de moeda, data, %
│   │   ├── dateUtils.ts              # Helpers de data
│   │   └── constants.ts              # Constantes do app
│   │
│   └── types/
│       ├── savings.ts                # Tipos das economias
│       ├── market.ts                 # Tipos dados de mercado
│       └── projections.ts            # Tipos das projeções
│
└── assets/
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

---

## 4. Modelagem de Dados (SQLite)

### Tabela: `savings`

```sql
CREATE TABLE IF NOT EXISTS savings (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at                TEXT NOT NULL DEFAULT (datetime('now')),

  -- Valor original
  amount                    REAL NOT NULL,

  -- Snapshot do mercado no momento do clique
  btc_price_at_save         REAL NOT NULL,
  selic_at_save             REAL NOT NULL,
  fixed_rate_at_save        REAL NOT NULL,  -- taxa configurada pelo usuário

  -- Projeções calculadas no momento (renda fixa)
  projection_fixed_1y       REAL NOT NULL,
  projection_fixed_5y       REAL NOT NULL,
  projection_fixed_10y      REAL NOT NULL,

  -- Projeções calculadas no momento (Bitcoin via CAGR)
  projection_btc_1y         REAL NOT NULL,
  projection_btc_5y         REAL NOT NULL,
  projection_btc_10y        REAL NOT NULL,

  -- Equivalente em BTC no momento
  btc_equivalent            REAL NOT NULL,  -- amount / btc_price_at_save

  -- CAGRs usados no momento do cálculo
  btc_cagr_1y               REAL NOT NULL,
  btc_cagr_5y               REAL NOT NULL,
  btc_cagr_10y              REAL NOT NULL
);
```

### Tabela: `config`

```sql
CREATE TABLE IF NOT EXISTS config (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

-- Registros esperados:
-- ('fixed_rate', '12.5')           -- Taxa renda fixa do usuário (% ao ano)
-- ('last_fetch_timestamp', '...')  -- Último fetch de dados externos
```

### Tabela: `external_data_cache`

```sql
CREATE TABLE IF NOT EXISTS external_data_cache (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,            -- JSON stringified
  fetched_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Registros esperados:
-- ('btc_current_price', '{"brl": 650000}')
-- ('btc_history', '{"prices": [...]}')         -- Histórico para CAGR
-- ('selic_current', '{"value": 14.25}')
-- ('btc_cagr', '{"1y": 0.85, "5y": 0.55, "10y": 0.72}')
```

---

## 5. Estratégia de Armazenamento Seguro

### Política de Dados

| Dado | Onde | Criptografia |
|---|---|---|
| Economias salvas | SQLite (tabela `savings`) | Não necessária* |
| Configuração do usuário | SQLite (tabela `config`) | Não necessária* |
| Cache de APIs | SQLite (tabela `external_data_cache`) | Não necessária |

> *O app é pessoal e não contém dados sensíveis (sem senhas, sem tokens, sem dados bancários reais). O SQLite no sandbox do app já é protegido pelo OS (iOS Keychain-level filesystem protection, Android app sandbox).

### Proteção Adicional (Opcional — v1.1+)

- Se o usuário desejar, pode-se adicionar **autenticação biométrica** ao abrir o app via `expo-local-authentication`.
- O banco SQLite fica no diretório privado do app — não acessível por outros apps.

### Backup

- **Fase 1 (MVP):** Sem backup. Dados vivem no device.
- **Fase futura:** Export CSV/JSON manual via `expo-sharing`.

---

## 6. Fluxo de Inicialização do App

```
App.tsx monta
    │
    ▼
useInitApp() executa
    │
    ├─ 1. Abre conexão SQLite
    │      └─ Executa migrations se necessário (versionamento)
    │
    ├─ 2. Carrega configurações do banco → Zustand store
    │      └─ fixed_rate, last_fetch_timestamp
    │
    ├─ 3. Verifica se precisa fazer fetch externo
    │      └─ Regra: fetch 1x por sessão (app open)
    │         OU se cache está vazio
    │
    ├─ 4. Se sim → fetch paralelo:
    │      ├─ CoinGecko: preço atual BTC/BRL
    │      ├─ CoinGecko: histórico BTC (1a, 5a, 10a)
    │      └─ BCB: taxa SELIC atual
    │      │
    │      └─ Salva tudo no external_data_cache
    │         └─ Calcula CAGRs e salva no cache
    │
    ├─ 5. Se não → carrega do cache
    │
    ├─ 6. Popula Zustand store com dados de mercado
    │
    └─ 7. Marca app como "ready" → remove splash/loading
```

### Tratamento de Falha no Fetch

- Se o fetch falhar E existir cache anterior → usa cache (mostra badge "dados de [data]").
- Se o fetch falhar E NÃO existir cache → mostra mensagem pedindo conexão + botão "Tentar novamente".
- O app NUNCA deve travar por falta de conexão se já tiver cache.

---

## 7. Estratégia para Buscar e Armazenar Dados Externos

### 7.1 Bitcoin — CoinGecko API (gratuita, sem API key)

**Preço atual:**
```
GET https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl
```
→ Retorna `{ "bitcoin": { "brl": 650000 } }`

**Histórico (para CAGR):**
```
GET https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=3650&interval=daily
```
→ Retorna array de `[timestamp, price]` — 10 anos de dados diários.

> ⚠️ **Rate Limit CoinGecko Free:** 10-30 req/min. Como fazemos apenas 2 requests por abertura do app, estamos muito dentro do limite.

**Dados extraídos do histórico:**
- Preço de ~1 ano atrás (mais próximo de 365 dias)
- Preço de ~5 anos atrás (mais próximo de 1825 dias)
- Preço de ~10 anos atrás (mais próximo de 3650 dias)
- Preço atual

### 7.2 SELIC — Banco Central do Brasil

```
GET https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json
```
→ Retorna `[{ "data": "DD/MM/YYYY", "valor": "14.25" }]`

> API pública, sem autenticação, sem rate limit relevante.

### 7.3 Política de Cache

| Dado | TTL | Refresh |
|---|---|---|
| Preço BTC | Por sessão | A cada app open |
| Histórico BTC | Por sessão | A cada app open |
| SELIC | Por sessão | A cada app open |
| CAGRs calculados | Por sessão | Recalculado após fetch do histórico |

O fetch acontece **1 única vez ao abrir o app**. Não há polling, não há refresh automático.
O usuário pode forçar refresh com pull-to-refresh no simulador.

---

## 8. Estratégia para Cálculo de CAGR

### Fórmula CAGR

$$CAGR = \left(\frac{V_{final}}{V_{inicial}}\right)^{\frac{1}{n}} - 1$$

Onde:
- $V_{final}$ = preço atual do BTC
- $V_{inicial}$ = preço do BTC há $n$ anos
- $n$ = período em anos (1, 5 ou 10)

### Implementação

```
// Pseudocódigo
function calculateCAGR(currentPrice, historicalPrice, years):
    if historicalPrice <= 0 or years <= 0:
        return 0
    return (currentPrice / historicalPrice) ^ (1 / years) - 1
```

### Extração de Preços Históricos

Do array retornado pela CoinGecko (`[timestamp, price]`):

1. Calcular timestamp alvo: `now - (years * 365.25 * 24 * 60 * 60 * 1000)`
2. Encontrar o data point com timestamp mais próximo do alvo
3. Usar o `price` correspondente como $V_{inicial}$

### Edge Cases

- **BTC não existia há 10 anos em BRL na CoinGecko?** → Se o histórico retornado for menor que 10 anos, usar o ponto mais antigo disponível e ajustar $n$ proporcionalmente.
- **CAGR negativo:** Possível (bear market). Deve ser exibido normalmente — é informação real.
- **CAGR absurdamente alto:** Histórico de 10 anos do BTC pode dar CAGRs > 100%. Exibir normalmente com nota explicativa.

---

## 9. Estratégia de Atualização dos Valores Atuais (Aba Histórico)

### O que precisa ser recalculado ao exibir cada economia salva:

Para cada registro na tabela `savings`:

**Renda Fixa Atualizada:**

$$V_{atual\_rf} = amount \times (1 + taxa\_atual)^{t}$$

Onde:
- $taxa\_atual$ = taxa configurada ATUALMENTE pelo usuário (não a do momento do save)
- $t$ = tempo decorrido em anos (fracionário) desde `created_at`

**Bitcoin Atualizado:**

$$V_{atual\_btc} = btc\_equivalent \times preco\_btc\_atual$$

Onde:
- $btc\_equivalent$ = `amount / btc_price_at_save` (salvo no registro)
- $preco\_btc\_atual$ = preço atual do BTC (do cache/store)

### Performance

- Cálculos são **O(n)** onde n = número de economias.
- Para < 10.000 registros, cálculo é instantâneo (~1ms).
- Recalcular a cada render da lista, sem necessidade de cache.
- Totais (SUM) podem ser feitos via SQL para eficiência:
  - `SELECT SUM(amount) FROM savings` → Total economizado
  - Os totais projetados são calculados em JS (dependem de dados dinâmicos)

---

## 10. Organização das Abas

### Estrutura Final: **2 Abas (Top Tabs)**

```
┌─────────────────────────────────────┐
│   [  Simulador  ] [  Histórico  ]   │  ← Top Tab Bar
├─────────────────────────────────────┤
│                                     │
│         Conteúdo da aba             │
│                                     │
└─────────────────────────────────────┘
```

### Aba 1 — Simulador

```
┌──────────────────────────────────────┐
│  💰 Quanto você gastaria?            │
│  ┌──────────────────────────────┐    │
│  │ R$ [___________]             │    │
│  └──────────────────────────────┘    │
│                                      │
│  📈 Taxa de renda fixa (% a.a.)     │
│  ┌──────────────────────────────┐    │
│  │ [___12.5___] %               │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ ₿ BTC: R$ 650.000    •info  │    │
│  │ 📊 SELIC: 14,25% a.a. •info │    │
│  └──────────────────────────────┘    │
│                                      │
│  ── Projeções ──────────────────     │
│                                      │
│  📅 1 ano                            │
│  ├─ Renda Fixa:  R$ 1.125,00        │
│  ├─ Bitcoin:     R$ 1.850,00        │
│  └─ ≈ 0,00153 BTC                   │
│                                      │
│  📅 5 anos                           │
│  ├─ Renda Fixa:  R$ 1.762,34        │
│  ├─ Bitcoin:     R$ 7.593,75        │
│  └─ ≈ 0,00153 BTC → R$ ...         │
│                                      │
│  📅 10 anos                          │
│  ├─ Renda Fixa:  R$ 3.105,85        │
│  ├─ Bitcoin:     R$ 57.665,04       │
│  └─ ≈ 0,00153 BTC → R$ ...         │
│                                      │
│  ┌──────────────────────────────┐    │
│  │   ✅ RESOLVI ECONOMIZAR      │    │
│  └──────────────────────────────┘    │
│                                      │
│  Dados atualizados em 21/02/2026    │
└──────────────────────────────────────┘
```

### Aba 2 — Histórico (inclui métricas, ranking e gráfico)

```
┌──────────────────────────────────────┐
│  ── Resumo ─────────────────────     │
│  Total economizado:    R$ 15.430     │
│  Projeção RF atual:    R$ 16.891     │
│  Projeção BTC atual:   R$ 22.340     │
│                                      │
│  ── Disciplina ─────────────────     │
│  🏆 32 registros | Média: R$ 482/mês│
│                                      │
│  ── Top 5 Maiores ──────────────     │
│  1. R$ 2.500 (15/01/2026)           │
│  2. R$ 1.800 (03/02/2026)           │
│  3. ...                              │
│                                      │
│  ── Gráfico ────────────────────     │
│  📊 [Gráfico: RF vs BTC ao longo    │
│       do tempo]                      │
│                                      │
│  ── Histórico ──────────────────     │
│  ┌────────────────────────────┐      │
│  │ 21/02/2026 — R$ 350,00    │      │
│  │ RF hoje: R$ 351,20        │      │
│  │ BTC hoje: R$ 362,50       │      │
│  ├────────────────────────────┤      │
│  │ 15/02/2026 — R$ 1.200,00  │      │
│  │ RF hoje: R$ 1.203,50      │      │
│  │ BTC hoje: R$ 1.285,00     │      │
│  ├────────────────────────────┤      │
│  │ ...                        │      │
│  └────────────────────────────┘      │
└──────────────────────────────────────┘
```

> ✅ **Decisão: Tudo cabe em 2 abas.** Métricas, ranking e gráfico ficam como seções no topo do Histórico (ScrollView), com a lista abaixo.

---

## 11. Roadmap de Desenvolvimento em Fases

### 🔵 Fase 0 — Setup (1 dia)

- [ ] Inicializar projeto Expo com TypeScript
- [ ] Configurar ESLint + Prettier
- [ ] Instalar dependências (react-navigation, expo-sqlite, zustand)
- [ ] Configurar Top Tabs navigation
- [ ] Criar estrutura de pastas
- [ ] Configurar eas.json para builds

### 🟢 Fase 1 — Banco de Dados (1-2 dias)

- [ ] Implementar conexão SQLite + migrations
- [ ] Criar schema (savings, config, external_data_cache)
- [ ] Implementar savingsRepository (insert, getAll, getTopN, getSums)
- [ ] Implementar configRepository (get, set)
- [ ] Implementar cacheRepository (get, set, isValid)
- [ ] Testar CRUD isoladamente

### 🟡 Fase 2 — Serviços Externos (1-2 dias)

- [ ] Implementar bitcoinService (preço atual + histórico)
- [ ] Implementar selicService (taxa atual)
- [ ] Implementar calculationService (CAGR + juros compostos)
- [ ] Implementar fluxo de inicialização (useInitApp)
- [ ] Implementar Zustand store
- [ ] Testar com dados reais da API
- [ ] Tratar erros de rede + fallback para cache

### 🟠 Fase 3 — Tela Simulador (2-3 dias)

- [ ] Layout da tela com inputs
- [ ] Exibição de dados de mercado (BTC + SELIC)
- [ ] Cálculo e exibição de projeções em tempo real
- [ ] Formatação de moeda BRL e BTC
- [ ] Botão "Resolvi Economizar"
- [ ] Feedback visual (toast/animation) ao salvar
- [ ] Pull-to-refresh para atualizar dados externos

### 🔴 Fase 4 — Tela Histórico (2-3 dias)

- [ ] Lista de economias com projeções atualizadas
- [ ] Totais acumulados (economizado, RF atual, BTC atual)
- [ ] Cálculo de projeção atualizada por registro
- [ ] Seção Top 5 Ranking
- [ ] Seção Índice de Disciplina
- [ ] Empty state (quando não há registros)

### 🟣 Fase 5 — Gráfico + Polish (1-2 dias)

- [ ] Gráfico comparativo RF vs BTC
- [ ] Animações sutis
- [ ] Tratamento de edge cases (valor 0, taxa 0, sem internet)
- [ ] Ícone e splash screen
- [ ] Testes manuais em iOS e Android

### ⚫ Fase 6 — Build & Publicação (1-2 dias)

- [ ] Configurar app.json (nome, bundle id, versão)
- [ ] Gerar builds com EAS Build (iOS + Android)
- [ ] Testar em dispositivos reais
- [ ] Screenshots para stores
- [ ] Submeter para App Store e Google Play

### 📅 Estimativa Total: 9-15 dias

---

## 12. Pontos Críticos e Riscos Técnicos

### 🔴 Risco Alto

| Risco | Impacto | Mitigação |
|---|---|---|
| **CoinGecko rate limit ou indisponibilidade** | App não consegue dados de BTC | Cache agressivo + fallback para último dado válido + mensagem clara ao usuário |
| **CoinGecko mudar/depreciar API gratuita** | Quebra total do fetch BTC | Abstrair em service → trocar para outra API (Binance, Blockchain.info) sem mudar o resto do app |
| **Histórico BTC em BRL não ter 10 anos completos** | CAGR 10 anos impreciso | Usar o ponto mais antigo disponível + ajustar `n` + informar o período real usado |

### 🟡 Risco Médio

| Risco | Impacto | Mitigação |
|---|---|---|
| **Perda de dados ao desinstalar app** | Perde todo histórico | Informar o usuário. Futuro: export/import JSON |
| **Formatação numérica inconsistente entre OS** | UX ruim | Usar funções de formatação próprias, não depender 100% do `Intl` do device |
| **CAGR de BTC extremamente volátil** | Projeções parecem absurdas | Adicionar disclaimer visual: "Baseado em performance passada. Não é garantia de retorno futuro." |

### 🟢 Risco Baixo

| Risco | Impacto | Mitigação |
|---|---|---|
| **SQLite migration falha em update** | Dados corrompidos | Versionamento de schema com try/catch + log |
| **Expo SDK update quebra dependência** | Build falha | Fixar versões no package.json + testar antes de atualizar |

---

## 13. Debate: Expo vs React Native CLI (Bare Workflow)

### O que é Expo?

Expo é uma plataforma/framework sobre o React Native que abstrai configurações nativas (Xcode, Android Studio), oferece bibliotecas pré-configuradas e um serviço de build na nuvem (EAS).

### Análise para este projeto específico

| Critério | Expo | React Native CLI (Bare) |
|---|---|---|
| **Setup inicial** | ✅ `npx create-expo-app` — pronto em 2 min | ⚠️ Precisa configurar Xcode + Android Studio + CocoaPods |
| **SQLite** | ✅ `expo-sqlite` built-in, zero config | ⚠️ `react-native-sqlite-storage` — requer linking manual |
| **Build iOS sem Mac** | ✅ EAS Build compila na nuvem | ❌ Obrigatório ter Mac com Xcode |
| **Build Android** | ✅ EAS Build na nuvem | ⚠️ Precisa Android Studio + JDK configurados |
| **Publicação nas stores** | ✅ EAS Submit automatiza | ⚠️ Manual via Xcode/Play Console |
| **Native Modules customizados** | ✅ Expo SDK 52+ suporta via config plugins | ✅ Controle total |
| **Tamanho do binário** | ⚠️ ~15-25MB (inclui runtime Expo) | ✅ ~8-15MB (só o necessário) |
| **OTA Updates** | ✅ `expo-updates` — push updates sem nova review | ❌ Precisa resubmeter |
| **Complexidade do app** | ✅ App simples, sem módulos nativos custom | N/A |
| **Manutenção a longo prazo** | ✅ Expo mantém compatibilidade | ⚠️ Responsabilidade do dev |
| **Custo** | ✅ Expo/EAS tem tier gratuito (30 builds/mês) | ✅ Zero custo (mas muito mais trabalho) |

### Argumentos a favor do Expo ✅

1. **Zero infraestrutura nativa:** Este app NÃO precisa de módulos nativos customizados. Tudo que precisa (SQLite, fetch, navigation, charts) existe no ecossistema Expo.

2. **Build simplificado:** EAS Build elimina a necessidade de manter Xcode e Android Studio configurados e atualizados. Especialmente útil para builds iOS (não precisa de Mac para compilar).

3. **expo-sqlite é first-class:** A partir do SDK 50+, `expo-sqlite` usa a nova API síncrona e é mantido pela equipe Expo. Não é um wrapper frágil.

4. **OTA Updates:** Se precisar corrigir um bug de cálculo, pode fazer push sem esperar review da Apple.

5. **Expo Router (opcional):** Embora não seja necessário aqui (só 2 telas), se o app crescer, tem suporte built-in.

6. **Tempo de desenvolvimento:** Estimativa com Expo: ~10 dias. Sem Expo: ~15-18 dias (setup nativo, debugging de linking, etc.).

### Argumentos contra o Expo ⚠️

1. **Tamanho do binário:** ~15-25MB vs ~8-15MB no bare. Para um app pessoal, isso é irrelevante.

2. **Dependência do ecossistema Expo:** Se precisar de algo muito custom no futuro, pode haver limitação. Porém, com `expo prebuild`, pode-se "ejetar" a qualquer momento.

3. **EAS Build tier gratuito tem limite:** 30 builds/mês. Suficiente para desenvolvimento, mas builds adicionais custam. Para este projeto, não é problema.

4. **Menos controle sobre configurações nativas:** Resolvido com `app.json` + config plugins para 99% dos casos.

### Veredicto

> **🟢 Expo é a escolha correta e ideal para este projeto.**
>
> Não existe nenhum requisito técnico deste app que justifique a complexidade adicional do React Native CLI bare. O app é 100% client-side, usa apenas bibliotecas standard (SQLite, fetch, navigation, charts), e o Expo oferece build + submit + updates com zero configuração nativa.
>
> A única razão válida para NÃO usar Expo seria se houvesse necessidade de módulos nativos customizados (ex: Bluetooth, AR, processamento de vídeo). **Não é o caso.**
>
> **Recomendação:** Expo SDK 52+ com EAS Build/Submit.

### Fluxo de Build com Expo

```
Desenvolvimento local (Expo Go ou Dev Client)
    │
    ▼
EAS Build (nuvem)
    ├─ iOS: gera .ipa
    └─ Android: gera .aab
    │
    ▼
EAS Submit
    ├─ Apple App Store Connect
    └─ Google Play Console
    │
    ▼
Review & Publicação
```

---

## Próximos Passos

1. **Validar este plano** — discutir pontos que precisam de ajuste
2. **Definir nome final do app** (bundle ID depende disso)
3. **Criar contas de developer** (Apple $99/ano, Google $25 one-time)
4. **Iniciar Fase 0** — setup do projeto

---

*Plano gerado em 21/02/2026 — Compensa App v1.0*
