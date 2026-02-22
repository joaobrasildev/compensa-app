// src/components/composed/SaveButton.tsx
// src/components/composed/SaveButton.tsx
// Botão "✅ RESOLVI ECONOMIZAR" fixo no bottom com LinearGradient fade

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/theme';
import AppButton from '@/components/base/AppButton';

type SaveButtonProps = {
    onPress: () => void;
};

function SaveButton({ onPress }: SaveButtonProps) {
    return (
        <View style={styles.container} pointerEvents="box-none">
            <LinearGradient
                colors={[colors.transparent, colors.bgPrimary]}
                style={styles.gradient}
                pointerEvents="none"
            />
            <View style={styles.buttonWrapper}>
                <AppButton
                    label="RESOLVI ECONOMIZAR"
                    icon="✅"
                    onPress={onPress}
                    variant="primary"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    gradient: {
        height: 40,
    },
    buttonWrapper: {
        backgroundColor: colors.bgPrimary,
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing['3xl'],
    },
});

export default React.memo(SaveButton);
