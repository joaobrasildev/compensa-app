# Compensa App — Plano de Implementação

> Simulador comportamental financeiro. "Quanto você teria se tivesse investido em vez de gastar?"
> 100% client-side. Sem backend, sem login, sem ads. Dados ficam no dispositivo.

### ⚠️ REFERÊNCIA VISUAL OBRIGATÓRIA

O arquivo `prototype/index.html` é o protótipo visual validado do app. **Consulte-o antes de implementar qualquer componente.** Ele contém o layout exato, espaçamentos, hierarquia visual, estilos internos de cada componente e a composição entre elementos. O app React Native deve replicar fielmente o visual desse protótipo. Abra-o para extrair estrutura de layout, margens, paddings, bordas, sombras e qualquer detalhe visual não descrito neste documento.

---

## 1. Stack & Dependências

| Pacote | Versão |
|---|---|
| Expo SDK | 52+ |
| React Native | ~0.76 |
| TypeScript | 5.x (strict: true) |
| expo-sqlite | SDK 52+ |
| @react-navigation/native | 7.x |
| @react-navigation/material-top-tabs | 7.x |
| react-native-pager-view | última |
| react-native-screens | última |
| react-native-safe-area-context | última |
| zustand | 5.x |
| react-native-chart-kit ou victory-native | última estável |
| expo-linear-gradient | última |

**Build:** EAS Build + EAS Submit.
**iOS:** Build com iOS 26 SDK (Xcode 26+), deployment target iOS 16.0.
**Android:** targetSdkVersion 34, minSdkVersion 23, formato AAB.

---

## 2. Estrutura de Pastas

```
src/
├── theme/
│   └── index.ts                  # Tokens: cores, fontes, spacing, radii, sizes
│
├── components/
│   ├── base/
│   │   ├── AppText.tsx
│   │   ├── AppTextInput.tsx
│   │   ├── AppButton.tsx
│   │   ├── Card.tsx
│   │   ├── SectionTitle.tsx
│   │   ├── Badge.tsx
│   │   ├── Chip.tsx
│   │   ├── AppModal.tsx
│   │   ├── RadioOption.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingOverlay.tsx
│   │
│   └── composed/
│       ├── MarketChips.tsx
│       ├── ProjectionCard.tsx
│       ├── ProjectionGroup.tsx
│       ├── SummaryCards.tsx
│       ├── DisciplineStats.tsx
│       ├── RankingList.tsx
│       ├── GrowthChart.tsx
│       ├── HistoryItem.tsx
│       ├── HistoryList.tsx
│       ├── DeleteConfirmModal.tsx
│       ├── SaveButton.tsx
│       ├── SaveModal.tsx
│       ├── DisclaimerText.tsx
│       └── AttributionFooter.tsx
│
├── screens/
│   ├── SimulatorScreen.tsx
│   ├── SummaryScreen.tsx
│   ├── HistoryScreen.tsx
│   └── LegalScreen.tsx
│
├── navigation/
│   └── TopTabNavigator.tsx
│
├── stores/
│   ├── useMarketStore.ts
│   ├── useSavingsStore.ts
│   ├── useConfigStore.ts
│   └── useAppStore.ts
│
├── rules/
│   ├── projectionRules.ts
│   ├── savingsRules.ts
│   ├── disciplineRules.ts
│   └── formatRules.ts
│
├── services/
│   ├── bitcoinService.ts
│   ├── selicService.ts
│   └── initService.ts
│
├── repositories/
│   ├── database.ts
│   ├── savingsRepository.ts
│   ├── configRepository.ts
│   └── cacheRepository.ts
│
├── hooks/
│   ├── useInitApp.ts
│   ├── useProjections.ts
│   └── useCurrencyInput.ts
│
├── utils/
│   └── debounce.ts
│
└── App.tsx
```

**Path alias:** `@/*` → `src/*` (configurar em `tsconfig.json`).

---

## 3. Design System — `src/theme/index.ts`

Arquivo único de tokens. Todos os `StyleSheet.create()` importam daqui.

### 🚨 REGRA CRÍTICA — ZERO ESTILOS AVULSOS

> **É TERMINANTEMENTE PROIBIDO inserir valores literais de estilo (cores hex/rgba, números de fontSize, padding, margin, borderRadius, borderWidth, opacity, zIndex, letterSpacing, fontWeight, etc.) diretamente nos componentes.**
>
> **TODO valor visual DEVE vir de `src/theme/index.ts`.**
>
> Se um token não existe, ele deve ser **criado no theme** antes de ser usado.
>
> Exemplos de violação:
> ```ts
> // ❌ PROIBIDO
> { fontSize: 13, borderRadius: 5, color: '#1a1a2e', opacity: 0.4 }
>
> // ✅ CORRETO
> { fontSize: sizes.textMd, borderRadius: sizes.badgeRadius, color: colors.bgCardHover, opacity: opacity.disabled }
> ```
>
> Esta regra se aplica a TODOS os arquivos: componentes base, compostos, telas e qualquer `StyleSheet.create()` do projeto.

