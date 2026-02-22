// src/components/base/RadioOption.tsx
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, sizes, radii, spacing, borderWidths } from '@/theme';
import AppText from './AppText';

type RadioOptionProps = {
    icon: string;
    label: string;
    subtitle?: string;
    selected: boolean;
    onSelect: () => void;
    accentColor: string;
};

function RadioOption({
    icon,
    label,
    subtitle,
    selected,
    onSelect,
    accentColor,
}: RadioOptionProps) {
    const bgColor = selected
        ? `${accentColor}1F` // ~12% opacity
        : colors.bgInput;
    const borderColor = selected ? accentColor : colors.border;

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: bgColor, borderColor }]}
            onPress={onSelect}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${label}${subtitle ? `, ${subtitle}` : ''}`}
        >
            <AppText style={styles.icon}>{icon}</AppText>
            <View style={styles.textContainer}>
                <AppText
                    weight="semibold"
                    style={[styles.label, selected && { color: accentColor }]}
                >
                    {label}
                </AppText>
                {subtitle != null && (
                    <AppText variant="muted" style={styles.subtitle}>
                        {subtitle}
                    </AppText>
                )}
            </View>
            <View
                style={[
                    styles.radio,
                    { borderColor },
                    selected && { borderColor: accentColor },
                ]}
            >
                {selected && (
                    <View style={[styles.radioDot, { backgroundColor: accentColor }]} />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderWidth: borderWidths.thin,
        borderRadius: radii.lg,
        gap: spacing.md,
        minHeight: sizes.minTouchTarget,
    },
    icon: {
        fontSize: sizes.radioIconSize,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: sizes.textMd,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: sizes.textSm,
        marginTop: spacing.xxs,
    },
    radio: {
        width: sizes.radioCircleSize,
        height: sizes.radioCircleSize,
        borderRadius: sizes.radioCircleSize / 2,
        borderWidth: sizes.radioBorderWidth,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioDot: {
        width: sizes.radioDotSize,
        height: sizes.radioDotSize,
        borderRadius: sizes.radioDotSize / 2,
    },
});

export default React.memo(RadioOption);
