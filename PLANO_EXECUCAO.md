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

### Requisitos de SDK para as Lojas (Obrigatórios)

| Plataforma | Requisito | Deadline |
|---|---|---|
| **iOS / iPadOS** | Build com **iOS 26 SDK** (Xcode 26+) | A partir de **28/04/2026** |
| **Android** | `targetSdkVersion` **34** (Android 14) mínimo | Já obrigatório |
| **iOS Deployment Target** | iOS 16.0+ (mínimo suportado pelo Expo SDK 52) | — |
| **Android minSdkVersion** | 23 (Android 6.0) — padrão Expo | — |

> ⚠️ **CRÍTICO:** A partir de 28 de abril de 2026, a Apple **rejeita uploads** que não sejam buildados com o iOS 26 SDK. Como o app será submetido após essa data, o EAS Build deve usar **Xcode 26+**. Configurar no `eas.json` a imagem de build correta.

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

  -- Dados do modal de confirmação
  description               TEXT NOT NULL,       -- nome do gasto evitado (ex: "Relógio", "Celular", "Balada")
  investment_type            TEXT NOT NULL,       -- 'RF' (Renda Fixa) ou 'BTC' (Bitcoin)

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

### Modal de Confirmação — "Resolvi Economizar"

Ao clicar no botão, abre um **bottom-sheet modal** que desliza de baixo para cima, com backdrop escuro + blur:

```
┌──────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← backdrop escuro (clique fecha)
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────────┤
│            ──────                    │ ← handle bar (indicador de arraste)
│                                      │
│  💰 Registrar Economia               │ ← título
│  Transforme essa decisão em invest.  │ ← subtítulo
│                                      │
│  ┌──────────────────────────────┐    │
│  │   VALOR ECONOMIZADO          │    │ ← display do valor (vem do input)
│  │       R$ 350,00              │    │    (somente leitura, green text)
│  └──────────────────────────────┘    │
│                                      │
│  O que você deixou de comprar?       │
│  ┌──────────────────────────────┐    │
│  │ Ex: Relógio, celular, balada │    │ ← input de texto (maxLength: 40)
│  └──────────────────────────────┘    │
│                                      │
│  Onde pretende investir?             │
│                                      │
│  ┌─ ◉ ── 📊 ────────────────────┐    │ ← radio option RF (selecionado)
│  │  Renda Fixa                   │    │    borda verde quando selecionado
│  │  Taxa configurada: 12,5% a.a.│    │    detalhe: taxa atual do usuário
│  └──────────────────────────────┘    │
│  ┌─ ○ ── ₿ ─────────────────────┐    │ ← radio option BTC
│  │  Bitcoin                      │    │    borda laranja quando selecionado
│  │  BTC: R$ 650.000,00          │    │    detalhe: preço atual do BTC
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │   ✅ CONFIRMAR                │    │ ← botão verde sólido
│  └──────────────────────────────┘    │    (desabilitado até preencher tudo)
│                                      │
└──────────────────────────────────────┘
```

**Regras do modal:**
- O modal sobe do bottom com animação slide-up + fade no backdrop.
- O **valor economizado** é exibido em destaque (somente leitura, vem do input do simulador).
- O campo "descrição" é **obrigatório** (mín. 1 caractere, máx. 40, texto livre).
- O tipo de investimento é **obrigatório** — uma das duas opções deve ser selecionada (RF pré-selecionado por padrão).
- Cada radio option mostra ícone + nome + detalhe contextual (taxa RF ou preço BTC).
- O botão "Confirmar" fica **desabilitado** até ambos os campos serem preenchidos.
- Clicar no **backdrop escuro** fecha o modal (cancelamento).
- Após confirmar, o modal fecha, o input do simulador limpa, e um feedback visual (toast) aparece.
- O `description` e `investment_type` são salvos junto com o registro na tabela `savings`.

### Aba 2 — Resumo

```
┌──────────────────────────────────────┐
│  ── 💰 Resumo ──────────────────     │
│  Total economizado:    R$ 15.430     │
│                                      │
│  Projeção Investida:   R$ 18.605     │
│  ▲ +R$ 3.175,80 (+20,58%)           │
│  ┌─────────────┬─────────────┐       │
│  │ 🟢 Em RF    │ 🟠 Em BTC   │       │
│  │ R$ 9.562,30 │ R$ 9.043,50 │       │
│  │ 18 reg.     │ 14 reg.     │       │
│  └─────────────┴─────────────┘       │
│                                      │
│  ── 🏆 Disciplina ─────────────     │
│  32 registros | Média: R$ 482/mês   │
│  🔥 5 meses seguidos                 │
│                                      │
│  ── 🥇 Top 5 Maiores ──────────     │
│  1. R$ 2.500 (15/01/2026)           │
│     🏷️ Tênis            📊 RF       │
│  2. R$ 1.800 (03/02/2026)           │
│     🏷️ Celular           ₿ BTC      │
│  3. R$ 1.500 (22/12/2025)           │
│     🏷️ Viagem            ₿ BTC      │
│  4. ...                              │
└──────────────────────────────────────┘
```