```typescript
export const colors = {
  bgPrimary: '#0a0a0f', bgCard: '#12121e', bgCardHover: '#1a1a2e', bgInput: '#16162a',
  border: '#2a2a3a', borderFocus: '#6c5ce7',
  textPrimary: '#ffffff', textSecondary: '#a0a0b8', textMuted: '#555570', textLabel: '#7878a0',
  accent: '#6c5ce7', accentSoft: 'rgba(108, 92, 231, 0.15)',
  green: '#00d68f', greenSoft: 'rgba(0, 214, 143, 0.12)', greenText: '#00e69a',
  greenGlow: 'rgba(0, 214, 143, 0.35)', greenGlowSoft: 'rgba(0, 214, 143, 0.15)',
  red: '#ff4757', redSoft: 'rgba(255, 71, 87, 0.12)', redText: '#ff6b7a',
  orange: '#ffa726', orangeSoft: 'rgba(255, 167, 38, 0.12)',
  btcOrange: '#f7931a', btcSoft: 'rgba(247, 147, 26, 0.12)',
  backdrop: 'rgba(0, 0, 0, 0.7)', overlayBg: 'rgba(10, 10, 15, 0.8)',
  black: '#000000', transparent: 'transparent',
} as const;

export const fonts = {
  regular: undefined, bold: undefined,
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const;

export const sizes = {
  // Texto
  textXs: 9, textSm: 10, textSmPlus: 11, textBase: 12, textMd: 13,
  textMdPlus: 14, textLg: 15, textLgPlus: 16, textXl: 17, text2xl: 19, text3xl: 22, text4xl: 36,
  minTouchTarget: 44,
  // Inputs
  inputFontSize: 18, inputRateFontSize: 16,
  inputPaddingV: 10, inputPaddingH: 14, inputBorderRadius: 10,
  inputPrefixSize: 15, inputSuffixSize: 13, inputLabelSize: 12,
  inputBorderWidth: 1.5, inputPrefixPad: 42, inputSuffixPad: 60,
  // Chips
  chipPaddingV: 8, chipPaddingH: 10, chipIconSize: 16,
  chipLabelSize: 9, chipValueSize: 12, chipBorderRadius: 10,
  // Botão
  btnPaddingV: 14, btnFontSize: 14, btnBorderRadius: 12,
  btnIconSize: 20, btnIconFontSize: 11, btnBorderWidth: 1.5, btnShadowRadius: 20, btnElevation: 4,
  // Badge
  badgePaddingH: 6, badgePaddingV: 2, badgeRadius: 5,
  // Section Title
  sectionBarW: 3, sectionBarH: 14, sectionBarRadius: 2,
  // Modal
  modalTopRadius: 20, modalHandleW: 36, modalHandleH: 4, modalHandleRadius: 2,
  // Radio
  radioIconSize: 18, radioCircleSize: 18, radioDotSize: 8, radioBorderWidth: 2,
  // Empty State
  emptyIconSize: 36, emptyLineHeight: 16,
  // Ranking
  rankPaddingV: 7, rankPaddingH: 10, rankBadgeSize: 22,
  rankBadgeRadius: 6, rankBadgeFont: 11, rankAmountSize: 13, rankDateSize: 10,
  // Projections
  projCardRadius: 12, projPeriodSize: 12, projLabelSize: 11,
  projValueSize: 12, projGainSize: 10, projSubSize: 10,
  // Summary
  summaryCardPadding: 11, summaryCardRadius: 12,
  summaryLabelSize: 10, summaryValueSize: 17, summaryDetailSize: 10,
  // Discipline
  discPadding: 10, discRadius: 12, discEmojiSize: 20, discNumberSize: 15, discLabelSize: 9,
  // History
  histItemPaddingV: 10, histItemPaddingH: 12, histItemRadius: 12,
  histDateSize: 10, histAmountSize: 15,
  histProjLabelSize: 9, histProjValueSize: 12, histProjGainSize: 9,
} as const;

export const spacing = {
  xxs: 2, xs: 4, sm: 6, md: 8, lg: 10, xl: 12, '2xl': 16, '3xl': 20, '4xl': 24,
} as const;

export const radii = {
  xs: 4, sm: 6, md: 8, lg: 10, xl: 12, '2xl': 16, '3xl': 20,
} as const;

export const opacity = { disabled: 0.4, muted: 0.6 } as const;
export const zIndices = { local: 1, modal: 20, overlay: 30 } as const;
export const borderWidths = { thin: 1, medium: 1.5, thick: 2 } as const;
export const letterSpacings = { tight: 0.5, wide: 1 } as const;

const theme = { colors, fonts, sizes, spacing, radii, opacity, zIndices, borderWidths, letterSpacings } as const;
export default theme;
```

---

## 4. Componentes Base — Props & Comportamento

### 4.1 `AppText`
```typescript
type AppTextProps = {
  variant?: 'primary' | 'secondary' | 'muted' | 'label' | 'green' | 'red' | 'btc';
  size?: keyof typeof sizes;
  weight?: keyof typeof fonts.weight;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};
```
- `allowFontScaling={true}`, `maxFontSizeMultiplier={1.5}`
- `accessibilityRole="text"`

### 4.2 `AppTextInput`
```typescript
type AppTextInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  prefix?: string;       // "R$"
  suffix?: string;       // "% a.a."
  keyboardType?: 'numeric' | 'decimal-pad';
  placeholder?: string;
  maxLength?: number;
};
```
- Background: `bgInput`, borda `border` → `borderFocus` no focus.
- `accessibilityLabel={label}`, `accessibilityHint={\`Digite ${placeholder || label}\`}`

### 4.3 `AppButton`
```typescript
type AppButtonProps = {
  label: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'confirm' | 'ghost';
};
```
- **primary:** bg `#1a1a2e`, border `rgba(0,214,143,0.35)`, shadow `rgba(0,214,143,0.15)`, texto `greenText`. Ícone: círculo com ✓ (fundo `rgba(0,214,143,0.15)`).
- **confirm:** bg `green` sólido, texto branco.
- **ghost:** sem bg, texto only.
- `minHeight: 44, minWidth: 44`, `accessibilityRole="button"`.

### 4.4 `Card`
```typescript
type CardProps = { children: React.ReactNode; style?: StyleProp<ViewStyle>; };
```
- bg `bgCard`, border `border`, borderRadius `radii.xl`.

### 4.5 `SectionTitle`
```typescript
type SectionTitleProps = { title: string; color?: string; };
```
- Texto uppercase com barra lateral colorida (default: `accent`).

### 4.6 `Badge`
```typescript
type BadgeProps = { value: number; size?: 'sm' | 'md'; };
```
- Positivo: bg `greenSoft`, texto `greenText`, prefixo `▲`.
- Negativo: bg `redSoft`, texto `redText`, prefixo `▼`.

### 4.7 `Chip`
```typescript
type ChipProps = { icon: string; label: string; value: string; accentColor: string; };
```
- Chip BTC: border `rgba(247,147,26,0.3)`, value color `btcOrange`.
- Chip SELIC: border `rgba(108,92,231,0.3)`, value color `accent`.

### 4.8 `AppModal`
```typescript
type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};
```
- **Bottom-sheet:** backdrop preto 70% opacidade, fecha ao tocar fora.
- Container: bg `bgCard`, borderRadius `20 20 0 0`.
- Handle bar: 36×4px, cor `border`.
- Animação: backdrop fade-in + container slide-up (usar `Animated` nativo).
- `accessibilityViewIsModal={true}`.

### 4.9 `RadioOption`
```typescript
type RadioOptionProps = {
  icon: string;
  label: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
  accentColor: string;
};
```
- Não selecionado: bg `bgInput`, border `border`.
- Selecionado: bg com accentColor 12% opacidade, border `accentColor`.
- `accessibilityRole="radio"`, `accessibilityState={{ selected }}`.

### 4.10 `EmptyState`
```typescript
type EmptyStateProps = { icon: string; title: string; subtitle?: string; };
```

### 4.11 `LoadingOverlay`
Overlay semitransparente com spinner.

---

## 5. Componentes Compostos — Props & Comportamento

### `MarketChips`
```typescript
type Props = { btcPrice: number; selicRate: number; };
```
Renderiza 2 `Chip` lado a lado (BTC + SELIC).

### `ProjectionCard`
```typescript
type Props = { projection: Projection; };
```
Card com período, linhas RF e BTC (valor + badge % + sub equivalente BTC).

