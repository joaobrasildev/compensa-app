// src/components/composed/SaveModal.tsx
// src/components/composed/SaveModal.tsx
// Bottom-sheet modal para registrar economia

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, sizes, spacing, borderWidths, fonts, radii } from '@/theme';
import AppModal from '@/components/base/AppModal';
import AppText from '@/components/base/AppText';
import AppTextInput from '@/components/base/AppTextInput';
import AppButton from '@/components/base/AppButton';
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

            {/* Botão confirmar */}
            <View style={styles.confirmWrapper}>
                <AppButton
                    label="CONFIRMAR"
                    icon="✅"
                    onPress={handleConfirm}
                    variant="confirm"
                    disabled={isDisabled}
                />
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
    confirmWrapper: {
        marginTop: spacing.sm,
    },
});

export default React.memo(SaveModal);
