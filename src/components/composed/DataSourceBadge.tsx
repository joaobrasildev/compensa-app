// src/components/composed/DataSourceBadge.tsx
// Badge discreto que indica a origem dos dados de mercado (live/cache/fallback)

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, borderWidths } from '@/theme';
import AppText from '@/components/base/AppText';
import { formatDate } from '@/rules/formatRules';

type DataSource = 'live' | 'cache' | 'fallback';

type DataSourceBadgeProps = {
    dataSource: DataSource;
    lastFetchDate: string | null;
};

function DataSourceBadge({ dataSource, lastFetchDate }: DataSourceBadgeProps) {
    // Dados ao vivo — não mostra nada
    if (dataSource === 'live') return null;

    const isCache = dataSource === 'cache';
    const icon = isCache ? '📡' : '⚠️';
    const text = isCache
        ? `Dados de ${lastFetchDate != null ? formatDate(lastFetchDate) : 'cache'}`
        : 'Dados estimados (sem conexão)';
    const bgColor = isCache ? colors.orangeSoft : colors.redSoft;
    const borderColor = isCache ? colors.orange : colors.red;
    const textColor = isCache ? colors.orange : colors.redText;
    const label = isCache
        ? `Dados carregados do cache de ${lastFetchDate ?? 'data desconhecida'}. Puxe para baixo para atualizar.`
        : 'Sem conexão. Dados estimados sendo exibidos. Puxe para baixo para tentar atualizar.';

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: bgColor, borderColor },
            ]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={label}
        >
            <AppText style={[styles.icon]}>{icon}</AppText>
            <AppText
                weight="medium"
                style={[styles.text, { color: textColor }]}
                numberOfLines={1}
            >
                {text}
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: sizes.dsBadgePaddingV,
        paddingHorizontal: sizes.dsBadgePaddingH,
        borderRadius: sizes.dsBadgeRadius,
        borderWidth: borderWidths.thin,
        marginTop: spacing.md,
    },
    icon: {
        fontSize: sizes.dsBadgeIconSize,
        marginRight: spacing.xs,
    },
    text: {
        fontSize: sizes.dsBadgeFontSize,
    },
});

export default React.memo(DataSourceBadge);
