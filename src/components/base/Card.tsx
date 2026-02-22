// src/components/base/Card.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radii, borderWidths } from '@/theme';

type CardProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

function Card({ children, style }: CardProps) {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: radii.xl,
    },
});

export default React.memo(Card);
