// src/components/composed/DisciplineStats.tsx
// src/components/composed/DisciplineStats.tsx
// Grid 3 colunas: total registros, média/mês, streak consecutivo

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, borderWidths, fonts, letterSpacings } from '@/theme';
import type { DisciplineStats as DisciplineStatsType } from '@/types';
import AppText from '@/components/base/AppText';

type DisciplineStatsProps = {
    stats: DisciplineStatsType;
};

function DisciplineStats({ stats }: DisciplineStatsProps) {
    return (
        <View style={styles.container}>
            <View
                style={styles.card}
                accessible
                accessibilityLabel={`${stats.totalRecords} registros no total`}
            >
                <AppText style={styles.emoji}>📝</AppText>
                <AppText weight="bold" style={styles.number}>
                    {stats.totalRecords}
                </AppText>
                <AppText variant="muted" weight="semibold" style={styles.label}>
                    REGISTROS
                </AppText>
            </View>

            <View
                style={styles.card}
                accessible
                accessibilityLabel={`Média de R$ ${stats.averagePerMonth.toFixed(1).replace('.', ',')} por mês`}
            >
                <AppText style={styles.emoji}>📊</AppText>
                <AppText weight="bold" style={styles.number}>
                    {stats.averagePerMonth.toFixed(1).replace('.', ',')}
                </AppText>
                <AppText variant="muted" weight="semibold" style={styles.label}>
                    MÉDIA/MÊS
                </AppText>
            </View>

            <View
                style={styles.card}
                accessible
                accessibilityLabel={`${stats.currentStreak} meses consecutivos economizando`}
            >
                <AppText style={styles.emoji}>{stats.emoji}</AppText>
                <AppText weight="bold" style={styles.number}>
                    {stats.currentStreak}
                </AppText>
                <AppText variant="muted" weight="semibold" style={styles.label}>
                    MESES SEGUIDOS
                </AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    card: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: sizes.discRadius,
        padding: sizes.discPadding,
        alignItems: 'center',
        gap: spacing.xxs,
    },
    emoji: {
        fontSize: sizes.discEmojiSize,
    },
    number: {
        fontSize: sizes.discNumberSize,
        color: colors.textPrimary,
    },
    label: {
        fontSize: sizes.discLabelSize,
        letterSpacing: letterSpacings.tight,
    },
});

export default React.memo(DisciplineStats);
