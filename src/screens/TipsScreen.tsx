// src/screens/TipsScreen.tsx
// Tela de dicas financeiras — conteúdo estático educativo (seção 11.5 do plano)

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { colors, sizes, spacing, radii, fonts, borderWidths } from '@/theme';
import AppText from '@/components/base/AppText';

// ─── Tipos ───────────────────────────────────────────────────────────
type TipColor = 'purple' | 'green' | 'orange' | 'blue' | 'red';

type Tip = {
    icon: string;
    title: string;
    body: string;
    highlight: string;
    color: TipColor;
};

// ─── Mapeamento de cores ─────────────────────────────────────────────
const COLOR_MAP: Record<TipColor, { bg: string; text: string }> = {
    purple: { bg: colors.accentSoft, text: colors.accent },
    green: { bg: colors.greenSoft, text: colors.green },
    orange: { bg: colors.btcSoft, text: colors.btcOrange },
    blue: { bg: colors.blueSoft, text: colors.blue },
    red: { bg: colors.redSoft, text: colors.red },
};

// ─── Dados estáticos ─────────────────────────────────────────────────
const TIPS: readonly Tip[] = [
    {
        icon: '🧠',
        title: 'Regra dos 72 horas',
        body: 'Antes de qualquer compra acima de R$ 100, espere 72 horas. A maioria dos impulsos desaparece nesse período. Se após 3 dias você ainda quiser, provavelmente é uma necessidade real.',
        highlight: '⏱️ 72h de reflexão = decisões melhores',
        color: 'purple',
    },
    {
        icon: '💰',
        title: 'Custo de oportunidade',
        body: 'Cada real gasto é um real que não será investido. Um café de R$ 15/dia = R$ 450/mês. Investidos a 12% a.a., seriam R$ 8.500+ em 1 ano. Pense no que seu dinheiro pode render antes de gastar.',
        highlight: '📈 Use o Simulador para ver na prática',
        color: 'green',
    },
    {
        icon: '📊',
        title: 'O poder dos juros compostos',
        body: 'Einstein chamou os juros compostos de "a oitava maravilha do mundo". Seu dinheiro trabalha por você 24h/dia. R$ 1.000 a 12% a.a. viram R$ 1.762 em 5 anos e R$ 3.106 em 10 anos — sem aportar mais nada.',
        highlight: '🔄 Quanto antes começar, maior o efeito',
        color: 'orange',
    },
    {
        icon: '🎯',
        title: 'Tenha uma meta visual',
        body: 'Defina um objetivo concreto: viagem, entrada de um imóvel, reserva de emergência. Coloque uma imagem como wallpaper do celular. Toda vez que for comprar por impulso, olhe a tela — isso ativa a parte racional do cérebro.',
        highlight: '🖼️ Meta visível = motivação constante',
        color: 'blue',
    },
    {
        icon: '⚠️',
        title: 'Conheça seus gatilhos',
        body: 'Compras impulsivas geralmente são ativadas por emoções: tédio, ansiedade, redes sociais, promoções "imperdíveis". Identifique seus gatilhos e crie barreiras: desative notificações de lojas, remova cartões salvos, cancele newsletters de ofertas.',
        highlight: '🛡️ Menos tentação = mais economia',
        color: 'red',
    },
    {
        icon: '📋',
        title: 'Regra 50-30-20',
        body: 'Divida sua renda: 50% para necessidades (aluguel, comida), 30% para desejos (lazer, compras) e 20% para investimentos e reserva. Mesmo que não siga à risca, ter uma proporção ajuda a criar consciência.',
        highlight: '💡 Organize antes de gastar',
        color: 'purple',
    },
] as const;

// ─── TipCard (componente interno memoizado) ──────────────────────────
type TipCardProps = {
    tip: Tip;
};

const TipCard = React.memo(function TipCard({ tip }: TipCardProps) {
    const colorScheme = COLOR_MAP[tip.color];

    return (
        <View
            style={styles.card}
            accessibilityRole="text"
            accessibilityLabel={`Dica: ${tip.title}. ${tip.body}`}
        >
            <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: colorScheme.bg }]}>
                    <AppText style={styles.iconEmoji}>{tip.icon}</AppText>
                </View>
                <AppText style={styles.cardTitle}>{tip.title}</AppText>
            </View>

            <AppText style={styles.cardBody}>{tip.body}</AppText>

            <View style={[styles.highlight, { backgroundColor: colorScheme.bg }]}>
                <AppText style={[styles.highlightText, { color: colorScheme.text }]}>
                    {tip.highlight}
                </AppText>
            </View>
        </View>
    );
});

// ─── TipsScreen ──────────────────────────────────────────────────────
function TipsScreen() {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <AppText style={styles.headerIcon}>💡</AppText>
                <AppText style={styles.headerTitle}>Dicas Financeiras</AppText>
                <AppText style={styles.headerSubtitle}>
                    Pequenas mudanças de hábito que fazem grande diferença no longo prazo
                </AppText>
            </View>

            {/* Tips list */}
            <View style={styles.list}>
                {TIPS.map((tip, index) => (
                    <TipCard key={index} tip={tip} />
                ))}
            </View>

            {/* Footer disclaimer */}
            <AppText style={styles.footer}>
                Dicas educativas — não constituem recomendação de investimento.
            </AppText>
        </ScrollView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    contentContainer: {
        paddingBottom: spacing['4xl'],
    },

    // Header
    header: {
        alignItems: 'center',
        paddingTop: spacing['4xl'],
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing.md,
    },
    headerIcon: {
        fontSize: sizes.dicaHeaderIconSize,
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: sizes.dicaHeaderTitleSize,
        fontWeight: fonts.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: sizes.dicaBodySize,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: sizes.dicaBodySize * 1.4,
    },

    // List
    list: {
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing['2xl'],
        gap: spacing.xl,
    },

    // Card
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: radii['2xl'],
        padding: spacing['2xl'],
        borderWidth: borderWidths.thin,
        borderColor: colors.bgCardHover,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xl,
        marginBottom: spacing.lg,
    },
    iconBox: {
        width: sizes.dicaIconBoxSize,
        height: sizes.dicaIconBoxSize,
        borderRadius: sizes.dicaIconBoxRadius,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconEmoji: {
        fontSize: sizes.dicaIconSize,
    },
    cardTitle: {
        fontSize: sizes.dicaTitleSize,
        fontWeight: fonts.weight.bold,
        color: colors.textPrimary,
        flex: 1,
    },
    cardBody: {
        fontSize: sizes.dicaBodySize,
        color: colors.textSecondary,
        lineHeight: sizes.dicaBodySize * 1.55,
    },

    // Highlight badge
    highlight: {
        alignSelf: 'flex-start',
        marginTop: spacing.md,
        paddingVertical: sizes.dicaHighlightPadV,
        paddingHorizontal: sizes.dicaHighlightPadH,
        borderRadius: sizes.dicaHighlightRadius,
    },
    highlightText: {
        fontSize: sizes.dicaHighlightSize,
        fontWeight: fonts.weight.semibold,
    },

    // Footer
    footer: {
        textAlign: 'center',
        paddingHorizontal: spacing['4xl'],
        paddingTop: spacing['2xl'],
        fontSize: sizes.textSmPlus,
        color: colors.textMuted,
        lineHeight: sizes.textSmPlus * 1.5,
    },
});

export default React.memo(TipsScreen);