### `ProjectionGroup`
```typescript
type Props = { projections: Projection[]; };
```
Renderiza 3 `ProjectionCard`. **Ordem de exibição: 1 ano, 5 anos, 10 anos.**

### `SummaryCards`
```typescript
type Props = { totals: SummaryTotals; };
```
Card "Total Economizado" full-width. Card "Projeção Investida" com ganho % + breakdown RF/BTC (count + valor por tipo).

### `DisciplineStats`
```typescript
type Props = { stats: DisciplineStats; };
```
Grid 3 colunas: total registros, média/mês (R$), streak consecutivo (emoji + dias).

### `RankingList`
```typescript
type Props = { items: Saving[]; };
```
Top 5 maiores por `amount` DESC. Cada item: badge numérico + valor + data + descrição (🏷️) + badge tipo (📊 RF verde / ₿ BTC laranja).

### `GrowthChart`
```typescript
type Props = { chartData: ChartDataPoint[]; };
```
Line chart RF (verde) vs BTC (laranja) ao longo do tempo.

### `HistoryItem`
```typescript
type Props = {
    saving: EnrichedSaving;
    onDeleteRequest: (id: number) => void;
    isSwipeOpen: boolean;
    onSwipeOpen: (id: number) => void;
};
```
Borda esquerda 3px colorida (verde RF, laranja BTC). Header: data absoluta (`formatDate`) + data relativa (`formatRelativeDate`) separadas por traço (ex: "21/02/2026 – Hoje") + valor. Meta row: 🏷️ descrição + badge tipo. Título "RENDIMENTO ATUAL" (variant muted, weight semibold) seguido de 2 mini-cards lado a lado (RF HOJE + BTC HOJE) cada um com valor + badge %. Seção "PROJEÇÃO SIMULADA" (condicional, exibida apenas se existirem projeções salvas): 3 linhas de 2 mini-cards (RF 1a/BTC 1a, RF 5a/BTC 5a, RF 10a/BTC 10a), cada um com valor formatado (`formatBRL`) + badge de ganho % calculado via `((proj - amount) / amount) * 100`. Cada par só é renderizado se ambos os valores (RF e BTC) forem não-nulos.
**Swipe-to-delete:** Gesto de swipe para a esquerda revela botão 🗑️ com borda vermelha (ver Fase 4.1.3 para detalhes completos).

### `HistoryList`
```typescript
type Props = {
    savings: EnrichedSaving[];
    onDeleteRequest: (id: number) => void;
};
```
`FlatList` com `keyExtractor={item => item.id.toString()}`. Renderiza `HistoryItem`. Mostra `EmptyState` quando vazio. Gerencia state local `openSwipeId` para controlar qual item está com swipe aberto.

### `DeleteConfirmModal`
```typescript
type Props = {
    visible: boolean;
    savingAmount: string;
    savingDescription: string;
    savingDate: string;
    onConfirm: () => void;
    onCancel: () => void;
};
```
Modal centralizado com "Deseja excluir esse registro?". Botão OK com background gradiente vermelho e botão CANCELAR discreto. (Ver Fase 4.1.5 para layout completo.)

### `SaveButton`
```typescript
type Props = { onPress: () => void; };
```
Botão "✅ RESOLVI ECONOMIZAR" **fixo no bottom** com `position: 'absolute'` + `LinearGradient` fade acima.

### `SaveModal`
```typescript
type Props = {
  visible: boolean;
  amount: number;
  fixedRate: number;
  btcPrice: number;
  onConfirm: (description: string, investmentType: 'RF' | 'BTC') => void;
  onClose: () => void;
};
```
**Estado interno:** `description` (string), `type` ('RF' | 'BTC', default 'RF'). Reseta ao abrir.
**Layout:**
1. Handle bar
2. Título: "💰 Registrar Economia" / "Transforme essa decisão em investimento"
3. `AmountDisplay`: valor em destaque (somente leitura, greenText, fundo bgPrimary)
4. Input "O que você deixou de comprar?" (maxLength: 40, obrigatório). A primeira letra da descrição é capitalizada automaticamente durante a digitação via `capitalizeFirst` de `savingsRules.ts` (apenas a primeira letra, não cada palavra).
5. `RadioOption` "📊 Renda Fixa" (subtitle: "Taxa: {fixedRate}% a.a.") — pré-selecionado
6. `RadioOption` "₿ Bitcoin" (subtitle: "BTC: R$ {btcPrice}")
7. `AppButton` variant="confirm" "✅ CONFIRMAR" — disabled até descrição preenchida

### `DisclaimerText`
```typescript
type Props = { compact?: boolean; };
```
- **compact=false:** "⚠️ Projeções baseadas em performance passada. Não é garantia de retorno futuro. Não constitui aconselhamento ou recomendação de investimento."
- **compact=true:** "⚠️ Simulação educacional. Performance passada ≠ retorno futuro."
- Cor `textMuted`, tamanho `textXs`, center. `accessibilityLabel` sempre com texto completo.

### `AttributionFooter`
Sem props. Texto: "Dados: CoinGecko • Banco Central do Brasil" + "Sobre / Legal →" (touchable, abre `LegalScreen`).
Cor `textMuted`, tamanho `textXs`.

---

## 6. Banco de Dados — SQLite (expo-sqlite)

### Schema

```sql
CREATE TABLE IF NOT EXISTS savings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  investment_type TEXT NOT NULL CHECK(investment_type IN ('RF', 'BTC')),
  fixed_rate_at_save REAL NOT NULL,
  selic_at_save REAL NOT NULL,
  btc_price_at_save REAL NOT NULL,
  btc_equivalent REAL NOT NULL,
  cagr_1y_at_save REAL,
  cagr_5y_at_save REAL,
  cagr_10y_at_save REAL,
  proj_1y_rf REAL,
  proj_5y_rf REAL,
  proj_10y_rf REAL,
  proj_1y_btc REAL,
  proj_5y_btc REAL,
  proj_10y_btc REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Registros: ('fixed_rate', '12.5'), ('last_fetch_timestamp', '...')

CREATE TABLE IF NOT EXISTS external_data_cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Registros: ('btc_current_price', '...'), ('btc_history', '...'), ('selic_current', '...'), ('btc_cagr', '...')
```

### Repositories

**`database.ts`:**
- `getDatabase()`: Abre conexão, executa migrations se necessário. Retorna instância singleton.

**`savingsRepository.ts`:**
```typescript
insert(saving: NewSaving): Promise<number>
getAll(): Promise<Saving[]>           // ORDER BY created_at DESC
getTopN(n: number): Promise<Saving[]> // ORDER BY amount DESC LIMIT n
getTotalAmount(): Promise<number>     // SELECT SUM(amount)
getCount(): Promise<number>           // SELECT COUNT(*)
deleteById(id: number): Promise<void>
```

