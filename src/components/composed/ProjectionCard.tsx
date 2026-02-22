// src/components/composed/ProjectionCard.tsx
// src/components/composed/ProjectionCard.tsx
// Card de projeção com período, linhas RF e BTC

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, borderWidths, fonts, letterSpacings } from '@/theme';
import type { Projection } from '@/types';
import AppText from '@/components/base/AppText';
import Badge from '@/components/base/Badge';
import { formatBRL, formatBTC } from '@/rules/formatRules';

type ProjectionCardProps = {
    projection: Projection;
};

function ProjectionCard({ projection }: ProjectionCardProps) {
    return (
        <View
            style={styles.card}
            accessible
            accessibilityLabel={`Projeção de ${projection.label}: Renda Fixa ${formatBRL(projection.fixedIncome)}, Bitcoin ${formatBRL(projection.bitcoin)}`}
        >
            <View style={styles.header}>
                <AppText weight="bold" style={styles.period}>
                    {projection.label}
                </AppText>
            </View>

            <View style={styles.body}>
                {/* Linha RF */}
                <View style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: colors.green }]} />
                    <AppText variant="muted" style={styles.label}>RF</AppText>
                    <AppText weight="bold" style={styles.value}>
                        {formatBRL(projection.fixedIncome)}
                    </AppText>
                    <Badge value={projection.fixedIncomeGain} size="sm" />
                </View>

                {/* Linha BTC */}
                <View style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: colors.btcOrange }]} />
                    <AppText variant="muted" style={styles.label}>BTC</AppText>
                    <AppText weight="bold" style={styles.value}>
                        {formatBRL(projection.bitcoin)}
                    </AppText>
                    <Badge value={projection.bitcoinGain} size="sm" />
                </View>

                {/* Sub: equivalente BTC */}
                <AppText variant="muted" style={styles.sub}>
                    ≈ {formatBTC(projection.btcEquivalent)}
                </AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: sizes.projCardRadius,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: colors.bgCardHover,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: borderWidths.thin,
        borderBottomColor: colors.border,
    },
    period: {
        fontSize: sizes.projPeriodSize,
        color: colors.textPrimary,
        letterSpacing: letterSpacings.tight,
    },
    body: {
        padding: spacing.lg,
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    label: {
        fontSize: sizes.projLabelSize,
        fontWeight: fonts.weight.semibold,
        minWidth: 24,
    },
    value: {
        fontSize: sizes.projValueSize,
        color: colors.textPrimary,
        flex: 1,
    },
    sub: {
        fontSize: sizes.projSubSize,
        textAlign: 'right',
        marginTop: spacing.xxs,
    },
});

export default React.memo(ProjectionCard);
