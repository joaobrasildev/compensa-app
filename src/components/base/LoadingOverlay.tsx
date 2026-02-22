// src/components/base/LoadingOverlay.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, sizes, spacing, zIndices } from '@/theme';
import AppText from './AppText';

type LoadingOverlayProps = {
    visible: boolean;
    message?: string;
};

function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
    if (!visible) return null;

    return (
        <View
            style={styles.overlay}
            accessible
            accessibilityLabel={message ?? 'Carregando'}
        >
            <ActivityIndicator size="large" color={colors.accent} />
            {message != null && (
                <AppText variant="muted" style={styles.message}>
                    {message}
                </AppText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: zIndices.overlay,
        backgroundColor: colors.overlayBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: spacing.xl,
        fontSize: sizes.textMd,
    },
});

export default React.memo(LoadingOverlay);
