// src/components/base/AppText.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { colors, fonts, sizes } from '@/theme';

const VARIANT_COLORS: Record<string, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    label: colors.textLabel,
    green: colors.greenText,
    red: colors.redText,
    btc: colors.btcOrange,
};

type AppTextProps = {
    variant?: 'primary' | 'secondary' | 'muted' | 'label' | 'green' | 'red' | 'btc';
    size?: keyof typeof sizes;
    weight?: keyof typeof fonts.weight;
    align?: 'left' | 'center' | 'right';
    children: React.ReactNode;
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
};

function AppText({
    variant = 'primary',
    size,
    weight,
    align,
    children,
    style,
    numberOfLines,
}: AppTextProps) {
    const textStyle: TextStyle = {
        color: VARIANT_COLORS[variant] ?? colors.textPrimary,
        ...(size != null && { fontSize: sizes[size] }),
        ...(weight != null && { fontWeight: fonts.weight[weight] }),
        ...(align != null && { textAlign: align }),
    };

    return (
        <Text
            style={[styles.base, textStyle, style]}
            allowFontScaling
            maxFontSizeMultiplier={1.5}
            accessibilityRole="text"
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    base: {
        fontSize: sizes.textBase,
        fontWeight: fonts.weight.regular,
        color: colors.textPrimary,
    },
});

export default React.memo(AppText);
