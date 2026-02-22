// src/components/base/Chip.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, borderWidths, letterSpacings } from '@/theme';
import AppText from './AppText';

type ChipProps = {
    icon: string;
    label: string;
    value: string;
    accentColor: string;
};

function Chip({ icon, label, value, accentColor }: ChipProps) {
    return (
        <View
            style={[
                styles.chip,
                { borderColor: `${accentColor}4D` }, // ~30% opacity
            ]}
            accessible
            accessibilityLabel={`${label}: ${value}`}
        >
            <AppText style={styles.icon}>{icon}</AppText>
            <View style={styles.content}>
                <AppText variant="muted" weight="semibold" style={styles.label}>
                    {label.toUpperCase()}
                </AppText>
                <AppText weight="bold" style={[styles.value, { color: accentColor }]}>
                    {value}
                </AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderRadius: sizes.chipBorderRadius,
        paddingVertical: sizes.chipPaddingV,
        paddingHorizontal: sizes.chipPaddingH,
    },
    icon: {
        fontSize: sizes.chipIconSize,
    },
    content: {
        flexDirection: 'column',
    },
    label: {
        fontSize: sizes.chipLabelSize,
        letterSpacing: letterSpacings.tight,
    },
    value: {
        fontSize: sizes.chipValueSize,
    },
});

export default React.memo(Chip);
