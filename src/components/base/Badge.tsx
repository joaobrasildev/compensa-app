// src/components/base/Badge.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, fonts } from '@/theme';
import AppText from './AppText';

type BadgeProps = {
    value: number;
    size?: 'sm' | 'md';
};

function Badge({ value, size = 'sm' }: BadgeProps) {
    const isPositive = value >= 0;
    const prefix = isPositive ? '▲' : '▼';
    const formatted = `${prefix} ${isPositive ? '+' : ''}${value.toFixed(1)}%`;

    const bgColor = isPositive ? colors.greenSoft : colors.redSoft;
    const textColor = isPositive ? colors.greenText : colors.redText;
    const fontSize = size === 'sm' ? sizes.textXs : sizes.textSmPlus;

    return (
        <View
            style={[styles.badge, { backgroundColor: bgColor }]}
            accessible
            accessibilityLabel={`${isPositive ? 'Ganho' : 'Perda'} de ${Math.abs(value).toFixed(1)} por cento`}
        >
            <AppText
                style={[
                    styles.text,
                    { color: textColor, fontSize },
                ]}
            >
                {formatted}
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: sizes.badgePaddingH,
        paddingVertical: sizes.badgePaddingV,
        borderRadius: sizes.badgeRadius,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: fonts.weight.semibold,
    },
});

export default React.memo(Badge);
