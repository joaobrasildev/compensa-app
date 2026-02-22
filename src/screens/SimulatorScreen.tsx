// src/screens/SimulatorScreen.tsx
// Tela principal do simulador — seção 11.1 do plano

import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { colors, sizes, spacing, fonts } from '@/theme';
import { useMarketStore } from '@/stores/useMarketStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';
import { useProjections } from '@/hooks/useProjections';
import { validateSaving, buildNewSaving } from '@/rules/savingsRules';
import type { CAGRs } from '@/types';
import AppText from '@/components/base/AppText';
import AppTextInput from '@/components/base/AppTextInput';
import SectionTitle from '@/components/base/SectionTitle';
import MarketChips from '@/components/composed/MarketChips';
import ProjectionGroup from '@/components/composed/ProjectionGroup';
import DisclaimerText from '@/components/composed/DisclaimerText';
import AttributionFooter from '@/components/composed/AttributionFooter';
import SaveButton from '@/components/composed/SaveButton';
import SaveModal from '@/components/composed/SaveModal';

function SimulatorScreen() {
    // ── Stores ──
    const btcPrice = useMarketStore((s) => s.btcPrice);
    const selicRate = useMarketStore((s) => s.selicRate);
    const cagr1y = useMarketStore((s) => s.cagr1y);
    const cagr5y = useMarketStore((s) => s.cagr5y);
    const cagr10y = useMarketStore((s) => s.cagr10y);
    const fixedRate = useConfigStore((s) => s.fixedRate);
    const setFixedRate = useConfigStore((s) => s.setFixedRate);
    const addSaving = useSavingsStore((s) => s.addSaving);

    // ── State local ──
    const [modalVisible, setModalVisible] = useState(false);
    const { displayValue, numericValue, onChangeText, reset } = useCurrencyInput(300);

    // Taxa como string para o input
    const [rateInput, setRateInput] = useState(() =>
        fixedRate.toFixed(2).replace('.', ','),
    );

    // ── CAGRs memoizado ──
    const cagrs = useMemo<CAGRs>(
        () => ({ y1: cagr1y, y5: cagr5y, y10: cagr10y }),
        [cagr1y, cagr5y, cagr10y],
    );

    // ── Projeções (debounced via numericValue) ──
    const projections = useProjections({
        amount: numericValue,
        fixedRate,
        btcPrice,
        cagrs,
    });

    // ── Callbacks ──
    const handleRateChange = useCallback(
        (text: string) => {
            setRateInput(text);
            const cleaned = text.replace(',', '.');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                setFixedRate(parsed);
            }
        },
        [setFixedRate],
    );

    const handleOpenModal = useCallback(() => {
        if (numericValue <= 0) return;
        setModalVisible(true);
    }, [numericValue]);

    const handleCloseModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    const handleConfirmSave = useCallback(
        (description: string, investmentType: 'RF' | 'BTC') => {
            const validation = validateSaving(
                numericValue,
                btcPrice,
                description,
                investmentType,
            );
            if (!validation.valid) return;

            const newSaving = buildNewSaving(
                numericValue,
                description,
                investmentType,
                fixedRate,
                btcPrice,
                selicRate,
                cagrs,
            );
            addSaving(newSaving);
            setModalVisible(false);
            reset();
        },
        [numericValue, btcPrice, fixedRate, selicRate, cagrs, addSaving, reset],
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Hero */}
                <View style={styles.hero}>
                    <AppText weight="bold" style={styles.heroTitle}>
                        Quanto você gastaria?
                    </AppText>
                    <AppText variant="muted" style={styles.heroSubtitle}>
                        Simule o retorno se investisse
                    </AppText>
                </View>

                {/* Input valor */}
                <AppTextInput
                    label="Valor"
                    value={displayValue}
                    onChangeText={onChangeText}
                    prefix="R$"
                    keyboardType="numeric"
                    placeholder="0,00"
                />

                {/* Input taxa */}
                <AppTextInput
                    label="Taxa de Renda Fixa"
                    value={rateInput}
                    onChangeText={handleRateChange}
                    suffix="% a.a."
                    keyboardType="decimal-pad"
                    placeholder="12,50"
                />

                {/* Market Chips */}
                <MarketChips btcPrice={btcPrice} selicRate={selicRate} />

                {/* Projeções */}
                {numericValue > 0 && (
                    <>
                        <SectionTitle title="PROJEÇÕES" />
                        <ProjectionGroup projections={projections} />
                    </>
                )}

                {/* Disclaimer */}
                <DisclaimerText compact={false} />

                {/* Footer */}
                <AttributionFooter />

                {/* Espaço para o botão fixo */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Botão fixo no bottom */}
            {numericValue > 0 && (
                <SaveButton onPress={handleOpenModal} />
            )}

            {/* Modal de salvar */}
            <SaveModal
                visible={modalVisible}
                amount={numericValue}
                fixedRate={fixedRate}
                btcPrice={btcPrice}
                onConfirm={handleConfirmSave}
                onClose={handleCloseModal}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing['2xl'],
    },
    hero: {
        marginBottom: spacing['2xl'],
    },
    heroTitle: {
        fontSize: sizes.text2xl,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    heroSubtitle: {
        fontSize: sizes.textMdPlus,
    },
    bottomSpacer: {
        height: 100,
    },
});

export default SimulatorScreen;