**`configRepository.ts`:**
```typescript
get(key: string): Promise<string | null>
set(key: string, value: string): Promise<void>
```

**`cacheRepository.ts`:**
```typescript
get(key: string): Promise<CacheEntry | null>
set(key: string, value: any): Promise<void>
isValid(key: string): Promise<boolean>  // existe + fetched_at é "hoje"
```

---

## 7. Zustand Stores (4 stores)

### `useMarketStore`
```typescript
type MarketState = {
  btcPrice: number;
  selicRate: number;
  cagr1y: number;
  cagr5y: number;
  cagr10y: number;
  lastFetchDate: string | null;
  setMarketData: (data: Partial<MarketState>) => void;
  reset: () => void;
};
```

### `useSavingsStore`
```typescript
type SavingsState = {
  savings: Saving[];        // mais recentes primeiro
  totalSaved: number;
  count: number;
  addSaving: (saving: NewSaving) => Promise<void>;  // insert + reload
  loadSavings: () => Promise<void>;
  deleteSaving: (id: number) => void;  // delete + reload (ver Fase 4.1.2)
};
```

### `useConfigStore`
```typescript
type ConfigState = {
  fixedRate: number;       // default 12.5
  setFixedRate: (rate: number) => void;  // salva SQLite + atualiza store
  loadConfig: () => Promise<void>;
};
```

### `useAppStore`
```typescript
type AppState = {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  hasCache: boolean;
  setReady: () => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
};
```

**Regra:** Screens são os únicos que leem stores. Componentes base/compostos recebem dados via props. Sempre usar seletores granulares: `useStore(s => s.campo)`, nunca `useStore()`.

---

## 8. Regras de Negócio (`rules/`)

Funções puras. Sem dependência de React, Zustand, SQLite.

### `projectionRules.ts`

```typescript
type Projection = {
  period: '1y' | '5y' | '10y';
  label: string;           // "1 ano", "5 anos", "10 anos"
  fixedIncome: number;
  fixedIncomeGain: number; // %
  bitcoin: number;
  bitcoinGain: number;     // %
  btcEquivalent: number;
};

// Renda fixa: V = amount × (1 + rate)^years
calculateFixedIncome(amount: number, annualRate: number, years: number): number

// BTC: V = amount × (1 + cagr)^years
calculateBitcoin(amount: number, cagr: number, years: number): number

// CAGR = (Vfinal / Vinicial)^(1/n) - 1
calculateCAGR(currentPrice: number, historicalPrice: number, years: number): number

// Gera as 3 projeções completas
calculateProjections(
  amount: number,
  fixedRate: number,
  btcPrice: number,
  cagrs: { y1: number; y5: number; y10: number }
): Projection[]

// Valor atualizado RF de economia salva: amount × (1 + currentRate)^elapsedYears
calculateCurrentFixedValue(amount: number, currentRate: number, savedAt: Date): number

// Valor atualizado BTC: btcEquivalent × currentBtcPrice
calculateCurrentBtcValue(btcEquivalentAtSave: number, currentBtcPrice: number): number
```

### `savingsRules.ts`

```typescript
type SummaryTotals = {
  totalSaved: number;
  investedProjection: number;  // soma das projeções por tipo escolhido de cada registro
  investedGain: number;
  investedGainPercent: number;
  rfPortion: { count: number; totalSaved: number; projection: number; };
  btcPortion: { count: number; totalSaved: number; projection: number; };
};

validateSaving(amount, btcPrice, description, investmentType): { valid: boolean; error?: string }
// amount > 0, btcPrice > 0, description.trim().length > 0, investmentType in ['RF','BTC']

capitalizeFirst(str: string): string
// Retorna a string com apenas a primeira letra em maiúscula (não capitaliza cada palavra).

buildNewSaving(amount, description, investmentType, fixedRate, btcPrice, selicRate, cagrs): NewSaving

enrichWithProjections(savings[], currentFixedRate, currentBtcPrice): EnrichedSaving[]

calculateTotals(savings[], currentFixedRate, currentBtcPrice): SummaryTotals

buildChartData(savings[], currentFixedRate, currentBtcPrice): ChartDataPoint[]
```

### `disciplineRules.ts`

```typescript
type DisciplineStats = {
  totalRecords: number;
  averagePerMonth: number;
  currentStreak: number;
  bestStreak: number;
  emoji: string;
};

calculateDiscipline(savings: Saving[]): DisciplineStats
```

### `formatRules.ts`

```typescript
formatBRL(value: number): string          // "R$ 1.234,56"
formatBTC(value: number): string          // "0,00182400 BTC"
formatPercent(value: number): string      // "+12,5%" ou "-3,2%"
formatDate(date: Date | string): string   // "21/02/2026"
formatRelativeDate(date: Date | string): string  // "Hoje", "Há 3 dias", "Há 2 semanas", "Há 1 mês", "Há 1 ano" (sem granularidade de minutos/horas; tudo < 1 dia = "Hoje")
```

Implementar com `.toFixed()` + `.replace()` manual. Não depender 100% de `Intl.NumberFormat`.

---

## 9. Serviços Externos

### `bitcoinService.ts`

**Preço atual:**
```
GET https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl
→ { "bitcoin": { "brl": 650000 } }
```

**Histórico (CAGR):**
```
GET https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=3650&interval=daily
→ [[timestamp, price], ...]
```

Extrai preços de ~1, ~5, ~10 anos atrás (timestamp mais próximo). Calcula CAGRs via `projectionRules.calculateCAGR()`.

```typescript
type BtcData = { currentPrice: number; cagr1y: number; cagr5y: number; cagr10y: number; };
fetchBitcoinData(): Promise<BtcData>
```

- `fetch()` nativo, timeout 10s.
- Se histórico < 10 anos: usar ponto mais antigo, ajustar `n`.
- CAGR negativo: retornar normalmente.

### `selicService.ts`

```
GET https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json
→ [{ "data": "DD/MM/YYYY", "valor": "14.25" }]
```

```typescript
fetchSelicRate(): Promise<number>
```

### `initService.ts`

```typescript
async function initializeApp(): Promise<void> {
  // 1. database.getDatabase() → abre SQLite + migrations
  // 2. configRepo.get('fixedRate') → configStore (default 12.5)
  // 3. savingsRepo.getAll() → savingsStore
  // 4. fetch paralelo: bitcoinService + selicService
  //    Sucesso → salva cache + marketStore
  //    Falha + cache → carrega cache + marketStore (mostra badge "dados de [data]")
  //    Falha + sem cache → appStore.setError("Conecte à internet...")
  // 5. appStore.setReady()
}
```

