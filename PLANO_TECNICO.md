# Compensa App — Plano Técnico de Execução

> Documento técnico que define arquitetura, padrões de código, componentes base,  
> fluxo de dados e regras de negócio para implementação do Compensa App.  
> Baseado no **Plano de Execução** e no **Protótipo Visual (3 abas)** validado.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura de Pastas](#2-estrutura-de-pastas)
3. [Design System — Tema Centralizado](#3-design-system--tema-centralizado)
4. [Componentes Base Reutilizáveis](#4-componentes-base-reutilizáveis)
5. [Arquitetura de Dados e Fluxo de Props](#5-arquitetura-de-dados-e-fluxo-de-props)
6. [State Management — Zustand](#6-state-management--zustand)
7. [Camada de Regras de Negócio](#7-camada-de-regras-de-negócio)
8. [Camada de Dados — Repositories](#8-camada-de-dados--repositories)
9. [Camada de Serviços Externos](#9-camada-de-serviços-externos)
10. [Performance — Regras e Padrões](#10-performance--regras-e-padrões)
11. [Navegação — 3 Abas](#11-navegação--3-abas)
12. [Telas — Mapeamento Protótipo → Código](#12-telas--mapeamento-protótipo--código)
13. [Inicialização do App](#13-inicialização-do-app)
14. [Convenções de Código](#14-convenções-de-código)
15. [Checklist de Implementação](#15-checklist-de-implementação)

---

## 1. Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                        APRESENTAÇÃO                          │
│  Screens → Componentes compostos → Componentes base          │
│                     (props ↓  callbacks ↑)                   │
├──────────────────────────────────────────────────────────────┤
│                      STATE (Zustand)                         │
│  marketStore │ savingsStore │ configStore │ appStore          │
├──────────────────────────────────────────────────────────────┤
│                    REGRAS DE NEGÓCIO                          │
│  projectionRules │ savingsRules │ disciplineRules             │
├──────────────────────────────────────────────────────────────┤
│                       SERVIÇOS                               │
│  bitcoinService │ selicService │ initService                 │
├──────────────────────────────────────────────────────────────┤
│                     REPOSITÓRIOS                             │
│  savingsRepo │ configRepo │ cacheRepo                        │
├──────────────────────────────────────────────────────────────┤
│                      SQLite (expo-sqlite)                    │
└──────────────────────────────────────────────────────────────┘
```

**Princípio:** Cada camada só conhece a camada imediatamente abaixo.  
- Screens **nunca** chamam repositórios diretamente.  
- Regras de negócio **nunca** acessam stores.  
- Serviços externos **nunca** escrevem no SQLite diretamente (passam pelo repository).

---

## 2. Estrutura de Pastas

```
src/
├── theme/
│   └── index.ts                  # Design tokens: cores, fontes, spacing, radii
│
├── components/
│   ├── base/                     # Componentes base reutilizáveis (atômicos)
│   │   ├── AppText.tsx           # Texto com fonte/cor/tamanho do tema
│   │   ├── AppTextInput.tsx      # Campo de texto estilizado
│   │   ├── AppButton.tsx         # Botão principal (dark bg + green glow)
│   │   ├── Card.tsx              # Container card (bg-card + border)
│   │   ├── SectionTitle.tsx      # Título de seção com linha/ícone
│   │   ├── Badge.tsx             # Badge de percentual (▲ +12% / ▼ -5%)
│   │   ├── Chip.tsx              # Chip de mercado (BTC price, SELIC rate)
│   │   ├── AppModal.tsx          # Modal base (backdrop + container animado)
│   │   ├── RadioOption.tsx       # Opção selecionável (radio button estilizado)
│   │   ├── EmptyState.tsx        # Estado vazio com ícone + mensagem
│   │   └── LoadingOverlay.tsx    # Overlay de loading com spinner
│   │
│   └── composed/                 # Componentes compostos (montados com base/)
│       ├── MarketChips.tsx       # Grupo de chips (BTC + SELIC)
│       ├── ProjectionCard.tsx    # Card de projeção (1a, 5a, 10a)
│       ├── ProjectionGroup.tsx   # Grupo de 3 ProjectionCards
│       ├── SummaryCards.tsx      # Grid de cards do Resumo
│       ├── DisciplineStats.tsx   # Stats de disciplina (registros, média, sequência)
│       ├── RankingList.tsx       # Top 5 maiores (valor + data + descrição + badge tipo)
│       ├── GrowthChart.tsx       # Gráfico de crescimento RF vs BTC
│       ├── HistoryItem.tsx       # Item individual do histórico
│       ├── HistoryList.tsx       # FlatList de HistoryItems
│       ├── SaveButton.tsx        # Botão fixo "Resolvi Economizar" com fade
│       ├── SaveModal.tsx         # Modal de confirmação (descrição + tipo investimento)
│       ├── DisclaimerText.tsx    # Disclaimer financeiro reutilizável
│       └── AttributionFooter.tsx # "Dados: CoinGecko • BCB" + link Legal
│
├── screens/
│   ├── SimulatorScreen.tsx       # Aba 1 — Simulador
│   ├── SummaryScreen.tsx         # Aba 2 — Resumo
│   ├── HistoryScreen.tsx         # Aba 3 — Histórico
│   └── LegalScreen.tsx           # Privacy Policy + Termos de Uso
│
├── navigation/
│   └── TopTabNavigator.tsx       # Material Top Tabs (3 abas)
│
├── stores/
│   ├── useMarketStore.ts         # Dados de mercado (BTC, SELIC, CAGRs)
│   ├── useSavingsStore.ts        # Economias, totais, top5
│   ├── useConfigStore.ts         # Configurações do usuário (taxa RF)
│   └── useAppStore.ts            # Estado do app (ready, loading, error)
│
├── rules/                        # Regras de negócio PURAS (sem side-effects)
│   ├── projectionRules.ts        # Cálculos de projeção RF e BTC
│   ├── savingsRules.ts           # Regras de salvamento e validação
│   ├── disciplineRules.ts        # Cálculos de disciplina (streak, média)
│   └── formatRules.ts            # Formatação de moeda, data, percentual
│
├── services/                     # Comunicação externa
│   ├── bitcoinService.ts         # Fetch CoinGecko (preço + histórico)
│   ├── selicService.ts           # Fetch BCB (taxa SELIC)
│   └── initService.ts            # Orquestração do boot do app
│
├── repositories/                 # Acesso ao SQLite
│   ├── database.ts               # Conexão + migrations
│   ├── savingsRepository.ts      # CRUD savings
│   ├── configRepository.ts       # CRUD config
│   └── cacheRepository.ts        # CRUD external_data_cache
│
├── hooks/                        # Hooks customizados
│   ├── useInitApp.ts             # Orquestra inicialização do app
│   ├── useProjections.ts         # Calcula projeções a partir de value + stores
│   └── useCurrencyInput.ts       # Lógica de input monetário (máscara R$)
│
├── utils/
│   └── debounce.ts               # Utilitário debounce para input
│
└── App.tsx                       # Entry point
```

---

## 3. Design System — Tema Centralizado

### Arquivo: `src/theme/index.ts`

Este é o **único arquivo** que define cores, fontes, espaçamentos e tamanhos.  
Todos os `StyleSheet.create()` dos componentes importam daqui.

```typescript
// src/theme/index.ts

export const colors = {
  // Backgrounds
  bgPrimary: '#0a0a0f',
  bgCard: '#12121e',
  bgCardHover: '#1a1a2e',
  bgInput: '#16162a',

  // Borders
  border: '#2a2a3a',
  borderFocus: '#6c5ce7',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0a0b8',
  textMuted: '#555570',
  textLabel: '#7878a0',

  // Accent (purple — tab indicator, focus rings)
  accent: '#6c5ce7',
  accentSoft: 'rgba(108, 92, 231, 0.15)',

  // Green (positivo, economias, botão)
  green: '#00d68f',
  greenSoft: 'rgba(0, 214, 143, 0.12)',
  greenText: '#00e69a',

  // Red (negativo, perdas)
  red: '#ff4757',
  redSoft: 'rgba(255, 71, 87, 0.12)',
  redText: '#ff6b7a',

  // Orange (alertas)
  orange: '#ffa726',
  orangeSoft: 'rgba(255, 167, 38, 0.12)',

  // Bitcoin
  btcOrange: '#f7931a',
  btcSoft: 'rgba(247, 147, 26, 0.12)',
} as const;

export const fonts = {
  // Família — usa system font do dispositivo
  regular: undefined,  // React Native usa system font por padrão
  bold: undefined,

  // Pesos (usados via fontWeight)
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const sizes = {
  // Texto
  textXs: 9,
  textSm: 10,
  textBase: 12,
  textMd: 13,
  textLg: 15,
  textXl: 17,
  text2xl: 19,
  text3xl: 22,

  // Inputs
  inputFontSize: 18,
  inputRateFontSize: 16,
  inputPaddingV: 10,
  inputPaddingH: 14,
  inputBorderRadius: 10,
  inputPrefixSize: 15,
  inputSuffixSize: 13,
  inputLabelSize: 12,

  // Chips
  chipPaddingV: 8,
  chipPaddingH: 10,
  chipIconSize: 16,
  chipLabelSize: 9,
  chipValueSize: 12,
  chipBorderRadius: 10,

  // Botão principal
  btnPaddingV: 14,
  btnFontSize: 14,
  btnBorderRadius: 12,

  // Ranking
  rankPaddingV: 7,
  rankPaddingH: 10,
  rankBadgeSize: 22,
  rankBadgeRadius: 6,
  rankBadgeFont: 11,
  rankAmountSize: 13,
  rankDateSize: 10,

  // Projection Cards
  projCardRadius: 12,
  projPeriodSize: 12,
  projLabelSize: 11,
  projValueSize: 12,
  projGainSize: 10,
  projSubSize: 10,

  // Summary Cards
  summaryCardPadding: 11,
  summaryCardRadius: 12,
  summaryLabelSize: 10,
  summaryValueSize: 17,
  summaryDetailSize: 10,

  // Discipline
  discPadding: 10,
  discRadius: 12,
  discEmojiSize: 20,
  discNumberSize: 15,
  discLabelSize: 9,

  // History Items
  histItemPaddingV: 10,
  histItemPaddingH: 12,
  histItemRadius: 12,
  histDateSize: 10,
  histAmountSize: 15,
  histProjLabelSize: 9,
  histProjValueSize: 12,
  histProjGainSize: 9,
} as const;

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  '4xl': 24,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
} as const;

// Atalho para usar nos StyleSheets
const theme = { colors, fonts, sizes, spacing, radii } as const;
export default theme;
```

### Como usar nos componentes

```typescript
// Em qualquer componente:
import theme from '@/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radii.xl,
    padding: theme.spacing['2xl'],
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.sizes.textLg,
    fontWeight: theme.fonts.weight.semibold,
  },
});
```

### Alias de importação

Configurar no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 4. Componentes Base Reutilizáveis

### 4.1 `AppText`

Componente de texto que aplica fonte e cor do tema automaticamente.

```typescript
// Props:
type AppTextProps = {
  variant?: 'primary' | 'secondary' | 'muted' | 'label' | 'green' | 'red' | 'btc';
  size?: keyof typeof sizes;       // ex: 'textSm', 'textLg', 'text2xl'
  weight?: keyof typeof fonts.weight;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;    // override pontual
};
```

Esse componente **elimina** a necessidade de definir `color` e `fontSize` em cada `StyleSheet`.  
Exemplo de uso: `<AppText variant="green" size="textXl" weight="bold">R$ 1.200</AppText>`

### 4.2 `AppTextInput`

Campo de texto com label acima, estilo do tema, suporte a prefix/suffix.

```typescript
type AppTextInputProps = {
  label: string;                   // "Quanto você gastaria?"
  value: string;
  onChangeText: (text: string) => void;
  prefix?: string;                 // "R$"
  suffix?: string;                 // "% a.a."
  keyboardType?: 'numeric' | 'decimal-pad';
  placeholder?: string;
};
```

- Background: `bgInput`  
- Border: `border` → `borderFocus` no focus  
- Tamanhos: todos do `theme.sizes.input*`

### 4.3 `AppButton`

Botão principal do app. Design do protótipo: fundo escuro + borda verde com glow.

```typescript
type AppButtonProps = {
  label: string;                   // "Resolvi Economizar"
  onPress: () => void;
  icon?: string;                   // emoji ou ícone
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';   // primary = dark+green glow, ghost = text only
};
```

Estilo do variant `primary` (conforme protótipo):
- Background: `#1a1a2e`
- Border: `1px solid rgba(0, 214, 143, 0.35)`
- Shadow: `0 0 20px rgba(0, 214, 143, 0.15)`
- Texto: `greenText` (#00e69a)
- Ícone: círculo com `✓` (fundo `rgba(0,214,143,0.15)`)

### 4.4 `Card`

Container genérico com background e borda do tema.

```typescript
type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;    // override de padding, margin, etc.
};
```

- Background: `bgCard` (#12121e)  
- Border: `border` (#2a2a3a)  
- BorderRadius: `radii.xl` (12)

### 4.5 `SectionTitle`

Título de seção com barra lateral colorida (como no protótipo).

```typescript
type SectionTitleProps = {
  title: string;                   // "PROJEÇÕES", "DISCIPLINA"
  color?: string;                  // cor da barra lateral (default: accent)
};
```

### 4.6 `Badge`

Badge de percentual (+12.5% / -3.2%).

```typescript
type BadgeProps = {
  value: number;                   // percentual (positivo ou negativo)
  size?: 'sm' | 'md';
};
```

- Positivo → fundo `greenSoft`, texto `greenText`, prefixo `▲`  
- Negativo → fundo `redSoft`, texto `redText`, prefixo `▼`

### 4.7 `Chip`

Chip de informação de mercado.

```typescript
type ChipProps = {
  icon: string;                    // "₿" ou "📊"
  label: string;                   // "BITCOIN" ou "SELIC"
  value: string;                   // "R$ 650.000" ou "14,25% a.a."
  accentColor: string;             // btcOrange ou accent
};
```

### 4.8 `AppModal`

Modal base reutilizável no estilo **bottom-sheet** com backdrop escuro e container animado.

```typescript
type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;                  // título no topo do modal
  subtitle?: string;               // subtítulo abaixo do título
  children: React.ReactNode;
};
```

- Backdrop: preto 70% de opacidade + blur (4px), fecha ao tocar fora
- Container: `bgCard` (#12121e) com `borderRadius: 20 20 0 0` (bottom-sheet)
- Handle bar: barra de 36×4px no topo (cor `border`) como indicador de arraste
- Animação: backdrop fade in + container slide up (usar `Animated` nativo do RN)
- Acessibilidade: `accessibilityViewIsModal={true}`

### 4.9 `RadioOption`

Opção selecionável tipo radio button para escolhas mutuamente exclusivas.

```typescript
type RadioOptionProps = {
  icon: string;                    // "📊" ou "₿"
  label: string;                   // "Renda Fixa" ou "Bitcoin"
  subtitle?: string;               // "Taxa: 12,5% a.a." ou "BTC: R$ 650.000"
  selected: boolean;
  onSelect: () => void;
  accentColor: string;             // green (RF) ou btcOrange (BTC)
};
```

- Não selecionado: fundo `bgInput`, borda `border`
- Selecionado: fundo com `accentColor` soft (12% opacidade), borda `accentColor`
- Transição suave entre estados

### 4.10 `EmptyState`

Exibido quando não há dados (ex: histórico vazio).

```typescript
type EmptyStateProps = {
  icon: string;
  title: string;
  subtitle?: string;
};
```

### 4.11 `LoadingOverlay`

Overlay semitransparente com spinner, usado durante inicialização.

---

## 5. Arquitetura de Dados e Fluxo de Props

### Princípio: **Screen como Controlador**

Cada Screen é o **componente-pai orquestrador** que:
1. Lê dados do Zustand store (via hooks seletores)
2. Calcula dados derivados via funções da camada `rules/`
3. Passa **dados prontos** e **callbacks** para os filhos via props
4. Filhos **nunca** acessam stores diretamente

```
SimulatorScreen (PAI)
│
├── Lê: useMarketStore(s => s.btcPrice)
├── Lê: useConfigStore(s => s.fixedRate)
├── Calcula: projectionRules.calculate(...)
├── State: modalVisible
│
├─→ MarketChips         props: { btcPrice, selicRate }
├─→ ProjectionGroup     props: { projections }
├─→ SaveButton          props: { onPress: openModal }
│      │
│      └── onPress → setModalVisible(true)
│
└─→ SaveModal           props: { visible, fixedRate, btcPrice,
       │                         onConfirm: callback, onClose: callback }
       │
       └── onConfirm(description, investmentType)
              → savingsStore.addSaving({ ...dados, description, investmentType })
              → setModalVisible(false) + limpa input + feedback
```

### Regra de Callbacks

Quando um componente-neto precisa disparar uma ação:

```
Screen (define callback) → Filho (repassa via prop) → Neto (chama prop)
```

**O callback é SEMPRE definido no Screen** e passado para baixo.  
Nenhum componente filho/neto cria side-effects por conta própria.

```typescript
// SimulatorScreen.tsx (CERTO ✅)
const handleOpenModal = useCallback(() => {
  if (amount <= 0) return;
  setModalVisible(true);
}, [amount]);

const handleConfirmSave = useCallback(async (
  description: string,
  investmentType: 'RF' | 'BTC'
) => {
  await savingsStore.addSaving({ amount, description, investmentType, ...marketData });
  setModalVisible(false);
  setInputAmount('');
}, [amount, marketData]);

return (
  <>
    <SaveButton onPress={handleOpenModal} />
    <SaveModal
      visible={modalVisible}
      amount={amount}
      fixedRate={fixedRate}
      btcPrice={btcPrice}
      onConfirm={handleConfirmSave}
      onClose={() => setModalVisible(false)}
    />
  </>
);

// SaveButton.tsx — componente puro, não sabe nada de stores
const SaveButton = React.memo(({ onPress }: { onPress: () => void }) => {
  return <AppButton label="Resolvi Economizar" onPress={onPress} />;
});

// SaveModal.tsx — gerencia estado INTERNO (description, investmentType)
// mas delega a ação de salvar ao pai via onConfirm callback
const SaveModal = React.memo(({ visible, amount, fixedRate, btcPrice, onConfirm, onClose }) => {
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'RF' | 'BTC'>('RF');  // RF pré-selecionado
  const canConfirm = description.trim().length > 0;

  // Reset state ao abrir
  useEffect(() => {
    if (visible) {
      setDescription('');
      setType('RF');
    }
  }, [visible]);

  return (
    <AppModal visible={visible} onClose={onClose}
             title="Registrar Economia" subtitle="Transforme essa decisão em investimento">
      <AmountDisplay amount={amount} />  {/* valor em destaque, somente leitura */}
      <AppTextInput label="O que você deixou de comprar?" maxLength={40} ... />
      <RadioOption label="Renda Fixa" subtitle={`Taxa: ${fixedRate}% a.a.`}
                   selected={type === 'RF'} ... />
      <RadioOption label="Bitcoin" subtitle={`BTC: R$ ${formatBRL(btcPrice)}`}
                   selected={type === 'BTC'} ... />
      <AppButton label="Confirmar" variant="confirm"
                 onPress={() => onConfirm(description, type)} disabled={!canConfirm} />
    </AppModal>
  );
});
```

### Diagrama Completo de Fluxo

```
┌─────────────────────────────────────────────────────────┐
│                   SimulatorScreen                        │
│                                                         │
│  [useMarketStore] → btcPrice, selicRate, cagrs          │
│  [useConfigStore] → fixedRate                           │
│  [useSavingsStore] → addSaving                          │
│  [useState] → inputAmount, modalVisible                 │
│                                                         │
│  projections = projectionRules.calculate(               │
│    inputAmount, fixedRate, cagrs, btcPrice               │
│  )                                                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────────┐                  │
│  │ MarketChips  │  │ ProjectionGroup  │                  │
│  │ btcPrice     │  │ projections[]    │                  │
│  │ selicRate    │  │                  │                  │
│  └──────────────┘  └──────────────────┘                  │
│                          │                               │
│                    ┌─────┴──────┐                         │
│                    │ Projection │  × 3 (1a, 5a, 10a)     │
│                    │ Card       │                         │
│                    └────────────┘                         │
│                                                         │
│  ┌──────────────────────────────────────┐                │
│  │        SaveButton                    │                │
│  │        onPress = openModal           │                │
│  └──────────────────────────────────────┘                │
│                                                         │
│  ┌──────────────────────────────────────┐                │
│  │        SaveModal                     │                │
│  │        visible = modalVisible        │                │
│  │        amount, fixedRate, btcPrice    │                │
│  │        onConfirm = handleConfirm     │                │
│  │        onClose = closeModal          │                │
│  └──────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│                   SummaryScreen                          │
│                                                         │
│  [useSavingsStore] → totals, topSavings, allSavings     │
│  [useMarketStore] → btcPrice                            │
│  [useConfigStore] → fixedRate                           │
│                                                         │
│  summaryData = savingsRules.calculateTotals(...)        │
│  → { totalSaved, investedProjection, rfPortion,         │
│      btcPortion, investedGain, investedGainPercent }    │
│  disciplineData = disciplineRules.calculate(...)        │
│  top5 = allSavings.slice(0, 5) (já ordenado no store)  │
│                                                         │
│  ┌──────────────┐  ┌──────────────────┐                  │
│  │ SummaryCards │  │ DisciplineStats  │                  │
│  │ summaryData  │  │ stats            │                  │
│  └──────────────┘  └──────────────────┘                  │
│                                                         │
│  SummaryCards exibe:                                     │
│  • Total Economizado (totalSaved)                       │
│  • Projeção Investida (investedProjection + gain%)      │
│  • Breakdown: rfPortion + btcPortion                    │
│                                                         │
│  ┌──────────────────────────────────────┐                │
│  │        RankingList                   │                │
│  │        items = top5                  │                │
│  └──────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│                   HistoryScreen                          │
│                                                         │
│  [useSavingsStore] → allSavings                         │
│  [useMarketStore] → btcPrice                            │
│  [useConfigStore] → fixedRate                           │
│                                                         │
│  enrichedSavings = savingsRules.enrichWithProjections(  │
│    allSavings, fixedRate, btcPrice                       │
│  )                                                       │
│  chartData = savingsRules.buildChartData(...)            │
│                                                         │
│  ┌──────────────┐  ┌──────────────────┐                  │
│  │ GrowthChart  │  │ HistoryList      │                  │
│  │ chartData    │  │ items=enriched   │                  │
│  └──────────────┘  │   renderItem →   │                  │
│                    │   HistoryItem    │                  │
│                    └──────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## 6. State Management — Zustand

### 6.1 Stores (4 stores separados por domínio)

#### `useMarketStore`

```typescript
type MarketState = {
  btcPrice: number;              // Preço atual BTC em BRL
  selicRate: number;             // SELIC % a.a.
  cagr1y: number;               // CAGR BTC 1 ano
  cagr5y: number;               // CAGR BTC 5 anos
  cagr10y: number;              // CAGR BTC 10 anos
  lastFetchDate: string | null;  // ISO date do último fetch

  // Actions
  setMarketData: (data: Partial<MarketState>) => void;
  reset: () => void;
};
```

#### `useSavingsStore`

```typescript
type SavingsState = {
  savings: Saving[];             // Todas as economias (mais recentes primeiro)
  totalSaved: number;            // SUM(amount)
  count: number;                 // Total de registros

  // Actions
  addSaving: (saving: NewSaving) => Promise<void>;   // insert + reload
  loadSavings: () => Promise<void>;                   // fetch all do SQLite
};
```

#### `useConfigStore`

```typescript
type ConfigState = {
  fixedRate: number;             // Taxa RF definida pelo usuário (% a.a.)

  // Actions
  setFixedRate: (rate: number) => void;   // salva no SQLite + atualiza store
  loadConfig: () => Promise<void>;
};
```

#### `useAppStore`

```typescript
type AppState = {
  isReady: boolean;              // App terminou de inicializar
  isLoading: boolean;            // Está fazendo fetch
  error: string | null;          // Erro de inicialização
  hasCache: boolean;             // Tem cache de dados anteriores

  // Actions
  setReady: () => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
};
```

### 6.2 Regras de Uso nos Componentes

**Usar seletores granulares** para evitar re-renders desnecessários:

```typescript
// ✅ CERTO — só re-renderiza quando btcPrice muda
const btcPrice = useMarketStore(s => s.btcPrice);

// ❌ ERRADO — re-renderiza quando QUALQUER coisa no store muda
const store = useMarketStore();
```

**Screens são os únicos que leem stores.** Componentes base/compostos recebem dados via props.

---

## 7. Camada de Regras de Negócio

### Princípio

Arquivos em `rules/` contêm **funções puras** — recebem dados, retornam resultado.  
Zero dependência de React, Zustand, SQLite ou qualquer library.  
Isso permite testabilidade isolada e reutilização.

### 7.1 `projectionRules.ts`

```typescript
// --- Tipos ---
type Projection = {
  period: '1y' | '5y' | '10y';
  label: string;                 // "1 ano", "5 anos", "10 anos"
  fixedIncome: number;           // Valor projetado RF
  fixedIncomeGain: number;       // % ganho RF
  bitcoin: number;               // Valor projetado BTC
  bitcoinGain: number;           // % ganho BTC
  btcEquivalent: number;         // Quanto em BTC o valor equivale
};

// --- Funções exportadas ---

/**
 * Calcula projeção de renda fixa (juros compostos)
 * V = amount × (1 + rate)^years
 */
function calculateFixedIncome(amount: number, annualRate: number, years: number): number

/**
 * Calcula projeção de BTC baseado no CAGR histórico
 * V = amount × (1 + cagr)^years
 */
function calculateBitcoin(amount: number, cagr: number, years: number): number

/**
 * Calcula CAGR a partir de preço atual e histórico
 * CAGR = (Vfinal / Vinicial)^(1/n) - 1
 */
function calculateCAGR(currentPrice: number, historicalPrice: number, years: number): number

/**
 * Gera as 3 projeções (1a, 5a, 10a) completas
 */
function calculateProjections(
  amount: number,
  fixedRate: number,
  btcPrice: number,
  cagrs: { y1: number; y5: number; y10: number }
): Projection[]

/**
 * Calcula valor atualizado de uma economia salva (RF)
 * V = amount × (1 + currentRate)^elapsedYears
 */
function calculateCurrentFixedValue(
  amount: number,
  currentRate: number,
  savedAt: Date
): number

/**
 * Calcula valor atualizado de uma economia salva (BTC)
 * V = btcEquivalent × currentBtcPrice
 */
function calculateCurrentBtcValue(
  btcEquivalentAtSave: number,
  currentBtcPrice: number
): number
```

### 7.2 `savingsRules.ts`

```typescript
/**
 * Valida se um saving pode ser criado
 * - amount > 0
 * - btcPrice > 0
 * - description não vazia (trim)
 * - investmentType é 'RF' ou 'BTC'
 */
function validateSaving(
  amount: number,
  btcPrice: number,
  description: string,
  investmentType: 'RF' | 'BTC'
): { valid: boolean; error?: string }

/**
 * Monta o objeto NewSaving com todos os campos derivados
 */
function buildNewSaving(
  amount: number,
  description: string,
  investmentType: 'RF' | 'BTC',
  fixedRate: number,
  btcPrice: number,
  selicRate: number,
  cagrs: CAGRs
): NewSaving

/**
 * Enriquece lista de savings com projeções atualizadas
 * (para exibição no Histórico)
 */
function enrichWithProjections(
  savings: Saving[],
  currentFixedRate: number,
  currentBtcPrice: number
): EnrichedSaving[]

/**
 * Calcula totais para os SummaryCards.
 * A "Projeção Investida" soma as projeções individuais de cada registro
 * usando o tipo de investimento escolhido (RF ou BTC) naquele registro.
 */
function calculateTotals(
  savings: Saving[],
  currentFixedRate: number,
  currentBtcPrice: number
): SummaryTotals

// SummaryTotals shape:
type SummaryTotals = {
  totalSaved: number;              // soma de todos os amounts
  investedProjection: number;      // soma das projeções conforme tipo escolhido
  investedGain: number;            // investedProjection - totalSaved
  investedGainPercent: number;     // (investedGain / totalSaved) * 100
  rfPortion: {                     // registros onde investment_type = 'RF'
    count: number;
    totalSaved: number;
    projection: number;
  };
  btcPortion: {                    // registros onde investment_type = 'BTC'
    count: number;
    totalSaved: number;
    projection: number;
  };
};

/**
 * Monta dados para o gráfico de crescimento
 */
function buildChartData(
  savings: Saving[],
  currentFixedRate: number,
  currentBtcPrice: number
): ChartDataPoint[]
```

### 7.3 `disciplineRules.ts`

```typescript
type DisciplineStats = {
  totalRecords: number;
  averagePerMonth: number;
  currentStreak: number;        // dias consecutivos (ou meses)
  bestStreak: number;
  emoji: string;                // baseado no streak
};

function calculateDiscipline(savings: Saving[]): DisciplineStats
```

### 7.4 `formatRules.ts`

```typescript
/**
 * Formata valor em BRL: "R$ 1.234,56"
 */
function formatBRL(value: number): string

/**
 * Formata valor em BTC: "0,00182400 BTC"
 */
function formatBTC(value: number): string

/**
 * Formata percentual: "+12,5%" ou "-3,2%"
 */
function formatPercent(value: number): string

/**
 * Formata data: "21/02/2026"
 */
function formatDate(date: Date | string): string

/**
 * Formata data relativa: "há 3 dias", "há 1 mês"
 */
function formatRelativeDate(date: Date | string): string
```

> ⚠️ **Importante:** Usar formatação manual (não depender 100% do `Intl.NumberFormat` do device).  
> Implementar com template literals + `.toFixed()` + `.replace()` para consistência cross-platform.

---

## 8. Camada de Dados — Repositories

### 8.1 `database.ts` — Conexão + Migrations

```typescript
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('compensa.db');
    await runMigrations(db);
  }
  return db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
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

    CREATE TABLE IF NOT EXISTS external_data_cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
```

### 8.2 `savingsRepository.ts`

```typescript
async function insert(saving: NewSaving): Promise<number>
async function getAll(): Promise<Saving[]>                    // ORDER BY created_at DESC
async function getTopN(n: number): Promise<Saving[]>          // ORDER BY amount DESC LIMIT n
async function getTotalAmount(): Promise<number>              // SELECT SUM(amount)
async function getCount(): Promise<number>                    // SELECT COUNT(*)
async function deleteById(id: number): Promise<void>
```

### 8.3 `configRepository.ts`

```typescript
async function get(key: string): Promise<string | null>
async function set(key: string, value: string): Promise<void>
```

### 8.4 `cacheRepository.ts`

```typescript
async function get(key: string): Promise<CacheEntry | null>
async function set(key: string, value: any): Promise<void>
async function isValid(key: string): Promise<boolean>         // existe + fetched_at é "hoje"
```

---

## 9. Camada de Serviços Externos

### 9.1 `bitcoinService.ts`

```typescript
type BtcData = {
  currentPrice: number;
  cagr1y: number;
  cagr5y: number;
  cagr10y: number;
};

async function fetchBitcoinData(): Promise<BtcData> {
  // 1. GET /simple/price → preço atual
  // 2. GET /coins/bitcoin/market_chart?days=3650 → histórico
  // 3. Extrai preços de 1, 5, 10 anos atrás
  // 4. Calcula CAGRs via projectionRules.calculateCAGR()
  // 5. Retorna BtcData
}
```

- Usa `fetch()` nativo (sem axios)
- Timeout de 10s
- Throw em caso de falha (quem chama trata)

### 9.2 `selicService.ts`

```typescript
async function fetchSelicRate(): Promise<number> {
  // GET /dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json
  // Retorna taxa como number
}
```

### 9.3 `initService.ts`

```typescript
async function initializeApp(): Promise<void> {
  // 1. Abre banco SQLite (database.ts)
  // 2. Carrega config do SQLite → configStore
  // 3. Carrega savings do SQLite → savingsStore
  // 4. Tenta fetch BTC + SELIC
  //    - Sucesso → salva no cache + atualiza marketStore
  //    - Falha + cache existe → carrega do cache + atualiza marketStore
  //    - Falha + sem cache → appStore.setError(msg)
  // 5. appStore.setReady()
}
```

---

## 10. Performance — Regras e Padrões

### 10.1 Regras Obrigatórias

| Regra | Onde | Como |
|---|---|---|
| **Seletores granulares no Zustand** | Screens | `useStore(s => s.campo)` — nunca `useStore()` |
| **React.memo em todos os componentes base e compostos** | `components/` | `export default React.memo(Component)` |
| **useCallback em TODOS os callbacks passados via props** | Screens | `const fn = useCallback(() => {...}, [deps])` |
| **useMemo para dados derivados/cálculos** | Screens | `const projections = useMemo(() => calc(...), [deps])` |
| **FlatList (não ScrollView) para listas** | HistoryList | `FlatList` com `keyExtractor`, `getItemLayout` se possível |
| **Debounce no input de valor** | SimulatorScreen | Debounce de 300ms antes de recalcular projeções |
| **Evitar objetos/arrays inline em props** | Todos | Definir fora do render ou em useMemo |

### 10.2 Padrão de Componente com Memo

```typescript
// components/composed/ProjectionCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Badge, Card } from '@/components/base';
import theme from '@/theme';
import type { Projection } from '@/rules/projectionRules';

type Props = {
  projection: Projection;
};

function ProjectionCard({ projection }: Props) {
  return (
    <Card style={styles.container}>
      {/* ... render usando projection props ... */}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
});

export default React.memo(ProjectionCard);
```

### 10.3 Padrão de Screen com useMemo + useCallback

```typescript
// screens/SimulatorScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useMarketStore } from '@/stores/useMarketStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { calculateProjections } from '@/rules/projectionRules';
import { buildNewSaving, validateSaving } from '@/rules/savingsRules';
import { useDebounce } from '@/hooks/useDebounce'; // se necessário

export default function SimulatorScreen() {
  const [inputAmount, setInputAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Seletores granulares — cada um causa re-render SOMENTE quando seu valor muda
  const btcPrice = useMarketStore(s => s.btcPrice);
  const selicRate = useMarketStore(s => s.selicRate);
  const cagr1y = useMarketStore(s => s.cagr1y);
  const cagr5y = useMarketStore(s => s.cagr5y);
  const cagr10y = useMarketStore(s => s.cagr10y);
  const fixedRate = useConfigStore(s => s.fixedRate);
  const addSaving = useSavingsStore(s => s.addSaving);

  const amount = parseFloat(inputAmount) || 0;

  // Memoiza cálculo pesado — só recalcula quando inputs mudam
  const projections = useMemo(
    () => calculateProjections(amount, fixedRate, btcPrice, { y1: cagr1y, y5: cagr5y, y10: cagr10y }),
    [amount, fixedRate, btcPrice, cagr1y, cagr5y, cagr10y]
  );

  // Abre modal ao clicar em "Resolvi Economizar"
  const handleOpenModal = useCallback(() => {
    if (amount <= 0) return;
    setModalVisible(true);
  }, [amount]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Callback de confirmação do modal — recebe description e investmentType do SaveModal
  const handleConfirmSave = useCallback(async (
    description: string,
    investmentType: 'RF' | 'BTC'
  ) => {
    const validation = validateSaving(amount, btcPrice, description, investmentType);
    if (!validation.valid) return;

    const newSaving = buildNewSaving(
      amount, description, investmentType,
      fixedRate, btcPrice, selicRate,
      { y1: cagr1y, y5: cagr5y, y10: cagr10y }
    );
    await addSaving(newSaving);
    setModalVisible(false);
    setInputAmount('');
    // feedback visual (toast)
  }, [amount, fixedRate, btcPrice, selicRate, cagr1y, cagr5y, cagr10y, addSaving]);

  return (
    <>
      <ScrollView>
        {/* Passa props calculados para baixo */}
        {/* <SaveButton onPress={handleOpenModal} /> */}
      </ScrollView>

      <SaveModal
        visible={modalVisible}
        fixedRate={fixedRate}
        btcPrice={btcPrice}
        onConfirm={handleConfirmSave}
        onClose={handleCloseModal}
      />
    </>
  );
}
```

### 10.4 O que NÃO fazer

```typescript
// ❌ Objeto criado a cada render — causa re-render do filho
<MarketChips data={{ btc: btcPrice, selic: selicRate }} />

// ✅ Props primitivos ou memoizados
<MarketChips btcPrice={btcPrice} selicRate={selicRate} />

// ❌ Função inline — nova referência a cada render, quebra React.memo
<SaveButton onSave={() => handleSave()} />

// ✅ Referência estável via useCallback
<SaveButton onSave={handleSave} />

// ❌ Store inteiro — re-renderiza quando QUALQUER campo muda
const { btcPrice, selicRate } = useMarketStore();

// ✅ Seletores individuais
const btcPrice = useMarketStore(s => s.btcPrice);
const selicRate = useMarketStore(s => s.selicRate);
```

---

## 11. Navegação — 3 Abas

### Atualização do Protótipo

O protótipo validado define **3 abas** (diferente do plano original que tinha 2):

| Aba | Nome | Conteúdo |
|---|---|---|
| 1 | **Simulador** | Hero + Inputs + Market Chips + Projeções + Botão fixo |
| 2 | **Resumo** | Summary Cards + Discipline Stats + Top 5 Ranking |
| 3 | **Histórico** | Gráfico de crescimento + Lista de economias |

### `TopTabNavigator.tsx`

```typescript
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SimulatorScreen from '@/screens/SimulatorScreen';
import SummaryScreen from '@/screens/SummaryScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import theme from '@/theme';

const Tab = createMaterialTopTabNavigator();

export default function TopTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.bgPrimary,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.bgCardHover,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarActiveTintColor: theme.colors.textPrimary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarIndicatorStyle: {
          backgroundColor: theme.colors.accent,
          height: 3,
        },
        swipeEnabled: true,
        lazy: true,       // Só renderiza aba quando visitada pela 1ª vez
      }}
    >
      <Tab.Screen name="Simulador" component={SimulatorScreen} />
      <Tab.Screen name="Resumo" component={SummaryScreen} />
      <Tab.Screen name="Histórico" component={HistoryScreen} />
    </Tab.Navigator>
  );
}
```

### Pontos-chave

- `lazy: true` → Performance: abas são renderizadas sob demanda
- `swipeEnabled: true` → Swipe entre abas (padrão mobile)
- Tab indicator: cor `accent` (#6c5ce7) conforme protótipo
- Background da tab bar: `bgPrimary` (#0a0a0f)

---

## 12. Telas — Mapeamento Protótipo → Código

### 12.1 Aba Simulador — `SimulatorScreen.tsx`

```
┌──────────────────────────────────────────────┐
│  Hero Section                                │  → AppText (variant="primary", size="text2xl")
│  "Quanto você gastaria?"                     │    AppText (variant="secondary", size="textSm")
│  "Simule o retorno se investisse"            │
│                                              │
│  Input Valor                                 │  → AppTextInput (prefix="R$", keyboardType="numeric")
│  R$ [__________]                             │    useCurrencyInput hook para máscara
│                                              │
│  Input Taxa                                  │  → AppTextInput (suffix="% a.a.", keyboardType="decimal-pad")
│  [__12.5__] % a.a.                           │
│                                              │
│  Market Chips                                │  → MarketChips (btcPrice, selicRate)
│  ₿ BTC: R$ 650.000  │  📊 SELIC: 14,25%     │    └── Chip × 2
│                                              │
│  ── PROJEÇÕES ──                             │  → SectionTitle (title="PROJEÇÕES")
│                                              │
│  Card 10 anos                                │  → ProjectionGroup (projections)
│  Card 1 ano (BTC primeiro, depois RF)        │    └── ProjectionCard × 3
│  Card 5 anos                                 │       (ordem: 10a, 1a, 5a conforme protótipo)
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  ✅ RESOLVI ECONOMIZAR               │    │  → SaveButton (onPress=openModal, fixo no bottom)
│  └──────────────────────────────────────┘    │    Position absolute + LinearGradient fade
│                                              │
│  ┌── MODAL (bottom-sheet, quando visível) ──┐   │  → SaveModal (visible, amount, onConfirm, onClose)
│  │                                       │   │    Usa AppModal (bottom-sheet) + AmountDisplay
│  │   ────── (handle bar) ──────           │   │    + AppTextInput + RadioOption + AppButton
│  │                                       │   │
│  │  💰 Registrar Economia                │   │
│  │  Transforme essa decisão em invest.   │   │  → AppModal title + subtitle
│  │                                       │   │
│  │  ┌───────────────────────────────┐    │   │  → AmountDisplay (amount, somente leitura)
│  │  │   VALOR ECONOMIZADO           │    │   │    Texto verde grande, fundo bgPrimary
│  │  │        R$ 350,00              │    │   │
│  │  └───────────────────────────────┘    │   │
│  │                                       │   │
│  │  O que você deixou de comprar?        │   │
│  │  ┌───────────────────────────────┐    │   │  → AppTextInput (placeholder, maxLength=40)
│  │  │ Ex: Relógio, celular, balada  │    │   │
│  │  └───────────────────────────────┘    │   │
│  │                                       │   │
│  │  Onde pretende investir?              │   │
│  │                                       │   │
│  │  ┌─ ◉ 📊 Renda Fixa ────────────┐    │   │  → RadioOption (selected, accentColor=green)
│  │  │  Taxa configurada: 12,5% a.a.│    │   │    Pré-selecionado por padrão
│  │  └───────────────────────────────┘    │   │
│  │  ┌─ ○ ₿ Bitcoin ─────────────────┐    │   │  → RadioOption (selected, accentColor=btcOrange)
│  │  │  BTC: R$ 650.000,00          │    │   │    Detalhe: preço atual do BTC
│  │  └───────────────────────────────┘    │   │
│  │                                       │   │
│  │  ┌───────────────────────────────┐    │   │  → AppButton variant="confirm" (verde sólido)
│  │  │  ✅ CONFIRMAR                 │    │   │    disabled até preencher descrição
│  │  └───────────────────────────────┘    │   │
│  └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

**O botão "Resolvi Economizar" é fixo no bottom** com gradiente fade sobre o scroll.  
Ao clicar, abre o `SaveModal` (bottom-sheet) com o valor do input já exibido em destaque.  
Implementar com `position: 'absolute'` no container + `LinearGradient` acima do botão.

**Regras do SaveModal:**
- Modal sobe do bottom com animação slide-up + fade no backdrop.
- O **valor economizado** é exibido em destaque (somente leitura, greenText, fundo bgPrimary).
- O campo "descrição" é obrigatório (mín. 1 caractere, máx. 40).
- O tipo de investimento começa **pré-selecionado em RF** (Renda Fixa).
- Cada radio option mostra ícone + nome + detalhe contextual (taxa RF ou preço BTC atual).
- Botão "Confirmar" verde sólido, desabilitado até descrição ser preenchida.
- Clicar no backdrop escuro fecha o modal (cancelamento).
- State do modal reseta ao abrir (descrição limpa, tipo volta pra RF).

### 12.2 Aba Resumo — `SummaryScreen.tsx`

```
┌──────────────────────────────────────────────┐
│  ── 💰 RESUMO ──                             │  → SectionTitle
│                                              │
│  ┌──────────────────────────────────┐        │  → SummaryCards (summaryData)
│  │ Total Economizado    R$ 15.430   │        │    Card full-width
│  └──────────────────────────────────┘        │
│  ┌──────────────────────────────────┐        │    Card full-width
│  │ Projeção Investida   R$ 18.605   │        │    Usa tipo escolhido de cada registro
│  │ ▲ +R$ 3.175 (+20,58%)           │        │
│  │ ──────────────────────────────── │        │    Breakdown separador
│  │ 🟢 Em RF      │ 🟠 Em BTC       │        │    rfPortion + btcPortion
│  │ R$ 9.562      │ R$ 9.043        │        │
│  │ 18 reg.       │ 14 reg.         │        │
│  └──────────────────────────────────┘        │
│                                              │
│  ── 🏆 DISCIPLINA ──                         │  → SectionTitle
│                                              │
│  ┌────┐ ┌────┐ ┌────┐                       │  → DisciplineStats (stats)
│  │ 32 │ │R482│ │ 🔥5│                       │    Grid 3 colunas
│  │regs│ │/mês│ │seq │                       │    Card com emoji + número + label
│  └────┘ └────┘ └────┘                       │
│                                              │
│  ── 🥇 TOP 5 MAIORES ──                      │  → SectionTitle
│                                              │
│  1. R$ 2.500 — 15/01/2026                    │  → RankingList (items)
│     🏷️ Tênis              📊 RF               │    └── RankingItem × 5
│  2. R$ 1.800 — 03/02/2026                    │       Exibe: valor + data + descrição + badge tipo
│     🏷️ Celular            ₿ BTC              │       Badge: verde (RF) ou laranja (BTC)
│  3. R$ 1.500 — 22/12/2025                    │
│     🏷️ Viagem             ₿ BTC              │
│  4. R$ 1.200 — ...                           │
│  5. R$ 350 — ...                             │
└──────────────────────────────────────────────┘
```

> **Projeção Investida:** O `SummaryCards` recebe `SummaryTotals` de `calculateTotals`. A projeção investida é a soma das projeções individuais, onde cada registro usa a projeção do tipo de investimento que o usuário escolheu (RF ou BTC). O breakdown mostra a separação por tipo.

### 12.3 Aba Histórico — `HistoryScreen.tsx`

```
┌──────────────────────────────────────────────┐
│  ── CRESCIMENTO ──                           │  → SectionTitle
│                                              │
│  📊 Gráfico RF vs BTC                       │  → GrowthChart (chartData)
│  (line chart, cores green + btcOrange)       │    react-native-chart-kit ou victory-native
│                                              │
│  ── HISTÓRICO ──                             │  → SectionTitle
│                                              │
│  ┌─ 21/02/2026 ─── R$ 350,00 ──────────┐    │  → HistoryList
│  │🟠 🏷️ Balada          ₿ Bitcoin       │    │    border-left colored by type
│  │  ┌── RF HOJE ──┐  ┌── BTC HOJE ──┐  │    │    └── FlatList
│  │  │ R$ 351,20   │  │ R$ 362,50    │  │    │       └── HistoryItem × N
│  │  │ ▲ +0,3%     │  │ ▲ +3,6%      │  │    │          (React.memo)
│  │  └─────────────┘  └──────────────┘  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─ 15/02/2026 ─── R$ 1.200,00 ────────┐    │    Borda esquerda: 3px
│  │🟢 🏷️ Relógio      📊 Renda Fixa     │    │    Verde = RF, Laranja = BTC
│  │  ...                                 │    │    Meta row: descrição + badge tipo
│  └──────────────────────────────────────┘    │    Projections: mantém RF + BTC
│                                              │
│  (Empty State quando não há registros)       │  → EmptyState
└──────────────────────────────────────────────┘
```

---

## 13. Inicialização do App

### Fluxo de Boot

```
App.tsx monta
    │
    ├─ Exibe splash / LoadingOverlay
    │
    ├─ useInitApp() dispara:
    │   │
    │   ├─ 1. database.getDatabase() → abre SQLite + migrations
    │   │
    │   ├─ 2. configRepo.get('fixedRate') → configStore.setFixedRate()
    │   │      (default: 12.5 se não existir)
    │   │
    │   ├─ 3. savingsRepo.getAll() → savingsStore.loadSavings()
    │   │
    │   ├─ 4. fetch em paralelo:
    │   │      ├─ bitcoinService.fetchBitcoinData()
    │   │      └─ selicService.fetchSelicRate()
    │   │
    │   ├─ 5a. Sucesso → salva no cacheRepo + marketStore.setMarketData()
    │   │
    │   ├─ 5b. Falha + cache existe → cacheRepo.get() + marketStore.setMarketData()
    │   │      (mostra badge "dados de [data]")
    │   │
    │   ├─ 5c. Falha + sem cache → appStore.setError("Conecte à internet...")
    │   │
    │   └─ 6. appStore.setReady(true) → remove splash
    │
    └─ TopTabNavigator renderiza
```

### `useInitApp.ts`

```typescript
import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { initializeApp } from '@/services/initService';

export function useInitApp() {
  const setReady = useAppStore(s => s.setReady);
  const setLoading = useAppStore(s => s.setLoading);
  const setError = useAppStore(s => s.setError);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setLoading(true);
      try {
        await initializeApp();
        if (mounted) setReady();
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();
    return () => { mounted = false; };
  }, []);
}
```

---

## 14. Convenções de Código

### 14.1 Nomenclatura

| Item | Padrão | Exemplo |
|---|---|---|
| Arquivos de componente | PascalCase.tsx | `ProjectionCard.tsx` |
| Arquivos de lógica | camelCase.ts | `projectionRules.ts` |
| Stores | useXxxStore.ts | `useMarketStore.ts` |
| Hooks | useXxx.ts | `useInitApp.ts` |
| Tipos/Interfaces | PascalCase | `type Projection = {...}` |
| Constantes | UPPER_SNAKE | `const MAX_RANKING = 5` |
| Props | PascalCase + "Props" | `type CardProps = {...}` |

### 14.2 Estrutura de Componente

Todo componente segue essa ordem:

```typescript
// 1. Imports
import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '@/theme';

// 2. Types
type Props = {
  // ...
};

// 3. Component
function MyComponent({ prop1, prop2 }: Props) {
  // hooks
  // callbacks
  // render
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
}

// 4. Styles
const styles = StyleSheet.create({
  container: {
    // usa theme.*
  },
});

// 5. Export com memo
export default React.memo(MyComponent);
```

### 14.3 Regras Gerais

- **TypeScript strict:** `strict: true` no tsconfig
- **Sem `any`:** Usar tipos explícitos ou `unknown` quando necessário
- **Sem `console.log` em produção:** Usar `__DEV__` guard ou remover
- **Imports com alias:** Sempre `@/` em vez de `../../../`
- **1 componente por arquivo:** Sem exceções
- **Exports nomeados para tipos, default para componentes**

### 14.4 Padrão de Commit

```
feat: add ProjectionCard component
fix: correct CAGR calculation for periods < 10y
refactor: extract formatBRL to formatRules
style: adjust chip spacing to match prototype
```

---

## 15. Checklist de Implementação

### Fase 0 — Setup

- [ ] `npx create-expo-app compensa-app --template blank-typescript`
- [ ] Configurar `tsconfig.json` com path alias `@/`
- [ ] Instalar dependências:
  - `expo-sqlite`
  - `@react-navigation/native`
  - `@react-navigation/material-top-tabs`
  - `react-native-pager-view`
  - `react-native-screens`
  - `react-native-safe-area-context`
  - `zustand`
  - `react-native-chart-kit` ou `victory-native`
  - `expo-linear-gradient`
- [ ] Criar estrutura de pastas conforme seção 2
- [ ] Criar `src/theme/index.ts` com todos os tokens do protótipo
- [ ] Configurar ESLint + Prettier
- [ ] Configurar `app.json` com bundle ID, infoPlist, permissions
- [ ] Configurar `eas.json` com imagens de build para iOS 26 SDK

### Fase 1 — Componentes Base

- [ ] `AppText` (com `allowFontScaling`, `accessibilityRole`)
- [ ] `AppTextInput` (com `accessibilityLabel`, `accessibilityHint`)
- [ ] `AppButton` (com `accessibilityRole="button"`, touch target ≥44pt)
- [ ] `Card`
- [ ] `SectionTitle`
- [ ] `Badge`
- [ ] `Chip`
- [ ] `AppModal` (com `accessibilityViewIsModal={true}`)
- [ ] `RadioOption` (com `accessibilityRole="radio"`, `accessibilityState`)
- [ ] `EmptyState`
- [ ] `LoadingOverlay`

### Fase 2 — Banco + Repositories

- [ ] `database.ts` — conexão + migrations
- [ ] `savingsRepository.ts`
- [ ] `configRepository.ts`
- [ ] `cacheRepository.ts`
- [ ] Testar CRUD com dados mock

### Fase 3 — Regras de Negócio

- [ ] `projectionRules.ts` — CAGR, juros compostos, projeções
- [ ] `savingsRules.ts` — validação, build, enrich, totais
- [ ] `disciplineRules.ts` — streak, média, stats
- [ ] `formatRules.ts` — BRL, BTC, percentual, data

### Fase 4 — Stores + Services

- [ ] `useMarketStore.ts`
- [ ] `useSavingsStore.ts`
- [ ] `useConfigStore.ts`
- [ ] `useAppStore.ts`
- [ ] `bitcoinService.ts`
- [ ] `selicService.ts`
- [ ] `initService.ts`
- [ ] `useInitApp.ts` hook

### Fase 5 — Componentes Compostos

- [ ] `MarketChips` (com atribuição CoinGecko)
- [ ] `ProjectionCard` + `ProjectionGroup`
- [ ] `SummaryCards`
- [ ] `DisciplineStats`
- [ ] `RankingList`
- [ ] `GrowthChart`
- [ ] `HistoryItem` + `HistoryList`
- [ ] `SaveButton` (fixo + fade)
- [ ] `SaveModal` (bottom-sheet: amount display + descrição + tipo investimento + confirmar)
- [ ] `DisclaimerText` — componente de disclaimer financeiro reutilizável

### Fase 6 — Telas + Navegação

- [ ] `TopTabNavigator.tsx`
- [ ] `SimulatorScreen.tsx` (com disclaimer financeiro no rodapé)
- [ ] `SummaryScreen.tsx`
- [ ] `HistoryScreen.tsx`
- [ ] `LegalScreen.tsx` (Privacy Policy + Termos de Uso)
- [ ] `App.tsx` com boot flow

### Fase 7 — Compliance & Acessibilidade

- [ ] Criar página web de Privacy Policy (GitHub Pages ou similar)
- [ ] Implementar `LegalScreen` com visualização da Privacy Policy e Termos
- [ ] Adicionar link "Sobre / Legal" acessível via ícone ⚙️ no header ou rodapé
- [ ] Adicionar `DisclaimerText` no `SimulatorScreen` (abaixo das projeções)
- [ ] Adicionar "Dados: CoinGecko • BCB" no rodapé do Simulador
- [ ] Revisar TODOS os componentes com `accessibilityLabel`
- [ ] Testar navegação por VoiceOver (iOS) e TalkBack (Android)
- [ ] Garantir touch targets ≥ 44×44pt em todos os botões
- [ ] Validar contraste WCAG AA em todos os textos funcionais
- [ ] Testar em redes IPv6 (requisito Apple 2.5.5)
- [ ] Remover todos os `console.log` (usar guard `__DEV__`)

### Fase 8 — Polish & QA

- [ ] Pull-to-refresh no Simulador
- [ ] Animação ao salvar economia
- [ ] Ícone + splash screen (1024×1024 iOS, 512×512 Android)
- [ ] Badge "dados de [data]" quando offline
- [ ] Empty states nas 3 telas
- [ ] Testes em dispositivo real iOS
- [ ] Testes em dispositivo real Android
- [ ] Testar edge cases (valor 0, taxa 0, sem internet, app kill + reopen)
- [ ] Verificar tamanho do bundle (< 25MB ideal)

### Fase 9 — Build & Submissão

- [ ] Criar contas de dev (Apple Developer $99 + Google Play $25)
- [ ] Registrar Bundle ID no Apple Developer Portal
- [ ] Criar App Record no App Store Connect
- [ ] Criar App no Google Play Console
- [ ] Configurar `eas.json` com credenciais de submit
- [ ] EAS Build production (iOS .ipa + Android .aab)
- [ ] Testar builds de produção em TestFlight (iOS) e Internal Testing (Android)
- [ ] Capturar screenshots para todas as resoluções requeridas
- [ ] Preencher App Store Connect:
  - [ ] Nome, subtítulo, descrição, keywords
  - [ ] Screenshots e previews
  - [ ] Categoria: Finance
  - [ ] Privacy Policy URL
  - [ ] Privacy Nutrition Labels ("Data Not Collected")
  - [ ] Age Rating questionnaire (respostas para 4+)
  - [ ] Export Compliance (Non-Exempt = false)
  - [ ] App Review Notes
  - [ ] Copyright
  - [ ] Support URL e email
- [ ] Preencher Google Play Console:
  - [ ] Título, descrição curta e completa
  - [ ] Screenshots e Feature Graphic
  - [ ] Categoria: Finance
  - [ ] Privacy Policy URL
  - [ ] Data Safety declaration
  - [ ] IARC content rating questionnaire
  - [ ] Email de contato
- [ ] EAS Submit (iOS) → App Store Connect → App Review
- [ ] EAS Submit (Android) → Google Play Console → Review
- [ ] Monitorar status de review e responder feedbacks

---

## Resumo das Decisões Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Tema/Estilos | 1 arquivo centralizado (`theme/index.ts`) | Consistência, facilidade de ajuste |
| Componentes | Base (atômicos) + Compostos | Reutilização sem over-engineering |
| Fluxo de dados | Screen → filhos via props | Controle, testabilidade, zero surpresas |
| Performance | memo + useCallback + useMemo + seletores | Zero re-renders desnecessários |
| Regras de negócio | Funções puras em `rules/` | Testáveis, sem dependência de React |
| State | Zustand com 4 stores | Simples, performático, seletores nativos |
| DB | expo-sqlite via repositories | Abstração limpa, troca fácil se necessário |
| Navegação | 3 tabs (Material Top Tabs) | Conforme protótipo validado |
| Fetch | 1× por app open, cache agressivo | Sem polling, respeita rate limits |
| Modal de save | SaveModal bottom-sheet com estado interno + callback pro pai | Amount display + descrição + tipo investimento (RF pré-selecionado). Botão Confirmar verde sólido |

---

*Plano Técnico gerado em 21/02/2026 — Compensa App v1.0*
*Atualizado em 22/02/2026 — Compliance para App Store / Google Play*

---

## 16. Compliance — Componentes e Telas Legais

### 16.1 `DisclaimerText` — Componente de Disclaimer Financeiro

Exibido no rodapé do `SimulatorScreen`, abaixo das projeções.

```typescript
type DisclaimerTextProps = {
  compact?: boolean;  // true = 1 linha, false = texto completo
};
```

**Texto completo (compact=false):**
> "⚠️ Projeções baseadas em performance passada. Não é garantia de retorno futuro. Não constitui aconselhamento ou recomendação de investimento."

**Texto compacto (compact=true):**
> "⚠️ Simulação educacional. Performance passada ≠ retorno futuro."

- Cor: `textMuted` (#555570)
- Tamanho: `textXs` (9)
- Alinhamento: center
- Acessibilidade: `accessibilityLabel` com texto completo sempre

### 16.2 `AttributionFooter` — Rodapé de Atribuição

Exibido no rodapé do `SimulatorScreen`, abaixo do disclaimer.

```typescript
// Sem props — dados fixos
```

**Layout:**
```
Dados: CoinGecko • Banco Central do Brasil
Atualizado em 22/02/2026 | Sobre / Legal →
```

- "Sobre / Legal →" é touchable e abre `LegalScreen` (ou modal com links)
- Cor: `textMuted`
- Tamanho: `textXs`
- O link para Legal satisfaz o requisito de acessibilidade da Privacy Policy dentro do app

### 16.3 `LegalScreen` — Tela de Informações Legais

Acessível via link no `AttributionFooter`. Pode ser implementada como:
- **Opção A:** Modal full-screen empilhado sobre as tabs
- **Opção B:** Stack navigator acima do TopTabNavigator

**Layout:**
```
┌──────────────────────────────────────┐
│  ← Voltar          Sobre / Legal     │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │  📜 Política de Privacidade   │    │  → TouchableOpacity
│  │  Veja como seus dados são     │    │    Abre ScrollView com texto
│  │  tratados                     │    │    completo da Privacy Policy
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  📋 Termos de Uso             │    │  → TouchableOpacity
│  │  Condições de uso do app      │    │    Abre ScrollView com texto
│  └──────────────────────────────┘    │    completo dos Terms
│                                      │
│  ┌──────────────────────────────┐    │
│  │  ℹ️ Sobre o App               │    │
│  │  Compensa v1.0.0              │    │  → Versão, desenvolvedor,
│  │  © 2026 [Desenvolvedor]       │    │    contato de suporte
│  │  Suporte: email@exemplo.com   │    │
│  └──────────────────────────────┘    │
│                                      │
│  ── Dados de Mercado ──              │
│  ₿ Preço BTC: CoinGecko             │
│  📊 Taxa SELIC: Banco Central        │
│  do Brasil                           │
│                                      │
└──────────────────────────────────────┘
```

**Implementação:**

```typescript
// screens/LegalScreen.tsx
type LegalSection = 'main' | 'privacy' | 'terms';

function LegalScreen() {
  const [section, setSection] = useState<LegalSection>('main');

  if (section === 'privacy') {
    return <PrivacyPolicyView onBack={() => setSection('main')} />;
  }
  if (section === 'terms') {
    return <TermsOfUseView onBack={() => setSection('main')} />;
  }

  return (
    <ScrollView>
      <LegalMenuItem
        icon="📜"
        title="Política de Privacidade"
        subtitle="Veja como seus dados são tratados"
        onPress={() => setSection('privacy')}
      />
      <LegalMenuItem
        icon="📋"
        title="Termos de Uso"
        subtitle="Condições de uso do aplicativo"
        onPress={() => setSection('terms')}
      />
      <AppInfo />  {/* Versão, copyright, email de suporte */}
      <DataSources />  {/* Atribuição CoinGecko + BCB */}
    </ScrollView>
  );
}
```

> **Nota:** Os textos de Privacy Policy e Terms of Use ficam hardcoded no app (strings longas) E também hospedados em URL pública. Manter ambos sincronizados.

### 16.4 Acessibilidade — Padrões Obrigatórios

Cada componente base DEVE incluir:

```typescript
// AppButton.tsx — exemplo de acessibilidade
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={label}
  accessibilityHint={hint || `Toque para ${label.toLowerCase()}`}
  accessibilityState={{ disabled }}
  style={[styles.button, { minHeight: 44, minWidth: 44 }]}
  onPress={onPress}
  disabled={disabled}
>
```

```typescript
// AppTextInput.tsx — exemplo de acessibilidade
<View accessible={true} accessibilityLabel={label}>
  <Text accessibilityRole="text">{label}</Text>
  <TextInput
    accessibilityLabel={`Campo ${label}`}
    accessibilityHint={`Digite ${placeholder || label}`}
    allowFontScaling={true}
    maxFontSizeMultiplier={1.5}
    // ...
  />
</View>
```

```typescript
// ProjectionCard.tsx — exemplo de conteúdo acessível
<View
  accessible={true}
  accessibilityRole="summary"
  accessibilityLabel={
    `Projeção de ${period}: Renda Fixa ${formatBRL(fixedIncome)}, 
     Bitcoin ${formatBRL(bitcoin)}`
  }
>
```

**Regras de acessibilidade a seguir:**

| Regra | Aplicação |
|---|---|
| Touch targets ≥ 44×44pt | Todos os botões, chips, radio options, links |
| `accessibilityLabel` descritivo | Todos os elementos interativos + valores numéricos |
| `accessibilityRole` correto | button, radio, text, header, summary, link |
| `accessibilityState` | disabled, selected, checked (radio options) |
| `allowFontScaling` | true em todos os `AppText` (respeitar Dynamic Type) |
| `maxFontSizeMultiplier` | 1.5 para evitar overflow em layouts apertados |
| Ordem de leitura | Garantir `importantForAccessibility` e ordem lógica |
| Agrupamento | Cards devem ser lidos como unidade (`accessible={true}` no container) |

---

## 17. Configuração Completa do `app.json`

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

    "plugins": [
      "expo-sqlite"
    ]
  }
}
```

> **`permissions: []`** no Android garante que o app não solicite nenhuma permissão desnecessária. O app não precisa de câmera, localização, microfone, armazenamento externo, ou qualquer outra permissão.
