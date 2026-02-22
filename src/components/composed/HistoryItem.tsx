// src/components/composed/HistoryItem.tsx
// src/components/composed/HistoryItem.tsx
// Item de histórico com borda colorida, projeções e swipe-to-delete

import React, { useRef, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors, sizes, spacing, borderWidths, fonts, letterSpacings } from '@/theme';
import type { EnrichedSaving } from '@/types';
import AppText from '@/components/base/AppText';
import Badge from '@/components/base/Badge';
import { formatBRL, formatDate, formatRelativeDate } from '@/rules/formatRules';

type HistoryItemProps = {
    saving: EnrichedSaving;
    onDeleteRequest: (id: number) => void;
    isSwipeOpen: boolean;
    onSwipeOpen: (id: number) => void;
};

const SWIPE_ACTION_WIDTH = sizes.swipeActionWidth;
const SWIPE_THRESHOLD = sizes.swipeThreshold;

/** Calcula % de ganho relativo ao valor original */
const gainPercent = (projected: number, original: number): number =>
    original > 0 ? ((projected - original) / original) * 100 : 0;

function HistoryItem({
    saving,
    onDeleteRequest,
    isSwipeOpen,
    onSwipeOpen,
}: HistoryItemProps) {
    const swipeableRef = useRef<Swipeable>(null);

    // Fechar quando isSwipeOpen muda para false
    React.useEffect(() => {
        if (!isSwipeOpen) {
            swipeableRef.current?.close();
        }
    }, [isSwipeOpen]);

    const handleDelete = useCallback(() => {
        onDeleteRequest(saving.id);
    }, [onDeleteRequest, saving.id]);

    const handleSwipeableOpen = useCallback(() => {
        onSwipeOpen(saving.id);
    }, [onSwipeOpen, saving.id]);

    const renderRightActions = useCallback(() => {
        return (
            <View style={styles.deleteAction}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir registro de ${formatBRL(saving.amount)}`}
                >
                    <AppText style={styles.deleteIcon}>🗑️</AppText>
                </TouchableOpacity>
            </View>
        );
    }, [handleDelete, saving.amount]);

    const isRF = saving.investment_type === 'RF';
    const borderColor = isRF ? colors.green : colors.btcOrange;

    const hasSimulatedProjections =
        saving.proj_1y_rf != null ||
        saving.proj_5y_rf != null ||
        saving.proj_10y_rf != null;

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            rightThreshold={SWIPE_THRESHOLD}
            overshootRight={false}
            friction={2}
            onSwipeableOpen={handleSwipeableOpen}
            containerStyle={styles.wrapper}
        >
            {/* accessibilityHint applied to the card View below for swipe discoverability */}
            <View
                style={[styles.card, { borderLeftColor: borderColor }]}
                accessibilityHint="Deslize para a esquerda para excluir"
            >
                {/* Header: data + valor */}
                <View style={styles.header}>
                    <AppText variant="muted" style={styles.date}>
                        {formatDate(saving.created_at)} – {formatRelativeDate(saving.created_at)}
                    </AppText>
                    <AppText weight="bold" style={styles.amount}>
                        {formatBRL(saving.amount)}
                    </AppText>
                </View>

                {/* Meta: descrição + tipo */}
                <View style={styles.meta}>
                    <AppText variant="secondary" style={styles.description} numberOfLines={1}>
                        🏷️ {saving.description}
                    </AppText>
                    <View
                        style={[
                            styles.typeBadge,
                            {
                                backgroundColor: isRF
                                    ? colors.greenSoft
                                    : colors.btcSoft,
                            },
                        ]}
                    >
                        <AppText
                            weight="semibold"
                            style={[
                                styles.typeText,
                                {
                                    color: isRF
                                        ? colors.greenText
                                        : colors.btcOrange,
                                },
                            ]}
                        >
                            {isRF ? '📊 RF' : '₿ BTC'}
                        </AppText>
                    </View>
                </View>

                {/* Título da seção de rendimento atual */}
                <AppText variant="muted" weight="semibold" style={styles.currentTitle}>
                    RENDIMENTO ATUAL
                </AppText>

                {/* Body: 2 mini-cards (RF HOJE + BTC HOJE) */}
                <View style={styles.projections}>
                    <View style={styles.projCard}>
                        <AppText variant="muted" weight="semibold" style={styles.projLabel}>
                            RF HOJE
                        </AppText>
                        <View style={styles.projValueRow}>
                            <AppText weight="bold" style={styles.projValue}>
                                {formatBRL(saving.currentFixedValue)}
                            </AppText>
                            <Badge value={saving.currentFixedGainPercent} size="sm" />
                        </View>
                    </View>

                    <View style={styles.projCard}>
                        <AppText variant="muted" weight="semibold" style={styles.projLabel}>
                            BTC HOJE
                        </AppText>
                        <View style={styles.projValueRow}>
                            <AppText weight="bold" style={styles.projValue}>
                                {formatBRL(saving.currentBtcValue)}
                            </AppText>
                            <Badge value={saving.currentBtcGainPercent} size="sm" />
                        </View>
                    </View>
                </View>

                {/* Projeção simulada (valores salvos no momento do registro) */}
                {hasSimulatedProjections && (
                    <>
                        <AppText variant="muted" weight="semibold" style={styles.simTitle}>
                            PROJEÇÃO SIMULADA
                        </AppText>

                        {/* 1 ano */}
                        {saving.proj_1y_rf != null && saving.proj_1y_btc != null && (
                            <View style={styles.projections}>
                                <View style={styles.projCard}>
                                    <AppText variant="muted" weight="semibold" style={styles.projLabel}>
                                        RF 1 ano
                                    </AppText>
                                    <View style={styles.projValueRow}>
                                        <AppText weight="bold" style={styles.projValue}>
                                            {formatBRL(saving.proj_1y_rf)}
                                        </AppText>
                                        <Badge value={gainPercent(saving.proj_1y_rf, saving.amount)} size="sm" />
                                    </View>
                                </View>
                                <View style={styles.projCard}>
                                    <AppText variant="muted" weight="semibold" style={styles.projLabel}>
                                        BTC 1 ano
                                    </AppText>
                                    <View style={styles.projValueRow}>
                                        <AppText weight="bold" style={styles.projValue}>
                                            {formatBRL(saving.proj_1y_btc)}
                                        </AppText>
                                        <Badge value={gainPercent(saving.proj_1y_btc, saving.amount)} size="sm" />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* 5 anos */}
                        {saving.proj_5y_rf != null && saving.proj_5y_btc != null && (
                            <View style={styles.projections}>
                                <View style={styles.projCard}>
                                    <AppText variant="muted" weight="semibold" style={styles.projLabel}>
                                        RF 5 anos
                                    </AppText>
                                    <View style={styles.projValueRow}>
                                        <AppText weight="bold" style={styles.projValue}>
                                            {formatBRL(saving.proj_5y_rf)}
                                        </AppText>
                                        <Badge value={gainPercent(saving.proj_5y_rf, saving.amount)} size="sm" />
                                    </View>
                                </View>
                                <View style={styles.projCard}>
                                    <AppText variant="muted" weight="semibold" style={styles.projLabel}>
                                        BTC 5 anos
                                    </AppText>
                                    <View style={styles.projValueRow}>
                                        <AppText weight="bold" style={styles.projValue}>
                                            {formatBRL(saving.proj_5y_btc)}
                                        </AppText>
                                        <Badge value={gainPercent(saving.proj_5y_btc, saving.amount)} size="sm" />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* 10 anos */}
                        {saving.proj_10y_rf != null && saving.proj_10y_btc != null && (
                            <View style={styles.projections}>
                                <View style={styles.projCard}>
                                    <AppText variant="muted" weight="semibold" style={styles.projLabel}>
                                        RF 10 anos
                                    </AppText>
                                    <View style={styles.projValueRow}>
                                        <AppText weight="bold" style={styles.projValue}>
                                            {formatBRL(saving.proj_10y_rf)}
                                        </AppText>
                                        <Badge value={gainPercent(saving.proj_10y_rf, saving.amount)} size="sm" />
                                    </View>
                                </View>
                                <View style={styles.projCard}>
                                    <AppText variant="muted" weight="semibold" style={styles.projLabel}>
                                        BTC 10 anos
                                    </AppText>
                                    <View style={styles.projValueRow}>
                                        <AppText weight="bold" style={styles.projValue}>
                                            {formatBRL(saving.proj_10y_btc)}
                                        </AppText>
                                        <Badge value={gainPercent(saving.proj_10y_btc, saving.amount)} size="sm" />
                                    </View>
                                </View>
                            </View>
                        )}
                    </>
                )}
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        overflow: 'hidden',
        borderRadius: sizes.histItemRadius,
        marginBottom: spacing.md,
    },
    deleteAction: {
        width: SWIPE_ACTION_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgPrimary,
    },
    deleteButton: {
        width: sizes.deleteBtnSize,
        height: sizes.deleteBtnSize,
        borderRadius: sizes.deleteBtnRadius,
        backgroundColor: colors.bgCardHover,
        borderWidth: borderWidths.medium,
        borderColor: colors.redGlow,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.redGlowSoft,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 4,
    },
    deleteIcon: {
        fontSize: sizes.deleteBtnIconSize,
    },
    card: {
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: sizes.histItemRadius,
        borderLeftWidth: 3,
        paddingVertical: sizes.histItemPaddingV,
        paddingHorizontal: sizes.histItemPaddingH,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    date: {
        fontSize: sizes.histDateSize,
    },
    amount: {
        fontSize: sizes.histAmountSize,
        color: colors.textPrimary,
    },
    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    description: {
        fontSize: sizes.histDateSize,
        flex: 1,
        marginRight: spacing.sm,
    },
    typeBadge: {
        paddingHorizontal: sizes.badgePaddingH,
        paddingVertical: sizes.badgePaddingV,
        borderRadius: sizes.badgeRadius,
    },
    typeText: {
        fontSize: sizes.textXs,
        letterSpacing: letterSpacings.tight,
    },
    currentTitle: {
        fontSize: sizes.histProjLabelSize,
        letterSpacing: letterSpacings.tight,
        marginBottom: spacing.sm,
    },
    simTitle: {
        fontSize: sizes.histProjLabelSize,
        letterSpacing: letterSpacings.tight,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    projections: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xs,
    },
    projCard: {
        flex: 1,
        backgroundColor: colors.bgCardHover,
        borderRadius: spacing.md,
        padding: spacing.md,
    },
    projLabel: {
        fontSize: sizes.histProjLabelSize,
        letterSpacing: letterSpacings.tight,
        marginBottom: spacing.xs,
    },
    projValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    projValue: {
        fontSize: sizes.histProjValueSize,
        color: colors.textPrimary,
    },
});

export default React.memo(HistoryItem);
