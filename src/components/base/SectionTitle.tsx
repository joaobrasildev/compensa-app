// src/components/base/SectionTitle.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, letterSpacings } from '@/theme';
import AppText from './AppText';

type SectionTitleProps = {
    title: string;
    color?: string;
};

function SectionTitle({ title, color = colors.accent }: SectionTitleProps) {
    return (
        <View
            style={styles.container}
            accessible
            accessibilityRole="header"
        >
            <View style={[styles.bar, { backgroundColor: color }]} />
            <AppText
                variant="muted"
                weight="semibold"
                style={styles.text}
            >
                {title.toUpperCase()}
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing['2xl'],
        marginBottom: spacing.lg,
    },
    bar: {
        width: sizes.sectionBarW,
        height: sizes.sectionBarH,
        borderRadius: sizes.sectionBarRadius,
    },
    text: {
        fontSize: sizes.textSmPlus,
        letterSpacing: letterSpacings.wide,
    },
});

export default React.memo(SectionTitle);
