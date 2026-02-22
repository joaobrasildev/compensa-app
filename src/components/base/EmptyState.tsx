// src/components/base/EmptyState.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, opacity as opacityTokens } from '@/theme';
import AppText from './AppText';

type EmptyStateProps = {
    icon: string;
    title: string;
    subtitle?: string;
};

function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
    return (
        <View style={styles.container} accessible accessibilityLabel={title}>
            <AppText style={styles.icon}>{icon}</AppText>
            <AppText weight="semibold" style={styles.title}>
                {title}
            </AppText>
            {subtitle != null && (
                <AppText variant="muted" style={styles.subtitle}>
                    {subtitle}
                </AppText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing['3xl'],
        opacity: opacityTokens.muted,
    },
    icon: {
        fontSize: sizes.emptyIconSize,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: sizes.textMdPlus,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: sizes.textSmPlus,
        textAlign: 'center',
        lineHeight: sizes.emptyLineHeight,
    },
});

export default React.memo(EmptyState);