> 🏷️ **Ranking com contexto:** Cada item do Top 5 exibe, além do valor e data, a descrição do gasto evitado e um badge com o tipo de investimento escolhido (📊 RF em verde ou ₿ BTC em laranja). Isso dá significado emocional ao ranking, reforçando a decisão comportamental.

> **Lógica da Projeção Investida:** Para cada registro de economia, utiliza-se a projeção correspondente ao tipo de investimento escolhido (RF ou BTC). O total é a soma das projeções individuais com base na escolha de cada registro. Isso representa o retorno real esperado conforme as decisões do usuário.

### Aba 3 — Histórico (gráfico e lista)

```
┌──────────────────────────────────────┐
│  ── 📊 Gráfico ────────────────     │
│  [Gráfico: RF vs BTC ao longo       │
│   do tempo]                          │
│                                      │
│  ── Histórico ──────────────────     │
│  ┌────────────────────────────┐      │
│  │🟠 21/02/2026 — R$ 350,00  │      │
│  │ 🏷️ Balada       ₿ Bitcoin  │      │
│  │ RF hoje: R$ 351,20        │      │
│  │ BTC hoje: R$ 362,50       │      │
│  ├────────────────────────────┤      │
│  │🟢 15/02/2026 — R$ 1.200   │      │
│  │ 🏷️ Relógio    📊 Renda Fixa│      │
│  │ RF hoje: R$ 1.204,80      │      │
│  │ BTC hoje: R$ 1.285,00     │      │
│  ├────────────────────────────┤      │
│  │ ...                        │      │
│  └────────────────────────────┘      │
└──────────────────────────────────────┘
```

> 🎨 **Borda lateral:** Cada item no histórico possui uma borda esquerda sutil (3px) colorida pelo tipo de investimento escolhido: verde para RF, laranja para BTC. Abaixo do header, uma linha meta exibe a descrição (🏷️) e um badge do tipo de investimento. As projeções em ambos (RF e BTC) continuam visíveis para comparação.

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
- [ ] Modal de confirmação (campo descrição + seleção RF/BTC)
- [ ] Validação do modal (descrição obrigatória + tipo obrigatório)
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

### ⚫ Fase 6 — Compliance & Preparação para Lojas (1-2 dias)

- [ ] Criar página de Política de Privacidade (hospedagem pública)
- [ ] Implementar tela/seção de Privacy Policy no app
- [ ] Implementar tela/seção de Termos de Uso no app
- [ ] Adicionar disclaimer financeiro no Simulador
- [ ] Adicionar atribuição "Powered by CoinGecko" no Simulador
- [ ] Adicionar `accessibilityLabel` em todos os componentes interativos
- [ ] Configurar `ITSAppUsesNonExemptEncryption = false` no app.json
- [ ] Testar VoiceOver (iOS) e TalkBack (Android) básicos

### ⬛ Fase 7 — Build & Publicação (2-3 dias)

- [ ] Configurar app.json completo (nome, bundle id, versão, ícone, splash)
- [ ] Configurar eas.json com imagens de build para iOS 26 SDK
- [ ] Criar contas de desenvolvedor (Apple $99/ano + Google $25)
- [ ] Gerar builds com EAS Build (iOS + Android)
- [ ] Testar em dispositivos reais (iOS + Android)
- [ ] Criar ícone do app (1024×1024 para iOS, 512×512 para Android)
- [ ] Criar splash screen (seguindo tema dark do app)
- [ ] Tirar screenshots para as lojas (todos os tamanhos)
- [ ] Criar Feature Graphic para Google Play (1024×500)
- [ ] Preencher App Store Connect (metadata, screenshots, keywords, privacy labels)
- [ ] Preencher Google Play Console (metadata, screenshots, data safety, IARC)
- [ ] Hospedar Privacy Policy em URL pública
- [ ] Submeter para Apple App Store via EAS Submit
- [ ] Submeter para Google Play via EAS Submit
- [ ] Responder a eventuais feedbacks do App Review

### 📅 Estimativa Total: 11-18 dias

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

## 14. Requisitos para Apple App Store (iOS)

### 14.1 Conta e Certificados

