// src/components/base/AppButton.tsx
import React from 'react';
import {
    TouchableOpacity,
    View,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { colors, fonts, sizes, spacing, opacity as opacityTokens, letterSpacings } from '@/theme';
import AppText from './AppText';

type AppButtonProps = {
    label: string;
    onPress: () => void;
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'confirm' | 'ghost';
};

function AppButton({
    label,
    onPress,
    icon,
    loading = false,
    disabled = false,
    variant = 'primary',
}: AppButtonProps) {
    const isDisabled = disabled || loading;

    const buttonStyles = [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'confirm' && styles.confirm,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
    ];

    const textColor =
        variant === 'confirm'
            ? colors.black
            : variant === 'ghost'
                ? colors.textSecondary
                : colors.greenText;

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: isDisabled }}
        >
            {loading ? (
                <ActivityIndicator size="small" color={textColor} />
            ) : (
                <>
                    {icon != null && variant === 'primary' && (
                        <View style={styles.iconCircle}>
                            <AppText style={styles.iconText}>{icon}</AppText>
                        </View>
                    )}
                    {icon != null && variant !== 'primary' && (
                        <AppText style={{ color: textColor }}>{icon}</AppText>
                    )}
                    <AppText
                        weight="bold"
                        style={[
                            styles.label,
                            { color: textColor },
                        ]}
                    >
                        {label}
                    </AppText>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        minHeight: sizes.minTouchTarget,
        minWidth: sizes.minTouchTarget,
        paddingVertical: sizes.btnPaddingV,
        borderRadius: sizes.btnBorderRadius,
    },
    primary: {
        backgroundColor: colors.bgCardHover,
        borderWidth: sizes.btnBorderWidth,
        borderColor: colors.greenGlow,
        shadowColor: colors.greenGlowSoft,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: sizes.btnShadowRadius,
        elevation: sizes.btnElevation,
    },
    confirm: {
        backgroundColor: colors.green,
    },
    ghost: {
        backgroundColor: colors.transparent,
    },
    disabled: {
        opacity: opacityTokens.disabled,
    },
    iconCircle: {
        width: sizes.btnIconSize,
        height: sizes.btnIconSize,
        borderRadius: sizes.btnIconSize / 2,
        backgroundColor: colors.greenGlowSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: sizes.btnIconFontSize,
        color: colors.greenText,
    },
    label: {
        fontSize: sizes.btnFontSize,
        letterSpacing: letterSpacings.tight,
    },
});

export default React.memo(AppButton);
