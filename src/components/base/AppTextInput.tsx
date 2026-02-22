// src/components/base/AppTextInput.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { colors, fonts, sizes, spacing, borderWidths, zIndices } from '@/theme';
import AppText from './AppText';

type AppTextInputProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    prefix?: string;
    suffix?: string;
    keyboardType?: KeyboardTypeOptions;
    placeholder?: string;
    maxLength?: number;
};

function AppTextInput({
    label,
    value,
    onChangeText,
    prefix,
    suffix,
    keyboardType = 'numeric',
    placeholder,
    maxLength,
}: AppTextInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            <AppText
                variant="label"
                size="inputLabelSize"
                weight="medium"
                style={styles.label}
            >
                {label}
            </AppText>
            <View style={styles.inputWrapper}>
                {prefix != null && (
                    <AppText variant="muted" weight="semibold" style={styles.prefix}>
                        {prefix}
                    </AppText>
                )}
                <TextInput
                    style={[
                        styles.input,
                        isFocused && styles.inputFocused,
                        prefix != null && styles.inputWithPrefix,
                        suffix != null && styles.inputWithSuffix,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    maxLength={maxLength}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    allowFontScaling
                    maxFontSizeMultiplier={1.5}
                    accessibilityLabel={label}
                    accessibilityHint={`Digite ${placeholder ?? label}`}
                />
                {suffix != null && (
                    <AppText variant="muted" weight="medium" style={styles.suffix}>
                        {suffix}
                    </AppText>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        marginBottom: spacing.md,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    input: {
        backgroundColor: colors.bgInput,
        borderWidth: sizes.inputBorderWidth,
        borderColor: colors.border,
        borderRadius: sizes.inputBorderRadius,
        paddingVertical: sizes.inputPaddingV,
        paddingHorizontal: sizes.inputPaddingH,
        color: colors.textPrimary,
        fontSize: sizes.inputFontSize,
        fontWeight: fonts.weight.bold,
    },
    inputFocused: {
        borderColor: colors.borderFocus,
    },
    inputWithPrefix: {
        paddingLeft: sizes.inputPrefixPad,
    },
    inputWithSuffix: {
        paddingRight: sizes.inputSuffixPad,
        fontSize: sizes.inputRateFontSize,
    },
    prefix: {
        position: 'absolute',
        left: sizes.inputPaddingH,
        zIndex: zIndices.local,
        fontSize: sizes.inputPrefixSize,
    },
    suffix: {
        position: 'absolute',
        right: sizes.inputPaddingH,
        zIndex: zIndices.local,
        fontSize: sizes.inputSuffixSize,
    },
});

export default React.memo(AppTextInput);