**Política de cache:** Fetch 1× por sessão (app open). Pull-to-refresh para forçar. Sem polling.

---

## 10. Navegação

3 abas com Material Top Tabs.

```typescript
// navigation/TopTabNavigator.tsx
const Tab = createMaterialTopTabNavigator();

<Tab.Navigator screenOptions={{
  tabBarStyle: { backgroundColor: colors.bgPrimary, borderBottomWidth: 1, borderBottomColor: colors.bgCardHover, elevation: 0 },
  tabBarLabelStyle: { fontSize: 15, fontWeight: '600', textTransform: 'none' },
  tabBarActiveTintColor: colors.textPrimary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarIndicatorStyle: { backgroundColor: colors.accent, height: 3 },
  swipeEnabled: true,
  lazy: true,
}}>
  <Tab.Screen name="Simulador" component={SimulatorScreen} />
  <Tab.Screen name="Resumo" component={SummaryScreen} />
  <Tab.Screen name="Histórico" component={HistoryScreen} />
</Tab.Navigator>
```

`LegalScreen` → acessível via link no `AttributionFooter`. Implementar como modal full-screen (não é uma aba).

---

## 11. Telas — Layout & Fluxo de Dados

### 11.1 SimulatorScreen

**Dados do store:**
- `useMarketStore` → btcPrice, selicRate, cagr1y, cagr5y, cagr10y
- `useConfigStore` → fixedRate
- `useSavingsStore` → addSaving

**State local:** `inputAmount` (string), `modalVisible` (boolean).

**Cálculo memoizado:**
```typescript
const projections = useMemo(
  () => calculateProjections(amount, fixedRate, btcPrice, { y1: cagr1y, y5: cagr5y, y10: cagr10y }),
  [amount, fixedRate, btcPrice, cagr1y, cagr5y, cagr10y]
);
```

**Layout (ScrollView):**
1. Hero: "Quanto você gastaria?" / "Simule o retorno se investisse"
2. Input valor (prefix "R$", numeric, useCurrencyInput)
3. Input taxa (suffix "% a.a.", decimal-pad) — valor salvo em configStore
4. `MarketChips` (btcPrice, selicRate)
5. `SectionTitle` "PROJEÇÕES"
6. `ProjectionGroup` (projections) — ordem: 1a, 5a, 10a
7. `DisclaimerText` (compact=false)
8. `AttributionFooter`
9. `SaveButton` fixo no bottom (position absolute + LinearGradient fade)
10. `SaveModal` (controlado por modalVisible)

**Callback de confirmação:**
```typescript
const handleConfirmSave = useCallback(async (description: string, investmentType: 'RF' | 'BTC') => {
  const validation = validateSaving(amount, btcPrice, description, investmentType);
  if (!validation.valid) return;
  const newSaving = buildNewSaving(amount, description, investmentType, fixedRate, btcPrice, selicRate, cagrs);
  await addSaving(newSaving);
  setModalVisible(false);
  setInputAmount('');
  // feedback visual (toast)
}, [deps]);
```

Debounce de 300ms no input de valor antes de recalcular projeções.

### 11.2 SummaryScreen

**Dados do store:**
- `useSavingsStore` → savings (todas)
- `useMarketStore` → btcPrice
- `useConfigStore` → fixedRate

**Cálculos memoizados:**
- `summaryData = savingsRules.calculateTotals(savings, fixedRate, btcPrice)`
- `disciplineData = disciplineRules.calculateDiscipline(savings)`
- `top5 = savings (ordenado por amount DESC, limit 5)`

**Layout (ScrollView):**
1. `SectionTitle` "💰 RESUMO"
2. `SummaryCards` (totals) — Total Economizado + Projeção Investida com breakdown RF/BTC
3. `SectionTitle` "🏆 DISCIPLINA"
4. `DisciplineStats` (stats)
5. `SectionTitle` "🥇 TOP 5 MAIORES"
6. `RankingList` (top5)
7. `EmptyState` quando savings vazio

**Projeção Investida:** Soma das projeções individuais, cada uma usando o tipo de investimento escolhido (RF ou BTC) naquele registro.

### 11.3 HistoryScreen

**Dados do store:**
- `useSavingsStore` → savings, deleteSaving
- `useMarketStore` → btcPrice
- `useConfigStore` → fixedRate

**Cálculos memoizados:**
- `enrichedSavings = savingsRules.enrichWithProjections(savings, fixedRate, btcPrice)`
- `chartData = savingsRules.buildChartData(savings, fixedRate, btcPrice)`

**State local:**
```typescript
const [deleteModalVisible, setDeleteModalVisible] = useState(false);
const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
```

**Layout:**
1. `SectionTitle` "📊 CRESCIMENTO"
2. `GrowthChart` (chartData) — line chart RF (verde) vs BTC (laranja)
3. `SectionTitle` "HISTÓRICO"
4. `HistoryList` (enrichedSavings, onDeleteRequest) — FlatList de HistoryItems com swipe-to-delete
5. `EmptyState` quando vazio
6. `DeleteConfirmModal` (controlado por deleteModalVisible)

**Fluxo de exclusão (ver Fase 4.1.6):**
1. `onDeleteRequest(id)` → guarda `pendingDeleteId`, abre `DeleteConfirmModal`
2. CANCELAR → fecha modal, reseta state, fecha swipe
3. OK → chama `deleteSaving(id)` do store → recálculo automático em todas as telas

### 11.4 LegalScreen

**State local:** `section` ('main' | 'privacy' | 'terms').

**Layout "main":**
1. Header "← Voltar / Sobre / Legal"
2. MenuItem "📜 Política de Privacidade"
3. MenuItem "📋 Termos de Uso"
4. Bloco "Sobre o App" (versão, copyright, email suporte)
5. Bloco "Dados de Mercado" (atribuição CoinGecko + BCB)

Seções "privacy" e "terms": ScrollView com texto completo + botão voltar.

---

## 12. Inicialização

```
App.tsx → LoadingOverlay visível
  → useInitApp():
    1. database.getDatabase() (SQLite + migrations)
    2. configRepo.get('fixedRate') → configStore (default 12.5)
    3. savingsRepo.getAll() → savingsStore
    4. fetch paralelo bitcoinService + selicService
       - Sucesso → cacheRepo.set() + marketStore
       - Falha + cache → cacheRepo.get() + marketStore + badge "dados de [data]"
       - Falha + sem cache → appStore.setError("Conecte à internet para carregar dados de mercado")
    5. appStore.setReady() → remove loading → TopTabNavigator
```

O app NUNCA trava por falta de conexão se tiver cache.

---

## 13. Padrões de Código

### Estrutura de arquivo de componente

