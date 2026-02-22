// src/components/composed/RankingList.tsx
// src/components/composed/RankingList.tsx
// Top 5 maiores por amount DESC com badges numéricos

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, borderWidths, fonts, letterSpacings } from '@/theme';
import type { Saving } from '@/types';
import AppText from '@/components/base/AppText';
import { formatBRL, formatDate } from '@/rules/formatRules';

type RankingListProps = {
    items: Saving[];
};

const BADGE_COLORS: Record<number, string> = {
    1: '#FFD700',  // gold
    2: '#C0C0C0',  // silver
    3: '#CD7F32',  // bronze
};

function RankingList({ items }: RankingListProps) {
    return (
        <View style={styles.container}>
            {items.map((item, index) => {
                const position = index + 1;
                const badgeColor = BADGE_COLORS[position] ?? colors.textMuted;
                const isInvestmentRF = item.investment_type === 'RF';

                return (
                    <View
                        key={item.id}
                        style={styles.item}
                        accessible
                        accessibilityLabel={`Posição ${position}: ${formatBRL(item.amount)}, ${item.description}, ${formatDate(item.created_at)}`}
                    >
                        <View style={[styles.badge, { borderColor: badgeColor }]}>
                            <AppText
                                weight="bold"
                                style={[styles.badgeText, { color: badgeColor }]}
                            >
                                {position}
                            </AppText>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.topRow}>
                                <AppText weight="bold" style={styles.amount}>
                                    {formatBRL(item.amount)}
                                </AppText>
                                <AppText variant="muted" style={styles.date}>
                                    {formatDate(item.created_at)}
                                </AppText>
                            </View>
                            <View style={styles.bottomRow}>
                                <AppText variant="secondary" style={styles.description} numberOfLines={1}>
                                    🏷️ {item.description}
                                </AppText>
                                <View
                                    style={[
                                        styles.typeBadge,
                                        {
                                            backgroundColor: isInvestmentRF
                                                ? colors.greenSoft
                                                : colors.btcSoft,
                                        },
                                    ]}
                                >
                                    <AppText
                                        weight="semibold"
                                        style={[
                                            styles.typeText,
                                            {
                                                color: isInvestmentRF
                                                    ? colors.greenText
                                                    : colors.btcOrange,
                                            },
                                        ]}
                                    >
                                        {isInvestmentRF ? '📊 RF' : '₿ BTC'}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.sm,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: sizes.projCardRadius,
        paddingVertical: sizes.rankPaddingV,
        paddingHorizontal: sizes.rankPaddingH,
        gap: spacing.lg,
    },
    badge: {
        width: sizes.rankBadgeSize,
        height: sizes.rankBadgeSize,
        borderRadius: sizes.rankBadgeRadius,
        borderWidth: borderWidths.medium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: sizes.rankBadgeFont,
    },
    content: {
        flex: 1,
        gap: spacing.xxs,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: sizes.rankAmountSize,
        color: colors.textPrimary,
    },
    date: {
        fontSize: sizes.rankDateSize,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    description: {
        fontSize: sizes.rankDateSize,
        flex: 1,
        marginRight: spacing.sm,
    },
    typeBadge: {
        paddingHorizontal: sizes.badgePaddingH,
        paddingVertical: sizes.badgePaddingV,
        borderRadius: sizes.badgeRadius,
    },
    typeText: {
        fontSize: sizes.textXs,
        letterSpacing: letterSpacings.tight,
    },
});

export default React.memo(RankingList);