| Item | Detalhe |
|---|---|
| **Apple Developer Program** | US$ 99/ano. Pessoa física ou jurídica (CNPJ). |
| **Bundle ID** | `com.compensaapp.compensa` (definir antes do primeiro build) |
| **App Store Connect** | Criar app record com bundle ID correspondente |
| **Certificados** | Gerenciados automaticamente pelo EAS Build |
| **Provisioning Profiles** | Gerenciados automaticamente pelo EAS Build |

### 14.2 Requisitos de Build (Abril 2026+)

| Requisito | Valor |
|---|---|
| **Xcode** | 26+ (obrigatório a partir de 28/04/2026) |
| **iOS SDK** | iOS 26 SDK |
| **Deployment Target mínimo** | iOS 16.0 |
| **Arquitetura** | arm64 (64-bit obrigatório) |
| **Imagem EAS Build** | Configurar `"image": "latest"` ou imagem compatível com Xcode 26 no `eas.json` |
| **IPv6** | App **deve** funcionar em redes IPv6-only (Guideline 2.5.5) |

### 14.3 App Store Connect — Metadata Obrigatório

| Campo | Valor Planejado | Obrigatório? |
|---|---|---|
| **Nome do App** | Compensa (máx. 30 caracteres) | ✅ |
| **Subtítulo** | "Economize. Invista. Compare." (máx. 30 chars) | Opcional mas recomendado |
| **Descrição** | Texto descritivo do app, funcionalidades, disclaimer financeiro | ✅ |
| **Keywords** | economia, investimento, simulador, bitcoin, renda fixa, poupança, finanças pessoais | ✅ |
| **Categoria Primária** | Finance | ✅ |
| **Categoria Secundária** | Utilities | Opcional |
| **URL de Suporte** | URL do site/página de suporte | ✅ |
| **URL de Marketing** | URL do site/landing page | Opcional |
| **URL da Política de Privacidade** | URL pública com a Privacy Policy | ✅ (obrigatório) |
| **Ícone do App** | 1024×1024 PNG (sem transparência, sem cantos arredondados) | ✅ |
| **Screenshots** | Mínimo 1 por tamanho de tela suportado | ✅ |
| **Classificação Etária** | Responder questionário (ver seção 14.5) | ✅ |
| **Copyright** | © 2026 [Nome do desenvolvedor] | ✅ |
| **Versão** | 1.0.0 | ✅ |
| **Informações de Contato** | Email de suporte visível | ✅ (Guideline 1.5) |
| **Compliance de Exportação** | Declarar uso de criptografia (ver 14.7) | ✅ |
| **App Review Notes** | Instruções para os revisores (ver 14.9) | Recomendado |

### 14.4 Screenshots para App Store

| Dispositivo | Tamanho (px) | Qtd Mínima |
|---|---|---|
| iPhone 6.9" (16 Pro Max) | 1320 × 2868 | 3 (recomendado 5-8) |
| iPhone 6.3" (16 Pro) | 1206 × 2622 | 3 |
| iPhone 6.7" (15 Plus / 14 Pro Max) | 1290 × 2796 | Recomendado |
| iPhone 6.5" (11 Pro Max) | 1284 × 2778 | Recomendado |
| iPhone 5.5" (8 Plus) | 1242 × 2208 | Recomendado se suportar |
| iPad Pro 13" | 2048 × 2732 | Se suportar iPad |

> **Conteúdo sugerido dos screenshots:**
> 1. Tela do Simulador com valor preenchido e projeções
> 2. Modal "Resolvi Economizar" com descrição e tipo
> 3. Tela de Resumo com totais e ranking
> 4. Tela de Histórico com gráfico e lista
> 5. Detalhe das projeções comparativas (RF vs BTC)

### 14.5 Classificação Etária (Age Rating)

O sistema de classificação etária da Apple foi atualizado em julho de 2025, agora com faixas: **4+, 9+, 13+, 16+ e 18+**.

**Respostas ao questionário de classificação:**

| Pergunta | Resposta | Justificativa |
|---|---|---|
| Cartoon or Fantasy Violence | None | App não contém violência |
| Realistic Violence | None | App não contém violência |
| Sexual Content | None | Sem conteúdo sexual |
| Profanity or Crude Humor | None | Sem linguagem inapropriada |
| Drug, Alcohol, Tobacco Use | None | Sem referências |
| Gambling or Contests | None | Simulações de investimento ≠ gambling |
| Simulated Gambling | None | Projeções são educacionais, não apostas |
| Horror/Fear Themes | None | Sem conteúdo assustador |
| Medical/Treatment Info | None | Não é app de saúde |
| Mature/Suggestive Themes | None | Sem temas maduros |
| Unrestricted Web Access | No | App não navega na web |
| User-Generated Content | No | Dados são pessoais, sem compartilhamento |
| In-App Controls | No | Sem controle parental necessário |

