// src/components/composed/SaveModal.tsx
// src/components/composed/SaveModal.tsx
// Bottom-sheet modal para registrar economia

import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, sizes, spacing, borderWidths, fonts, radii, letterSpacings, opacity as opacityTokens } from '@/theme';
import AppModal from '@/components/base/AppModal';
import AppText from '@/components/base/AppText';
import AppTextInput from '@/components/base/AppTextInput';
import RadioOption from '@/components/base/RadioOption';
import { formatBRL } from '@/rules/formatRules';
import { capitalizeFirst } from '@/rules/savingsRules';

type SaveModalProps = {
    visible: boolean;
    amount: number;
    fixedRate: number;
    btcPrice: number;
    onConfirm: (description: string, investmentType: 'RF' | 'BTC') => void;
    onClose: () => void;
};

function SaveModal({
    visible,
    amount,
    fixedRate,
    btcPrice,
    onConfirm,
    onClose,
}: SaveModalProps) {
    const [description, setDescription] = useState('');
    const [investmentType, setInvestmentType] = useState<'RF' | 'BTC'>('RF');

    // Reseta ao abrir
    useEffect(() => {
        if (visible) {
            setDescription('');
            setInvestmentType('RF');
        }
    }, [visible]);

    const handleConfirm = useCallback(() => {
        if (description.trim().length === 0) return;
        onConfirm(description.trim(), investmentType);
    }, [description, investmentType, onConfirm]);

    const handleSelectRF = useCallback(() => {
        setInvestmentType('RF');
    }, []);

    const handleSelectBTC = useCallback(() => {
        setInvestmentType('BTC');
    }, []);

    const isDisabled = description.trim().length === 0;

    const fixedRateFormatted = `Taxa: ${fixedRate.toFixed(2).replace('.', ',')}% a.a.`;
    const btcFormatted = `BTC: ${formatBRL(btcPrice)}`;

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title="💰 Registrar Economia"
            subtitle="Transforme essa decisão em investimento"
        >
            {/* Valor em destaque */}
            <View
                style={styles.amountDisplay}
                accessible
                accessibilityLabel={`Valor: ${formatBRL(amount)}`}
            >
                <AppText variant="green" weight="bold" style={styles.amountText}>
                    {formatBRL(amount)}
                </AppText>
            </View>

            {/* Input descrição */}
            <AppTextInput
                label="O que você deixou de comprar?"
                value={description}
                onChangeText={(text: string) => setDescription(capitalizeFirst(text))}
                keyboardType="default"
                placeholder="Ex: Balada, Delivery, Impulso..."
                maxLength={40}
            />

            {/* Radio group */}
            <View style={styles.radioGroup}>
                <RadioOption
                    icon="📊"
                    label="Renda Fixa"
                    subtitle={fixedRateFormatted}
                    selected={investmentType === 'RF'}
                    onSelect={handleSelectRF}
                    accentColor={colors.green}
                />
                <RadioOption
                    icon="₿"
                    label="Bitcoin"
                    subtitle={btcFormatted}
                    selected={investmentType === 'BTC'}
                    onSelect={handleSelectBTC}
                    accentColor={colors.btcOrange}
                />
            </View>

            {/* Botões */}
            <View style={styles.buttons}>
                {/* Cancelar */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar registro"
                >
                    <AppText weight="bold" style={styles.cancelText}>
                        CANCELAR
                    </AppText>
                </TouchableOpacity>

                {/* OK */}
                <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={isDisabled}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Confirmar registro de economia"
                    accessibilityState={{ disabled: isDisabled }}
                    style={[styles.okTouchable, isDisabled && styles.disabled]}
                >
                    <LinearGradient
                        colors={[colors.greenGradientStart, colors.greenGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.okButton}
                    >
                        <AppText weight="bold" style={styles.okText}>
                            OK
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    amountDisplay: {
        backgroundColor: colors.bgPrimary,
        borderRadius: radii.lg,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing['2xl'],
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    amountText: {
        fontSize: sizes.text3xl,
    },
    radioGroup: {
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    buttons: {
        flexDirection: 'row',
        gap: spacing.lg,
        width: '100%',
        marginTop: spacing.sm,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.bgCardHover,
        borderWidth: borderWidths.medium,
        borderColor: colors.border,
        borderRadius: sizes.btnBorderRadius,
        paddingVertical: sizes.btnPaddingV,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: sizes.minTouchTarget,
    },
    cancelText: {
        fontSize: sizes.btnFontSize,
        color: colors.textSecondary,
        letterSpacing: letterSpacings.tight,
    },
    okTouchable: {
        flex: 1,
        minHeight: sizes.minTouchTarget,
    },
    okButton: {
        flex: 1,
        borderWidth: borderWidths.medium,
        borderColor: colors.greenGlow,
        borderRadius: sizes.btnBorderRadius,
        paddingVertical: sizes.btnPaddingV,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.greenGlowSoft,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 4,
    },
    okText: {
        fontSize: sizes.btnFontSize,
        color: colors.black,
        letterSpacing: letterSpacings.tight,
    },
    disabled: {
        opacity: opacityTokens.disabled,
    },
});

export default React.memo(SaveModal);
