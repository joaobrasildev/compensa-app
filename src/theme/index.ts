// src/theme/index.ts
// Design System — Tokens centralizados
// Todos os StyleSheet.create() importam daqui.

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

const theme = { colors, fonts, sizes, spacing, radii } as const;
export default theme;