**Classificação esperada: 4+**

> ⚠️ As novas perguntas de classificação etária devem ser respondidas até **31/01/2026** para apps existentes. Para novos apps, respondê-las no momento da submissão.

### 14.6 Política de Privacidade (Privacy Policy) — Obrigatória

**Guideline 5.1.1(i):** Toda app DEVE ter uma política de privacidade acessível:
1. No campo de metadata do App Store Connect (URL pública)
2. Dentro do app, em local facilmente acessível

**Conteúdo obrigatório da Privacy Policy:**

```
POLÍTICA DE PRIVACIDADE — COMPENSA APP

Última atualização: [data]

1. DADOS COLETADOS
   O Compensa App é um aplicativo 100% offline-first. 
   NÃO coletamos, armazenamos ou transmitimos dados pessoais 
   a servidores externos.

   Dados armazenados LOCALMENTE no dispositivo:
   - Valores de economias registradas pelo usuário
   - Descrições de gastos evitados (texto livre)
   - Configuração de taxa de renda fixa
   - Cache de dados de mercado (preço BTC, taxa SELIC)

2. DADOS DE MERCADO
   O app faz requisições a APIs públicas para obter 
   dados de mercado:
   - CoinGecko API (preço e histórico do Bitcoin)
   - Banco Central do Brasil API (taxa SELIC)
   
   Estas requisições NÃO incluem dados pessoais do usuário.
   Nenhum identificador do dispositivo é enviado.

3. TERCEIROS
   O app NÃO utiliza:
   - Analytics de terceiros
   - Redes de publicidade
   - SDKs de rastreamento
   - Serviços de crash reporting com dados pessoais

4. ARMAZENAMENTO E SEGURANÇA
   Todos os dados ficam no sandbox do aplicativo no dispositivo,
   protegidos pelo sistema operacional (iOS Keychain-level 
   filesystem protection / Android app sandbox).
   
   Não há backup em nuvem dos dados do app 
   (exceto se o usuário tiver backup automático do dispositivo).

5. COMPARTILHAMENTO
   O app NÃO compartilha dados com terceiros.

6. RETENÇÃO E EXCLUSÃO
   Os dados são retidos enquanto o app estiver instalado.
   Para excluir todos os dados: desinstale o app.
   Funcionalidade de exclusão individual de registros 
   disponível dentro do app.

7. CRIANÇAS
   O app não é direcionado a crianças menores de 13 anos.
   Não coletamos intencionalmente dados de crianças.

8. LGPD (Lei Geral de Proteção de Dados — Brasil)
   Em conformidade com a LGPD (Lei 13.709/2018):
   - Base legal: consentimento do usuário ao usar o app
   - Dados são exclusivamente locais (não há controlador externo)
   - Direito de exclusão: desinstalar o app ou excluir registros
   - Direito de acesso: todos os dados são visíveis no app

9. ALTERAÇÕES
   Reservamo-nos o direito de atualizar esta política.
   Alterações serão refletidas na data de "última atualização".

10. CONTATO
    Para dúvidas sobre privacidade: [email de contato]
```

> **Hospedagem:** A Privacy Policy deve estar em uma URL pública acessível (pode ser uma página no GitHub Pages, Notion público, ou site simples). Esta URL será referenciada no App Store Connect e dentro do app.

### 14.7 App Privacy Details (Privacy Nutrition Labels)

No App Store Connect, é obrigatório declarar as práticas de dados do app.

**Declaração do Compensa App:**

| Pergunta | Resposta |
|---|---|
| Does your app collect data? | **No** — o app não coleta dados que saem do dispositivo |
| Data linked to user? | **None** |
| Data used to track? | **None** |
| Data types collected | **None** (dados ficam exclusivamente no device) |

> A declaração "Data Not Collected" é válida porque TODOS os dados ficam no dispositivo local. As requisições a APIs externas (CoinGecko, BCB) são GET requests sem nenhum dado do usuário.

### 14.8 Compliance de Exportação (Export Compliance)

**Guideline relevante:** Apps distribuídas fora dos EUA estão sujeitas a leis de exportação dos EUA.

| Pergunta | Resposta | Justificativa |
|---|---|---|
| Your app uses encryption? | **Yes** — usa HTTPS (via `fetch`) | Qualquer uso de HTTPS conta como criptografia |
| Is the encryption limited to standard HTTPS/TLS? | **Yes** | Somente HTTPS para APIs públicas |
| Available on French App Store? | Sim | — |
| Qualifies for exemption? | **Yes** — usa apenas criptografia padrão do OS | Exemption via `ITSAppUsesNonExemptEncryption = NO` |

