// src/screens/HistoryScreen.tsx
// Tela de histórico — seção 11.3 do plano + fluxo de exclusão (4.1.6)

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useMarketStore } from '@/stores/useMarketStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { enrichWithProjections, buildChartData } from '@/rules/savingsRules';
import { formatBRL, formatDate } from '@/rules/formatRules';
import SectionTitle from '@/components/base/SectionTitle';
import GrowthChart from '@/components/composed/GrowthChart';
import HistoryList from '@/components/composed/HistoryList';
import DeleteConfirmModal from '@/components/composed/DeleteConfirmModal';

function HistoryScreen() {
    // ── Stores (seletores granulares) ──
    const savings = useSavingsStore((s) => s.savings);
    const deleteSaving = useSavingsStore((s) => s.deleteSaving);
    const btcPrice = useMarketStore((s) => s.btcPrice);
    const fixedRate = useConfigStore((s) => s.fixedRate);

    // ── State local para fluxo de exclusão ──
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [collapsingId, setCollapsingId] = useState<number | null>(null);

    // ── Cálculos memoizados ──
    const enrichedSavings = useMemo(
        () => enrichWithProjections(savings, fixedRate, btcPrice),
        [savings, fixedRate, btcPrice],
    );

    const chartData = useMemo(
        () => buildChartData(savings),
        [savings],
    );

    // ── Dados do item pendente de exclusão ──
    const pendingSaving = useMemo(() => {
        if (pendingDeleteId == null) return null;
        return savings.find((s) => s.id === pendingDeleteId) ?? null;
    }, [savings, pendingDeleteId]);

    // ── Callbacks ──
    const handleDeleteRequest = useCallback((id: number) => {
        setPendingDeleteId(id);
        setDeleteModalVisible(true);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setDeleteModalVisible(false);
        setPendingDeleteId(null);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (pendingDeleteId != null) {
            setCollapsingId(pendingDeleteId);
        }
        setDeleteModalVisible(false);
        setPendingDeleteId(null);
    }, [pendingDeleteId]);

    const handleCollapseEnd = useCallback((id: number) => {
        deleteSaving(id);
        setCollapsingId(null);
    }, [deleteSaving]);

    return (
        <View style={styles.container}>
            {/* Gráfico de valor economizado */}
            {chartData.length > 0 && (
                <View style={styles.chartSection}>
                    <SectionTitle title="📊 VALOR ECONOMIZADO (MÊS A MÊS)" />
                    <GrowthChart chartData={chartData} />
                </View>
            )}

            {/* Lista de histórico */}
            <View style={styles.listSection}>
                <SectionTitle title="HISTÓRICO" />
                <HistoryList
                    savings={enrichedSavings}
                    onDeleteRequest={handleDeleteRequest}
                    collapsingId={collapsingId}
                    onCollapseEnd={handleCollapseEnd}
                />
            </View>

            {/* Modal de confirmação de exclusão */}
            <DeleteConfirmModal
                visible={deleteModalVisible}
                savingAmount={pendingSaving != null ? formatBRL(pendingSaving.amount) : ''}
                savingDescription={pendingSaving?.description ?? ''}
                savingDate={
                    pendingSaving != null
                        ? formatDate(pendingSaving.created_at)
                        : ''
                }
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
        paddingHorizontal: spacing['2xl'],
    },
    chartSection: {
        marginBottom: spacing.md,
    },
    listSection: {
        flex: 1,
    },
});

export default HistoryScreen;