```typescript
// 1. Imports
// 2. Types (type Props = {...})
// 3. Component (function)
// 4. Styles (StyleSheet.create usando theme.*)
// 5. export default React.memo(Component)
```

### Nomenclatura

| Item | Padrão | Exemplo |
|---|---|---|
| Componente | PascalCase.tsx | `ProjectionCard.tsx` |
| Lógica | camelCase.ts | `projectionRules.ts` |
| Store | useXxxStore.ts | `useMarketStore.ts` |
| Hook | useXxx.ts | `useInitApp.ts` |
| Tipo | PascalCase | `type Projection` |
| Constante | UPPER_SNAKE | `MAX_RANKING = 5` |

### Regras obrigatórias

- TypeScript `strict: true`, sem `any`.
- `React.memo` em TODOS os componentes base e compostos.
- `useCallback` em TODOS os callbacks passados via props.
- `useMemo` para todos os dados derivados/cálculos.
- Seletores granulares Zustand (nunca desestruturar o store inteiro).
- FlatList (não ScrollView) para listas.
- Sem `console.log` em produção (usar guard `__DEV__`).
- 1 componente por arquivo.
- Imports com alias `@/`.
- Sem objetos/arrays inline em props.

### Acessibilidade (obrigatório em todo componente)

| Regra | Aplicação |
|---|---|
| Touch targets ≥ 44×44pt | Botões, chips, radio options, links |
| `accessibilityLabel` descritivo | Elementos interativos + valores numéricos |
| `accessibilityRole` | button, radio, text, header, summary, link |
| `accessibilityState` | disabled, selected, checked |
| `allowFontScaling={true}` | Todo AppText |
| `maxFontSizeMultiplier={1.5}` | Inputs e áreas com layout restrito |
| Cards como unidade | `accessible={true}` no container |

---

## 14. Configurações de Build

### `app.json`

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
        "CFBundleLocalizations": ["pt-BR"]
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
    "plugins": ["expo-sqlite"],
    "extra": {
      "eas": { "projectId": "[DEFINIR APÓS CRIAR PROJETO NO EAS]" }
    }
  }
}
```

### `eas.json`

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "android": { "buildType": "apk" }
    },
    "production": {
      "ios": { "image": "latest", "autoIncrement": "buildNumber" },
      "android": { "image": "latest", "autoIncrement": "versionCode", "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "[APPLE_ID]",
        "ascAppId": "[ASC_APP_ID]",
        "appleTeamId": "[TEAM_ID]"
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

## 15. Textos Legais (hardcoded no app + hospedados em URL pública)

### Política de Privacidade

```
POLÍTICA DE PRIVACIDADE — COMPENSA APP
Última atualização: [data]

1. DADOS COLETADOS
O Compensa App é 100% offline-first. NÃO coletamos, armazenamos ou transmitimos dados pessoais a servidores externos.
Dados armazenados LOCALMENTE no dispositivo:
- Valores de economias registradas
- Descrições de gastos evitados
- Configuração de taxa de renda fixa
- Cache de dados de mercado (preço BTC, taxa SELIC)

2. DADOS DE MERCADO
Requisições a APIs públicas (CoinGecko, Banco Central do Brasil). Requisições NÃO incluem dados pessoais. Nenhum identificador do dispositivo é enviado.

3. TERCEIROS
NÃO utiliza: analytics, publicidade, SDKs de rastreamento, crash reporting com dados pessoais.

4. ARMAZENAMENTO E SEGURANÇA
Dados no sandbox do app, protegidos pelo OS. Sem backup em nuvem.

5. COMPARTILHAMENTO
NÃO compartilha dados com terceiros.

6. RETENÇÃO E EXCLUSÃO
Dados retidos enquanto o app estiver instalado. Para excluir: desinstalar o app ou excluir registros individualmente.

7. CRIANÇAS
Não direcionado a menores de 13 anos.

8. LGPD (Lei 13.709/2018)
Base legal: consentimento ao usar o app. Dados exclusivamente locais. Direito de exclusão via desinstalação ou exclusão de registros. Direito de acesso: todos os dados visíveis no app.

9. ALTERAÇÕES
Reservamo-nos o direito de atualizar esta política.

10. CONTATO
[email de contato]
```

### Termos de Uso

```
TERMOS DE USO — COMPENSA APP

1. ACEITAÇÃO
Ao utilizar o Compensa App, você concorda com estes termos.

2. NATUREZA DO APP
Simulador educacional de comportamento financeiro. NÃO é e NÃO substitui: assessoria de investimentos, recomendação de compra/venda, plataforma de negociação, serviço financeiro regulamentado.

3. PROJEÇÕES E SIMULAÇÕES
Projeções HIPOTÉTICAS baseadas em: performance histórica (Bitcoin CAGR), taxas definidas pelo usuário (Renda Fixa).
PERFORMANCE PASSADA NÃO É GARANTIA DE RESULTADOS FUTUROS.
Valores meramente ilustrativos.

4. DADOS DE MERCADO
Fontes públicas (CoinGecko, BCB). Sem garantia de precisão ou disponibilidade.

5. ISENÇÃO DE RESPONSABILIDADE
O desenvolvedor NÃO se responsabiliza por: decisões financeiras, perdas, indisponibilidade de dados, imprecisões.

6. DADOS DO USUÁRIO
Armazenados exclusivamente no dispositivo. Ver Política de Privacidade.

7. PROPRIEDADE INTELECTUAL
App, design, código e conteúdo protegidos por direitos autorais.

8. ALTERAÇÕES
Termos podem ser atualizados. Uso continuado = aceitação.