**Configurar no `app.json`:**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    }
  }
}
```

> Isso evita que o App Store Connect pergunte sobre criptografia a cada upload.

### 14.9 App Review Notes (Template para Revisão)

Texto a incluir no campo "Notes for App Review" ao submeter:

```
ABOUT THIS APP:
Compensa App is a personal finance behavioral tool. 
It helps users simulate what would happen if they invested 
money instead of spending it. All data is stored locally 
on the device only.

NO ACCOUNT REQUIRED:
The app does not require any account creation or login. 
It works entirely offline after the initial market data fetch.

DATA SOURCES:
- Bitcoin price: CoinGecko public API (no API key)
- SELIC rate: Brazilian Central Bank public API (no auth)

FINANCIAL DISCLAIMER:
This app is a simulator for educational purposes only. 
It does not provide financial advice and does not execute 
any real transactions or investments.

NO IN-APP PURCHASES:
The app is completely free with no monetization.
```

### 14.10 Guidelines Relevantes para este App

| Guideline | Descrição | Status |
|---|---|---|
| **2.1** App Completeness | App deve ser completa, sem placeholders | A implementar |
| **2.3.6** Age Rating | Responder questionário honestamente | Definido (4+) |
| **2.3.7** Metadata | Nome ≤ 30 chars, sem termos enganosos | ✅ |
| **2.5.1** Public APIs | Usar apenas APIs públicas | ✅ (Expo) |
| **2.5.5** IPv6 | Funcionar em redes IPv6-only | ✅ (fetch nativo) |
| **3.2.1(viii)** Financial Apps | "Apps for financial trading/investing should be submitted by the financial institution" | ⚠️ **NÃO SE APLICA** — o app é um simulador educacional, não executa operações financeiras reais |
| **4.2** Minimum Functionality | App deve ter funcionalidade real, não ser apenas um site | ✅ |
| **5.1.1(i)** Privacy Policy | URL pública + acessível no app | A implementar |
| **5.1.1(ii)** Consent | Obter consentimento para coleta de dados | ✅ (não coleta dados) |
| **5.1.1(iii)** Data Minimization | Coletar apenas dados necessários | ✅ |
| **5.1.2** Data Use | Não compartilhar dados sem consentimento | ✅ (zero compartilhamento) |
| **1.5** Developer Information | Info de contato acessível | A implementar |

> ⚠️ **Sobre a Guideline 3.2.1(viii):** O Compensa App **não é** um app de trading, investimento ou gestão de dinheiro real. É um **simulador comportamental educacional** que mostra projeções hipotéticas. Ele não acessa contas bancárias, não executa transações, não movimenta dinheiro, e não requer licenciamento financeiro. A descrição no App Store deve deixar isso explícito: **"Simulador educacional de comportamento financeiro. Não constitui aconselhamento ou recomendação de investimento."**

---

## 15. Requisitos para Google Play Store (Android)

### 15.1 Conta e Configuração

| Item | Detalhe |
|---|---|
| **Google Play Developer Account** | US$ 25 (pagamento único, definitivo) |
| **Package Name** | `com.compensaapp.compensa` (mesmo padrão do bundle ID) |
| **Google Play Console** | Criar app e preencher ficha da loja |
| **Assinatura do App** | Play App Signing (gerenciado pelo Google) via EAS |

### 15.2 Requisitos de Build

| Requisito | Valor |
|---|---|
| **Formato** | AAB (Android App Bundle) — obrigatório desde 2021 |
| **targetSdkVersion** | 34 (Android 14) — obrigatório para novos apps |
| **minSdkVersion** | 23 (Android 6.0) — padrão Expo |
| **compileSdkVersion** | 34+ |
| **Kotlin/Java** | Gerenciado pelo Expo/EAS Build |

### 15.3 Google Play Console — Metadata Obrigatório

| Campo | Valor Planejado | Obrigatório? |
|---|---|---|
| **Título do app** | Compensa - Simulador de Investimento | ✅ (máx. 30 chars) |
| **Descrição curta** | Simule o retorno se investisse em vez de gastar | ✅ (máx. 80 chars) |
| **Descrição completa** | Texto descritivo com funcionalidades + disclaimer | ✅ (máx. 4000 chars) |
| **Ícone** | 512×512 PNG (32-bit, sem transparência) | ✅ |
| **Feature Graphic** | 1024×500 PNG/JPG | ✅ |
| **Screenshots** | Mín. 2, recomendado 8 (por tipo de dispositivo) | ✅ |
| **Categoria** | Finance | ✅ |
| **Tags** | simulador, investimento, economia, bitcoin | ✅ |
| **Email de contato** | Email visível público | ✅ |
| **URL de Política de Privacidade** | Mesma URL pública da Apple | ✅ |
| **Classificação de conteúdo** | Preencher questionário IARC | ✅ |

### 15.4 Data Safety (Declaração de Dados)

Desde julho de 2022, o Google Play exige declaração de práticas de dados.

| Pergunta | Resposta |
|---|---|
| Does your app collect user data? | **No** |
| Does your app share user data with third parties? | **No** |
| Data types collected | **None** |
| Is data encrypted in transit? | **Yes** (HTTPS para APIs) |
| Can users request data deletion? | **Yes** (desinstalar app ou excluir registros) |
| Does your app follow Google Play Families Policy? | **N/A** (não é app para crianças) |

### 15.5 Classificação de Conteúdo (IARC)

Preencher questionário IARC no Google Play Console.

**Classificação esperada: Livre** (equivalente a PEGI 3 / ESRB Everyone)

| Critério | Resposta |
|---|---|
| Violência | Não |
| Sexualidade | Não |
| Linguagem | Não |
| Substâncias controladas | Não |
| Gambling / Apostas | Não — simulação educacional, sem dinheiro real |
| Conteúdo gerado por usuário | Não (dados pessoais, sem sharing) |
| Publicidade | Não |

### 15.6 Políticas Relevantes do Google Play

| Política | Impacto | Status |
|---|---|---|
| **Financial Services** | Apps que fornecem serviços financeiros precisam de disclosure | ⚠️ App é simulador, não serviço financeiro — incluir disclaimer |
| **Deceptive Behavior** | Não enganar sobre funcionalidade | ✅ |
| **Ads** | Se sem ads, não se aplica | ✅ (sem ads) |
| **User Data** | Declaração de Data Safety | A preencher |
| **Families Policy** | Se o app for para crianças | N/A |
| **Permissions** | Não solicitar permissões desnecessárias | ✅ (zero permissões) |

---

## 16. Compliance Legal e Regulatório

### 16.1 LGPD — Lei Geral de Proteção de Dados (Brasil)

Como o app é voltado para o público brasileiro (moeda BRL, taxa SELIC), a LGPD se aplica.

| Requisito LGPD | Como o app cumpre |
|---|---|
| **Base legal para tratamento** | Consentimento (ao usar o app, o usuário consente) |
| **Finalidade** | Simulação comportamental financeira pessoal |
| **Minimização de dados** | Apenas dados inseridos voluntariamente pelo usuário |
| **Transparência** | Privacy Policy acessível no app |
| **Direito de acesso** | Todos os dados são visíveis no app |
| **Direito de exclusão** | Desinstalar o app ou excluir registros individualmente |
| **Compartilhamento** | Zero — dados não saem do dispositivo |
| **Segurança** | Sandbox do OS (iOS/Android) + SQLite local |
| **Controlador** | O próprio usuário (dados ficam apenas no device dele) |

> **Nota:** Como os dados NUNCA saem do dispositivo e não há servidor backend, o risco LGPD é mínimo. Não há necessidade de DPO (Data Protection Officer) nem registro na ANPD para este caso.

### 16.2 Termos de Uso do App

O app deve ter **Termos de Uso** acessíveis dentro do app (recomendado, não obrigatório pela Apple para apps gratuitos sem account, mas boa prática).

**Conteúdo dos Termos de Uso:**

```
TERMOS DE USO — COMPENSA APP

