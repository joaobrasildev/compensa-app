// src/screens/SummaryScreen.tsx
// Tela de resumo — seção 11.2 do plano

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';
import { useSavingsStore } from '@/stores/useSavingsStore';
import { useMarketStore } from '@/stores/useMarketStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { calculateTotals } from '@/rules/savingsRules';
import { calculateDiscipline } from '@/rules/disciplineRules';
import SectionTitle from '@/components/base/SectionTitle';
import EmptyState from '@/components/base/EmptyState';
import SummaryCards from '@/components/composed/SummaryCards';
import DisciplineStats from '@/components/composed/DisciplineStats';
import RankingList from '@/components/composed/RankingList';

const MAX_RANKING = 5;

function SummaryScreen() {
    // ── Stores (seletores granulares) ──
    const savings = useSavingsStore((s) => s.savings);
    const btcPrice = useMarketStore((s) => s.btcPrice);
    const fixedRate = useConfigStore((s) => s.fixedRate);

    // ── Cálculos memoizados ──
    const summaryData = useMemo(
        () => calculateTotals(savings, fixedRate, btcPrice),
        [savings, fixedRate, btcPrice],
    );

    const disciplineData = useMemo(
        () => calculateDiscipline(savings),
        [savings],
    );

    const top5 = useMemo(() => {
        return [...savings]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, MAX_RANKING);
    }, [savings]);

    // ── Empty state ──
    if (savings.length === 0) {
        return (
            <EmptyState
                icon="📊"
                title="Nenhuma economia registrada"
                subtitle="Salve sua primeira economia no Simulador para ver o resumo aqui."
            />
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Resumo */}
            <SectionTitle title="💰 RESUMO" />
            <SummaryCards totals={summaryData} />

            {/* Disciplina */}
            <SectionTitle title="🏆 DISCIPLINA" />
            <DisciplineStats stats={disciplineData} />

            {/* Top 5 */}
            {top5.length > 0 && (
                <>
                    <SectionTitle title="🥇 TOP 5 MAIORES" />
                    <RankingList items={top5} />
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    content: {
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing['4xl'],
    },
});

export default SummaryScreen;