9. LEGISLAÇÃO APLICÁVEL
Leis da República Federativa do Brasil.
```

---

## 16. Fases de Implementação

### Fase 0 — Setup
- `npx create-expo-app compensa-app --template blank-typescript`
- `tsconfig.json` com path alias `@/`
- Instalar todas as dependências da seção 1
- Criar estrutura de pastas (seção 2)
- Criar `src/theme/index.ts` (seção 3)
- Criar `app.json` (seção 14)
- Criar `eas.json` (seção 14)
- Configurar ESLint + Prettier

### Fase 1 — Componentes Base
Implementar todos os 11 componentes de `components/base/` (seção 4). Cada um com acessibilidade e React.memo.

### Fase 2 — Banco + Repositories
- `database.ts` (conexão + migrations com schema da seção 6)
- `savingsRepository.ts`
- `configRepository.ts`
- `cacheRepository.ts`
- Testar CRUD com dados mock

### Fase 3 — Regras de Negócio
- `projectionRules.ts`
- `savingsRules.ts`
- `disciplineRules.ts`
- `formatRules.ts`
Todos conforme assinaturas da seção 8.

### Fase 4 — Stores + Services
- 4 Zustand stores (seção 7)
- `bitcoinService.ts` + `selicService.ts` (seção 9)
- `initService.ts` (seção 9)
- `useInitApp.ts` hook (seção 12)

### Fase 4.1 — Exclusão de Registros (Swipe-to-Delete)

> **Contexto:** O protótipo `prototype/index.html` (aba Histórico) agora possui a funcionalidade de exclusão de registros por gesto de swipe. Esta fase implementa as fundações necessárias nos artefatos já construídos (Fases 0-4) e documenta o comportamento esperado para os componentes compostos e telas das fases seguintes.

#### 4.1.1 — Novos tokens no theme (`src/theme/index.ts`)

Adicionar os seguintes tokens ao `colors`:

```typescript
// dentro de colors:
redGlow: 'rgba(255, 71, 87, 0.5)',
redGlowSoft: 'rgba(255, 71, 87, 0.12)',
redGradientStart: '#ff4757',
redGradientEnd: '#d63041',
```

Adicionar os seguintes tokens ao `sizes`:

```typescript
// dentro de sizes:
// Delete button (swipe actions)
deleteBtnSize: 46,
deleteBtnRadius: 12,
deleteBtnIconSize: 20,
swipeActionWidth: 72,
swipeThreshold: 50,