1. ACEITAÇÃO
   Ao utilizar o Compensa App, você concorda com estes termos.

2. NATUREZA DO APP
   O Compensa App é um simulador educacional de comportamento 
   financeiro. Ele NÃO é e NÃO substitui:
   - Assessoria ou consultoria de investimentos
   - Recomendação de compra ou venda de ativos
   - Plataforma de negociação de ativos
   - Serviço financeiro regulamentado

3. PROJEÇÕES E SIMULAÇÕES
   Todas as projeções exibidas são HIPOTÉTICAS e baseadas em:
   - Performance histórica passada (Bitcoin CAGR)
   - Taxas definidas pelo próprio usuário (Renda Fixa)
   
   PERFORMANCE PASSADA NÃO É GARANTIA DE RESULTADOS FUTUROS.
   
   Os valores apresentados são meramente ilustrativos e não 
   devem ser usados como base para decisões de investimento.

4. DADOS DE MERCADO
   O app utiliza dados de fontes públicas (CoinGecko, Banco 
   Central do Brasil). Não garantimos a precisão, completude 
   ou disponibilidade contínua destes dados.

5. ISENÇÃO DE RESPONSABILIDADE
   O desenvolvedor NÃO se responsabiliza por:
   - Decisões financeiras tomadas com base nas simulações
   - Perdas financeiras de qualquer natureza
   - Indisponibilidade temporária de dados de mercado
   - Imprecisões nos cálculos ou dados exibidos

