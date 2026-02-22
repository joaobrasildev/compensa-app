// src/components/composed/HistoryItem.tsx
// src/components/composed/HistoryItem.tsx
// Item de histórico com borda colorida, projeções e swipe-to-delete

import React, { useRef, useCallback } from 'react';
import {
    View,
    Animated,
    PanResponder,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import type { GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { colors, sizes, spacing, borderWidths, fonts, letterSpacings } from '@/theme';
import type { EnrichedSaving } from '@/types';
import AppText from '@/components/base/AppText';
import Badge from '@/components/base/Badge';
import { formatBRL, formatDate } from '@/rules/formatRules';

type HistoryItemProps = {
    saving: EnrichedSaving;
    onDeleteRequest: (id: number) => void;
    isSwipeOpen: boolean;
    onSwipeOpen: (id: number) => void;
};

const SWIPE_ACTION_WIDTH = sizes.swipeActionWidth;
const SWIPE_THRESHOLD = sizes.swipeThreshold;

function HistoryItem({
    saving,
    onDeleteRequest,
    isSwipeOpen,
    onSwipeOpen,
}: HistoryItemProps) {
    const translateX = useRef(new Animated.Value(0)).current;
    const currentOffset = useRef(0);

    const snapTo = useCallback(
        (toValue: number) => {
            currentOffset.current = toValue;
            Animated.spring(translateX, {
                toValue,
                useNativeDriver: true,
                friction: 8,
                tension: 80,
            }).start();
        },
        [translateX],
    );

    // Fechar quando isSwipeOpen muda para false
    React.useEffect(() => {
        if (!isSwipeOpen && currentOffset.current !== 0) {
            snapTo(0);
        }
    }, [isSwipeOpen, snapTo]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (
                _evt: GestureResponderEvent,
                gestureState: PanResponderGestureState,
            ) => {
                return (
                    Math.abs(gestureState.dx) > 10 &&
                    Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
                );
            },
            onPanResponderGrant: () => {
                translateX.setOffset(currentOffset.current);
                translateX.setValue(0);
            },
            onPanResponderMove: (_evt, gestureState) => {
                // Limitar o arrasto: max 0 (direita) e -SWIPE_ACTION_WIDTH (esquerda)
                const newVal = Math.max(
                    -SWIPE_ACTION_WIDTH,
                    Math.min(0, gestureState.dx + currentOffset.current),
                );
                translateX.setOffset(0);
                translateX.setValue(newVal);
                currentOffset.current = newVal;
            },
            onPanResponderRelease: (_evt, gestureState) => {
                translateX.flattenOffset();
                if (gestureState.dx < -SWIPE_THRESHOLD) {
                    // Abrir
                    onSwipeOpen(saving.id);
                    snapTo(-SWIPE_ACTION_WIDTH);
                } else {
                    // Fechar
                    snapTo(0);
                }
            },
        }),
    ).current;

    const handleDelete = useCallback(() => {
        onDeleteRequest(saving.id);
    }, [onDeleteRequest, saving.id]);

    const isRF = saving.investment_type === 'RF';
    const borderColor = isRF ? colors.green : colors.btcOrange;

    return (
        <View style={styles.wrapper}>
            {/* Ação de delete (revelada pelo swipe) */}
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

            {/* Conteúdo deslizável */}
            <Animated.View
                style={[styles.content, { transform: [{ translateX }] }]}
                {...panResponder.panHandlers}
            >
                <View style={[styles.card, { borderLeftColor: borderColor }]}>
                    {/* Header: data + valor */}
                    <View style={styles.header}>
                        <AppText variant="muted" style={styles.date}>
                            {formatDate(saving.created_at)}
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
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: sizes.histItemRadius,
        marginBottom: spacing.md,
    },
    deleteAction: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: SWIPE_ACTION_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
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
    content: {
        backgroundColor: colors.bgPrimary,
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
    projections: {
        flexDirection: 'row',
        gap: spacing.md,
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