// Delete Confirmation Modal
deleteModalWidth: 0.85,  // 85% da largura do container
deleteModalMaxWidth: 320,
deleteModalIconSize: 40,
deleteModalTitleSize: 17,
deleteModalDetailSize: 12,
```

#### 4.1.2 — Ação `deleteSaving` no `useSavingsStore` (`src/stores/useSavingsStore.ts`)

O store atualmente possui apenas `addSaving` e `loadSavings`. Adicionar a ação `deleteSaving`:

```typescript
type SavingsState = {
    savings: Saving[];
    totalSaved: number;
    count: number;
    addSaving: (saving: NewSaving) => void;
    loadSavings: () => void;
    deleteSaving: (id: number) => void;  // ← NOVO
};
```

Implementação de `deleteSaving`:

```typescript
deleteSaving: (id) => {
    savingsRepo.deleteById(id);
    // Reload completo após deletar
    const savings = savingsRepo.getAll();
    const totalSaved = savingsRepo.getTotalAmount();
    const count = savingsRepo.getCount();
    set({ savings, totalSaved, count });
},
```

> **Nota:** `savingsRepository.deleteById(id)` já existe implementado na Fase 2.

#### 4.1.3 — Comportamento do `HistoryItem` com swipe (Fase 5)

O componente `HistoryItem` (atualmente placeholder) deve implementar gesto de **swipe-to-left** para revelar um botão de exclusão:

**Gesto:**
- Usar `PanResponder` nativo do React Native (sem adicionar dependência `react-native-gesture-handler` ou `react-native-swipeable`).
- Ao arrastar o item para a esquerda, revelar uma área de ação de largura `sizes.swipeActionWidth` (72px).
- Threshold para fixar a posição aberta: `sizes.swipeThreshold` (50px).
- Se o arrasto não atingir o threshold, o item volta à posição original com animação.
- Apenas um item pode estar "aberto" por vez — ao iniciar swipe em outro, o anterior fecha.

**Botão de lixeira (dentro da área revelada):**
- Dimensões: `sizes.deleteBtnSize` × `sizes.deleteBtnSize` (46×46).
- `borderRadius: sizes.deleteBtnRadius` (12).
- Background: gradiente de `colors.bgCardHover` para `colors.bgCard` (mesmo padrão do botão "Resolvi Economizar", mas vermelho).
- Borda: `borderWidths.medium` (1.5px) com cor `colors.redGlow`.
- Ícone: 🗑️ com tamanho `sizes.deleteBtnIconSize`, cor `colors.redText`.
- `boxShadow`: `0 0 12px colors.redGlowSoft`.
- `:active` → `transform: scale(0.92)`, border `colors.red`.
- `accessibilityRole="button"`, `accessibilityLabel="Excluir registro de R$ {amount}"`.

**Animação de remoção:**
- Ao confirmar exclusão, o container do item deve animar: `maxHeight` colapsa para 0, `opacity` para 0, `marginBottom` para 0. Duração: 350ms.
- Após animação completa, remover o item da lista.

**Nova assinatura de props do `HistoryItem`:**

```typescript
type Props = {
    saving: EnrichedSaving;
    onDeleteRequest: (id: number) => void;  // ← NOVO: abre modal de confirmação
    isSwipeOpen: boolean;                    // ← NOVO: controla se está aberto
    onSwipeOpen: (id: number) => void;       // ← NOVO: notifica pai que abriu
};
```

#### 4.1.4 — `HistoryList` com suporte a exclusão (Fase 5)

Gerencia qual item está com swipe aberto e propaga callbacks:

```typescript
type Props = {
    savings: EnrichedSaving[];
    onDeleteRequest: (id: number) => void;  // ← NOVO
};
```

**State local:** `openSwipeId: number | null` — controla qual item está aberto.

Ao tocar fora de qualquer item com swipe aberto, fechar.

#### 4.1.5 — Modal de confirmação de exclusão (Fase 5/6)

Criar o modal de confirmação de exclusão **reutilizando `AppModal`** como base, mas com layout centralizado (diferente do bottom-sheet padrão). O modal pode ser implementado de duas formas:

**Opção recomendada — Componente `DeleteConfirmModal` em `components/composed/`:**

```typescript
type DeleteConfirmModalProps = {
    visible: boolean;
    savingAmount: string;       // "R$ 350,00" (formatado)
    savingDescription: string;  // "Balada"
    savingDate: string;         // "21/02/2026"
    onConfirm: () => void;
    onCancel: () => void;
};
```

**Layout visual (conforme protótipo):**
1. Overlay: backdrop preto 70% + blur.
2. Box centralizado (não bottom-sheet): bg `colors.bgCard`, border `colors.border`, `borderRadius: radii['3xl']` (20px).
3. Largura: 85% do container, max 320px.
4. Ícone: 🗑️ `sizes.deleteModalIconSize` (40px), centralizado.
5. Título: **"Deseja excluir esse registro?"** — `sizes.deleteModalTitleSize` (17px), weight bold, `colors.textPrimary`.
6. Detalhe: **"R$ 350,00 · Balada · 21/02/2026"** — `sizes.deleteModalDetailSize` (12px), `colors.textMuted`, com o valor em `colors.textPrimary` + bold.
7. Dois botões lado a lado em row com `gap: spacing.lg`:

   **Botão CANCELAR:**
   - Background: gradiente de `colors.bgCardHover` para `colors.bgCard`.
   - Borda: `borderWidths.medium` com `colors.border`.
   - Texto: "CANCELAR", `sizes.btnFontSize`, weight bold, cor `colors.textSecondary`.
   - Hover: border `#3a3a4e`.
   - `accessibilityRole="button"`, `accessibilityLabel="Cancelar exclusão"`.

   **Botão OK (confirmar exclusão):**
   - Background: `LinearGradient` de `colors.redGradientStart` (#ff4757) para `colors.redGradientEnd` (#d63041).
   - Borda: `borderWidths.medium` com `colors.redGlow`.
   - Texto: "OK", `sizes.btnFontSize`, weight bold, cor `colors.textPrimary` (#ffffff).
   - Shadow: `0 0 20px colors.redGlowSoft`, elevation 4.
   - Active: `transform: scale(0.97)`, border `colors.red`.
   - `accessibilityRole="button"`, `accessibilityLabel="Confirmar exclusão do registro"`.

**Animação:** Overlay fade-in 250ms + box `scale(0.9)` → `scale(1)` em 250ms.

**IMPORTANTE:** Seguir o mesmo padrão de profissionalismo do botão "Resolvi Economizar" — gradiente, bordas glow, shadows, feedback tátil.

#### 4.1.6 — Fluxo de exclusão no `HistoryScreen` (Fase 6)

O `HistoryScreen` orquestra todo o fluxo:

**State local adicional:**
```typescript
const [deleteModalVisible, setDeleteModalVisible] = useState(false);
const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
```

**Fluxo:**
1. Usuário arrasta `HistoryItem` para a esquerda → revela botão 🗑️.
2. Usuário toca no 🗑️ → `HistoryScreen` recebe `onDeleteRequest(id)`.
3. `HistoryScreen` guarda `pendingDeleteId = id`, abre `DeleteConfirmModal`.
4. **CANCELAR:** Fecha modal, reseta `pendingDeleteId`, fecha o swipe do item.
5. **OK:** Chama `deleteSaving(pendingDeleteId)` do store → store executa `deleteById` no SQLite + reload.
6. Fecha modal, reseta `pendingDeleteId`.
7. Como `savings` no store mudou, `useMemo` de `enrichedSavings` e `chartData` recalculam automaticamente.

#### 4.1.7 — Recálculo automático no `SummaryScreen` (Fase 6)

**Nenhuma mudança de código necessária no `SummaryScreen`** além do que já está especificado na seção 11.2, pois:
- `SummaryCards` lê `savingsRules.calculateTotals(savings, fixedRate, btcPrice)` — como `savings` no store foi atualizado pelo `deleteSaving`, o `useMemo` recalcula **Total Economizado**, **Projeção Investida**, breakdown RF/BTC, contagens e ganho percentual automaticamente.
- `DisciplineStats` lê `disciplineRules.calculateDiscipline(savings)` — recalcula automaticamente.
- `RankingList` lê `savings` ordenado por `amount DESC limit 5` — recalcula automaticamente, removendo o item excluído do Top 5 se estiver lá.

> **Verificação:** Confirmar que `SummaryScreen` usa `useSavingsStore(s => s.savings)` como seletor reativo. Ao deletar um registro no `HistoryScreen`, o `SummaryScreen` será re-renderizado com os dados atualizados ao navegar para a aba.

#### 4.1.8 — Checklist de implementação

| # | Arquivo | Alteração | Fase origem |
|---|---|---|---|
| 1 | `src/theme/index.ts` | Adicionar tokens `redGlow`, `redGlowSoft`, `redGradientStart`, `redGradientEnd`, `deleteBtnSize`, `deleteBtnRadius`, `deleteBtnIconSize`, `swipeActionWidth`, `swipeThreshold`, `deleteModalWidth`, `deleteModalMaxWidth`, `deleteModalIconSize`, `deleteModalTitleSize`, `deleteModalDetailSize` | Fase 0 |
| 2 | `src/stores/useSavingsStore.ts` | Adicionar ação `deleteSaving(id: number)` que chama `savingsRepo.deleteById()` + reload | Fase 4 |
| 3 | `src/components/composed/HistoryItem.tsx` | Implementar `PanResponder` swipe-to-left + botão 🗑️ com borda vermelha | Fase 5 |
| 4 | `src/components/composed/HistoryList.tsx` | Gerenciar `openSwipeId` + propagar `onDeleteRequest` | Fase 5 |
| 5 | `src/components/composed/DeleteConfirmModal.tsx` | **NOVO** — Modal centralizado com "Deseja excluir esse registro?", botão OK (vermelho) e CANCELAR | Fase 5 |
| 6 | `src/screens/HistoryScreen.tsx` | Orquestrar fluxo: `pendingDeleteId` → modal → `deleteSaving` → recálculo automático | Fase 6 |

> **Dependência:** Os itens 1 e 2 devem ser executados **antes** da Fase 5 (são modificações em artefatos já construídos). Os itens 3-5 fazem parte da Fase 5. O item 6 faz parte da Fase 6.

### Fase 5 — Componentes Compostos
Todos os 14 componentes de `components/composed/` (seção 5), incluindo o novo `DeleteConfirmModal.tsx` (ver Fase 4.1.5). Cada um com React.memo.

### Fase 6 — Telas + Navegação
- `TopTabNavigator.tsx` (seção 10)
- `SimulatorScreen.tsx` (seção 11.1)
- `SummaryScreen.tsx` (seção 11.2)
- `HistoryScreen.tsx` (seção 11.3)
- `LegalScreen.tsx` (seção 11.4)
- `App.tsx` com boot flow (seção 12)

### Fase 7 — Compliance & Acessibilidade
- Hospedar Privacy Policy em URL pública
- Implementar `LegalScreen` com textos da seção 15
- `DisclaimerText` no SimulatorScreen
- `AttributionFooter` com link para Legal
- Revisar acessibilidade em todos os componentes
- Testar VoiceOver (iOS) e TalkBack (Android)
- Remover `console.log` (guard `__DEV__`)

### Fase 8 — Polish & QA
- Pull-to-refresh no Simulador
- Animação ao salvar
- Ícone (1024×1024 iOS, 512×512 Android) + splash screen
- Badge "dados de [data]" quando offline
- Empty states
- Edge cases (valor 0, taxa 0, sem internet, app kill + reopen)
- Testes em dispositivos reais
- Bundle size < 25MB

### Fase 9 — Build & Submissão
- Contas dev (Apple $99 + Google $25)
- EAS Build production
- Screenshots para todas as resoluções
- App Store Connect: metadata, screenshots, keywords, categoria Finance, Privacy Labels ("Data Not Collected"), Age Rating (4+), Export Compliance, Review Notes
- Google Play Console: metadata, screenshots, Feature Graphic (1024×500), Data Safety, IARC, categoria Finance
- EAS Submit
- Monitorar review