6. DADOS DO USUÁRIO
   Todos os dados inseridos são armazenados exclusivamente 
   no dispositivo do usuário. Consulte a Política de Privacidade.

7. PROPRIEDADE INTELECTUAL
   O app, seu design, código e conteúdo são de propriedade 
   do desenvolvedor, protegidos por leis de direitos autorais.

8. ALTERAÇÕES
   Estes termos podem ser atualizados a qualquer momento.
   O uso continuado do app após alterações constitui aceitação.

9. LEGISLAÇÃO APLICÁVEL
   Estes termos são regidos pelas leis da República Federativa 
   do Brasil.
```

### 16.3 Disclaimer Financeiro (Obrigatório no App)

O disclaimer deve aparecer em **três locais**:

1. **No Simulador** — texto pequeno abaixo das projeções:
   > *"Projeções baseadas em performance passada. Não é garantia de retorno futuro. Não constitui recomendação de investimento."*

2. **Na descrição da App Store / Google Play:**
   > *"Este app é um simulador educacional. Não presta assessoria financeira, não executa operações e não substitui orientação profissional."*

3. **Nos Termos de Uso** — seção 3 (já incluída acima).

### 16.4 CoinGecko API — Termos de Uso

| Requisito CoinGecko (Free Tier) | Status |
|---|---|
| Rate limit: 10-30 req/min | ✅ (~2-3 req por abertura do app) |
| Atribuição obrigatória | ⚠️ **SIM** — incluir "Powered by CoinGecko" |
| Uso comercial (free tier) | Permitido com atribuição |
| Sem redistribuição dos dados | ✅ (dados usados apenas internamente) |

> **Implementar:** Texto "Dados de mercado: CoinGecko" no rodapé do Simulador, link para coingecko.com.

---

## 17. Acessibilidade

### 17.1 Requisitos

A Apple valoriza fortemente acessibilidade na revisão. Embora não seja motivo de rejeição explícito, apps acessíveis têm melhor recepção e cumprem regulamentações.

| Requisito | Implementação |
|---|---|
| **VoiceOver (iOS)** | Todos os componentes com `accessibilityLabel` e `accessibilityHint` |
| **TalkBack (Android)** | Mesmas props de acessibilidade (React Native é cross-platform) |
| **Dynamic Type (iOS)** | Respeitar tamanho de fonte configurado pelo sistema (usar `allowFontScaling`) |
| **Contraste mínimo** | Ratio 4.5:1 para texto normal, 3:1 para texto grande (WCAG AA) |
| **Touch targets** | Mínimo 44×44 pontos (Apple HIG) / 48×48 dp (Material Design) |
| **Roles semânticos** | `accessibilityRole` em botões, inputs, headers |
| **Redução de movimento** | Respeitar `prefers-reduced-motion` para animações |
| **Screen reader ordering** | Ordem lógica de leitura nos componentes |

### 17.2 Validação de Contraste (Tema Escuro)

| Elemento | Cor | Fundo | Ratio | Status |
|---|---|---|---|---|
| Texto primário | #ffffff | #0a0a0f | 21:1 | ✅ |
| Texto secundário | #a0a0b8 | #0a0a0f | 7.5:1 | ✅ |
| Texto muted | #555570 | #0a0a0f | 3.2:1 | ⚠️ Apenas decorativo |
| Texto verde | #00e69a | #0a0a0f | 10.2:1 | ✅ |
| Texto sobre card | #ffffff | #12121e | 17.5:1 | ✅ |

---

## 18. Ícone e Splash Screen

### 18.1 Requisitos do Ícone

**Apple App Store:**
- 1024×1024 px PNG, sem transparência, sem cantos arredondados (o sistema aplica)
- A partir do iOS 26: suporte a **Liquid Glass** via Icon Composer (novo formato de ícone multicamada)
- Ícone deve ser representativo e reconhecível em tamanhos pequenos

**Google Play:**
- 512×512 px PNG, 32-bit com alpha
- Feature Graphic: 1024×500 px

**Expo `app.json`:**
```json
{
  "icon": "./assets/icon.png",                    // 1024×1024
  "ios": { "icon": "./assets/ios-icon.png" },      // 1024×1024
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon-fg.png",  // 432×432
      "backgroundColor": "#0a0a0f"
    }
  }
}
```

### 18.2 Splash Screen

```json
{
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#0a0a0f"
  }
}
```

---

## 19. Descrição para as Lojas

### 19.1 Descrição App Store (Português — Brasil)

```
Compensa — Simulador de Investimento Comportamental

Já pensou quanto teria hoje se tivesse investido em vez de gastar?

