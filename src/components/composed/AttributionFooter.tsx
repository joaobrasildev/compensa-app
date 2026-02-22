// src/components/composed/AttributionFooter.tsx
// Footer com atribuição CoinGecko + BCB + link para Legal

import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStore } from '@/stores/useAppStore';
import { sizes, spacing, colors } from '@/theme';
import AppText from '@/components/base/AppText';

function AttributionFooter() {
    const setLegalVisible = useAppStore((s) => s.setLegalVisible);

    const handleLegalPress = useCallback(() => {
        setLegalVisible(true);
    }, [setLegalVisible]);

    return (
        <View style={styles.container}>
            <AppText variant="muted" align="center" style={styles.attribution}>
                Dados: CoinGecko • Banco Central do Brasil
            </AppText>
            <TouchableOpacity
                onPress={handleLegalPress}
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityLabel="Sobre e informações legais"
                style={styles.link}
            >
                <AppText variant="muted" style={styles.linkText}>
                    Sobre / Legal →
                </AppText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        gap: spacing.xs,
    },
    attribution: {
        fontSize: sizes.textXs,
    },
    link: {
        minHeight: sizes.minTouchTarget,
        justifyContent: 'center',
    },
    linkText: {
        fontSize: sizes.textXs,
        color: colors.accent,
    },
});

export default React.memo(AttributionFooter);
