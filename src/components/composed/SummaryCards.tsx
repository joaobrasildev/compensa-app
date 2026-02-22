// src/components/composed/SummaryCards.tsx
// src/components/composed/SummaryCards.tsx
// Card "Total Economizado" full-width + Card "Projeção Investida" com breakdown RF/BTC

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, borderWidths, fonts, letterSpacings } from '@/theme';
import type { SummaryTotals } from '@/types';
import AppText from '@/components/base/AppText';
import Badge from '@/components/base/Badge';
import { formatBRL } from '@/rules/formatRules';

type SummaryCardsProps = {
    totals: SummaryTotals;
};

function SummaryCards({ totals }: SummaryCardsProps) {
    return (
        <View style={styles.container}>
            {/* Card: Total Economizado */}
            <View
                style={styles.card}
                accessible
                accessibilityLabel={`Total economizado: ${formatBRL(totals.totalSaved)}`}
                accessibilityRole="summary"
            >
                <AppText variant="muted" weight="semibold" style={styles.label}>
                    TOTAL ECONOMIZADO
                </AppText>
                <AppText weight="bold" style={styles.value}>
                    {formatBRL(totals.totalSaved)}
                </AppText>
            </View>

            {/* Card: Projeção Investida */}
            <View
                style={styles.card}
                accessible
                accessibilityLabel={`Projeção investida: ${formatBRL(totals.investedProjection)}, ganho de ${totals.investedGainPercent.toFixed(1)} por cento`}
                accessibilityRole="summary"
            >
                <AppText variant="muted" weight="semibold" style={styles.label}>
                    PROJEÇÃO INVESTIDA
                </AppText>
                <View style={styles.valueRow}>
                    <AppText variant="green" weight="bold" style={styles.value}>
                        {formatBRL(totals.investedProjection)}
                    </AppText>
                    <Badge value={totals.investedGainPercent} size="sm" />
                </View>

                {/* Breakdown RF / BTC */}
                <View style={styles.breakdown}>
                    <View style={styles.breakdownItem}>
                        <View style={[styles.dot, { backgroundColor: colors.green }]} />
                        <AppText variant="muted" style={styles.detail}>
                            📊 RF: {totals.rfPortion.count}x · {formatBRL(totals.rfPortion.projection)}
                        </AppText>
                    </View>
                    <View style={styles.breakdownItem}>
                        <View style={[styles.dot, { backgroundColor: colors.btcOrange }]} />
                        <AppText variant="muted" style={styles.detail}>
                            ₿ BTC: {totals.btcPortion.count}x · {formatBRL(totals.btcPortion.projection)}
                        </AppText>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: sizes.summaryCardRadius,
        padding: sizes.summaryCardPadding,
    },
    label: {
        fontSize: sizes.summaryLabelSize,
        letterSpacing: letterSpacings.wide,
        marginBottom: spacing.xs,
    },
    value: {
        fontSize: sizes.summaryValueSize,
        color: colors.textPrimary,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    breakdown: {
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    detail: {
        fontSize: sizes.summaryDetailSize,
    },
});

export default React.memo(SummaryCards);
