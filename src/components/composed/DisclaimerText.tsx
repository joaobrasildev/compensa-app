// src/components/composed/DisclaimerText.tsx
// src/components/composed/DisclaimerText.tsx
// Disclaimer compacto e completo

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { sizes, spacing } from '@/theme';
import AppText from '@/components/base/AppText';

type DisclaimerTextProps = {
    compact?: boolean;
};

const FULL_TEXT =
    '⚠️ Projeções baseadas em performance passada. Não é garantia de retorno futuro. Não constitui aconselhamento ou recomendação de investimento.';

const COMPACT_TEXT =
    '⚠️ Simulação educacional. Performance passada ≠ retorno futuro.';

function DisclaimerText({ compact = false }: DisclaimerTextProps) {
    return (
        <View accessible accessibilityLabel={FULL_TEXT} style={styles.container}>
            <AppText variant="muted" align="center" style={styles.text}>
                {compact ? COMPACT_TEXT : FULL_TEXT}
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: spacing['2xl'],
        paddingHorizontal: spacing.lg,
    },
    text: {
        fontSize: sizes.textXs,
        lineHeight: 14,
    },
});

export default React.memo(DisclaimerText);
