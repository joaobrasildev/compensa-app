// src/theme/index.ts
// Design System — Tokens centralizados
// 🚨 REGRA: Todos os StyleSheet.create() importam daqui.
// Nenhum valor literal de estilo é permitido nos componentes.

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
    greenGlow: 'rgba(0, 214, 143, 0.35)',
    greenGlowSoft: 'rgba(0, 214, 143, 0.15)',
    greenGradientStart: '#00d68f',
    greenGradientEnd: '#00b377',

    // Red (negativo, perdas)
    red: '#ff4757',
    redSoft: 'rgba(255, 71, 87, 0.12)',
    redText: '#ff6b7a',
    redGlow: 'rgba(255, 71, 87, 0.5)',
    redGlowSoft: 'rgba(255, 71, 87, 0.12)',
    redGradientStart: '#ff4757',
    redGradientEnd: '#d63041',

    // Orange (alertas)
    orange: '#ffa726',
    orangeSoft: 'rgba(255, 167, 38, 0.12)',

    // Bitcoin
    btcOrange: '#f7931a',
    btcSoft: 'rgba(247, 147, 26, 0.12)',

    // Blue (dicas, info)
    blue: '#2d98da',
    blueSoft: 'rgba(45, 152, 218, 0.15)',

    // Overlays
    backdrop: 'rgba(0, 0, 0, 0.7)',
    overlayBg: 'rgba(10, 10, 15, 0.8)',

    // Absolutos
    black: '#000000',
    transparent: 'transparent',
} as const;

export const fonts = {
    // Família — usa system font do dispositivo
    regular: undefined,
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
    textSmPlus: 11,
    textBase: 12,
    textMd: 13,
    textMdPlus: 14,
    textLg: 15,
    textLgPlus: 16,
    textXl: 17,
    text2xl: 19,
    text3xl: 22,
    text4xl: 36,

    // Touch target mínimo (acessibilidade)
    minTouchTarget: 44,

    // Inputs
    inputFontSize: 18,
    inputRateFontSize: 16,
    inputPaddingV: 10,
    inputPaddingH: 14,
    inputBorderRadius: 10,
    inputPrefixSize: 15,
    inputSuffixSize: 13,
    inputLabelSize: 12,
    inputBorderWidth: 1.5,
    inputPrefixPad: 42,
    inputSuffixPad: 60,

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
    btnIconSize: 20,
    btnIconFontSize: 11,
    btnBorderWidth: 1.5,
    btnShadowRadius: 20,
    btnElevation: 4,

    // Badge
    badgePaddingH: 6,
    badgePaddingV: 2,
    badgeRadius: 5,

    // Section Title
    sectionBarW: 3,
    sectionBarH: 14,
    sectionBarRadius: 2,

    // Modal
    modalTopRadius: 20,
    modalHandleW: 36,
    modalHandleH: 4,
    modalHandleRadius: 2,

    // Radio
    radioIconSize: 18,
    radioCircleSize: 18,
    radioDotSize: 8,
    radioBorderWidth: 2,

    // Empty State
    emptyIconSize: 36,
    emptyLineHeight: 16,

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

    // Delete button (swipe actions)
    deleteBtnSize: 46,
    deleteBtnRadius: 12,
    deleteBtnIconSize: 20,
    swipeActionWidth: 72,
    swipeThreshold: 50,

    // Delete Confirmation Modal
    deleteModalWidth: 0.85,
    deleteModalMaxWidth: 320,
    deleteModalIconSize: 40,
    deleteModalTitleSize: 17,
    deleteModalDetailSize: 12,

    // History Items
    histItemPaddingV: 10,
    histItemPaddingH: 12,
    histItemRadius: 12,
    histDateSize: 10,
    histAmountSize: 15,
    histProjLabelSize: 9,
    histProjValueSize: 12,
    histProjGainSize: 9,

    // Tips (Dicas) Screen
    dicaIconBoxSize: 44,
    dicaIconBoxRadius: 12,
    dicaIconSize: 22,
    dicaTitleSize: 15,
    dicaBodySize: 13,
    dicaHighlightSize: 12,
    dicaHighlightPadV: 6,
    dicaHighlightPadH: 12,
    dicaHighlightRadius: 8,
    dicaHeaderIconSize: 36,
    dicaHeaderTitleSize: 20,

    // Data Source Badge
    dsBadgePaddingV: 6,
    dsBadgePaddingH: 10,
    dsBadgeRadius: 8,
    dsBadgeFontSize: 11,
    dsBadgeIconSize: 13,

    // Chart (gráfico de barras empilhadas)
    chartHeight: 160,
    chartBarWidth: 28,
    chartBarRadius: 4,
    chartLabelSize: 9,
    chartYLabelSize: 9,
    chartYLabelWidth: 48,
    chartMaxMonths: 6,
} as const;

export const spacing = {
    xxs: 2,
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
    xs: 4,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    '2xl': 16,
    '3xl': 20,
} as const;

export const opacity = {
    disabled: 0.4,
    muted: 0.6,
} as const;

export const zIndices = {
    local: 1,
    modal: 20,
    overlay: 30,
} as const;

export const borderWidths = {
    thin: 1,
    medium: 1.5,
    thick: 2,
} as const;

export const letterSpacings = {
    tight: 0.5,
    wide: 1,
} as const;

const theme = {
    colors,
    fonts,
    sizes,
    spacing,
    radii,
    opacity,
    zIndices,
    borderWidths,
    letterSpacings,
} as const;
export default theme;