O Compensa simula o retorno financeiro que você teria se, em vez de 
comprar algo, tivesse investido o dinheiro em Renda Fixa ou Bitcoin.

📊 SIMULE
• Digite o valor que pensou em gastar
• Compare projeções de Renda Fixa e Bitcoin
• Veja quanto renderia em 1, 5 e 10 anos

💰 REGISTRE
• Decida economizar e registre sua escolha
• Nomeie o gasto que evitou
• Escolha entre Renda Fixa ou Bitcoin

📈 ACOMPANHE
• Veja o total acumulado e a projeção investida
• Acompanhe seu índice de disciplina
• Confira o ranking das suas maiores economias
• Visualize o crescimento em gráfico comparativo

🔒 PRIVACIDADE
• 100% offline — dados ficam apenas no seu dispositivo
• Sem cadastro, sem login, sem conta
• Sem anúncios, sem rastreamento

⚠️ IMPORTANTE
Este app é um simulador educacional. Não constitui 
assessoria financeira nem recomendação de investimento. 
Performance passada não é garantia de resultados futuros.

Dados de mercado fornecidos por CoinGecko e Banco Central do Brasil.
```

### 19.2 Palavras-chave (App Store)

`economia,investimento,simulador,bitcoin,renda fixa,poupança,finanças,dinheiro,compensa,comportamento,projeção`

---

## 20. Configuração `app.json` Completa

```json
{
  "expo": {
    "name": "Compensa",
    "slug": "compensa-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "scheme": "compensa",

    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0f"
    },

    "ios": {
      "bundleIdentifier": "com.compensaapp.compensa",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "CFBundleDevelopmentRegion": "pt-BR",
        "NSSupportsLiveActivities": false
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },

    "android": {
      "package": "com.compensaapp.compensa",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0a0a0f"
      },
      "permissions": []
    },

    "plugins": [
      "expo-sqlite"
    ],

    "extra": {
      "eas": {
        "projectId": "[A ser definido após criar projeto no EAS]"
      }
    }
  }
}
```

---

## 21. Configuração `eas.json`

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "image": "latest",
        "autoIncrement": "buildNumber"
      },
      "android": {
        "image": "latest",
        "autoIncrement": "versionCode",
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "[Apple ID do desenvolvedor]",
        "ascAppId": "[App Store Connect App ID]",
        "appleTeamId": "[Team ID]"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## 22. Checklist Completo de Pré-Submissão

### Apple App Store

- [ ] Apple Developer Account ativa ($99/ano pago)
- [ ] Bundle ID registrado no Apple Developer Portal
- [ ] App Record criado no App Store Connect
- [ ] Build compilada com iOS 26 SDK (Xcode 26+) via EAS Build
- [ ] Ícone 1024×1024 sem transparência
- [ ] Screenshots para todos os tamanhos de tela requeridos
- [ ] Descrição completa em português (BR)
- [ ] Keywords definidas (máx. 100 chars)
- [ ] Categoria: Finance
- [ ] URL de Política de Privacidade (pública, acessível)
- [ ] Política de Privacidade acessível DENTRO do app
- [ ] Termos de Uso acessíveis dentro do app
- [ ] Questionário de classificação etária respondido (4+)
- [ ] Privacy Nutrition Labels preenchidas ("Data Not Collected")
- [ ] Export Compliance: `ITSAppUsesNonExemptEncryption = false`
- [ ] App Review Notes preenchidas
- [ ] Email de suporte configurado
- [ ] Copyright definido
- [ ] Disclaimer financeiro visível no app
- [ ] Atribuição CoinGecko visível
- [ ] App funciona em redes IPv6-only
- [ ] Testada em dispositivo real iOS
- [ ] Acessibilidade básica (VoiceOver funcional)
- [ ] Sem console.log em produção
- [ ] Sem crashes na inicialização

### Google Play Store

- [ ] Google Play Developer Account ativa ($25 pago)
- [ ] Package name definido
- [ ] App Record criado no Google Play Console
- [ ] Build AAB compilada com targetSdkVersion 34
- [ ] Ícone 512×512
- [ ] Feature Graphic 1024×500
- [ ] Screenshots (mín. 2 por tipo de dispositivo)
- [ ] Descrição curta (≤80 chars) e completa (≤4000 chars)
- [ ] Classificação de conteúdo IARC preenchida
- [ ] Data Safety preenchida
- [ ] URL de Política de Privacidade (pública)
- [ ] Email de contato do desenvolvedor
- [ ] Disclaimer financeiro na descrição
- [ ] Testada em dispositivo real Android
- [ ] Sem permissões desnecessárias (a lista deve ser vazia)
- [ ] Sem ANRs (Application Not Responding)

---

*Plano atualizado em 22/02/2026 — Compensa App v1.0*
