// src/components/composed/DeleteConfirmModal.tsx
// Modal centralizado de confirmação de exclusão

import React, { useEffect, useRef } from 'react';
import {
    View,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, sizes, spacing, borderWidths, fonts, radii, zIndices, letterSpacings } from '@/theme';
import AppText from '@/components/base/AppText';

type DeleteConfirmModalProps = {
    visible: boolean;
    savingAmount: string;
    savingDescription: string;
    savingDate: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

function DeleteConfirmModal({
    visible,
    savingAmount,
    savingDescription,
    savingDate,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const boxScale = useRef(new Animated.Value(0.9)).current;
    const boxOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(boxScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 80,
                    useNativeDriver: true,
                }),
                Animated.timing(boxOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(boxScale, {
                    toValue: 0.9,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(boxOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, backdropOpacity, boxScale, boxOpacity]);

    if (!visible) return null;

    const modalWidth = Math.min(
        SCREEN_WIDTH * sizes.deleteModalWidth,
        sizes.deleteModalMaxWidth,
    );

    return (
        <View style={styles.overlay} accessibilityViewIsModal>
            <TouchableWithoutFeedback onPress={onCancel} accessible={false}>
                <Animated.View
                    style={[styles.backdrop, { opacity: backdropOpacity }]}
                />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.box,
                    {
                        width: modalWidth,
                        opacity: boxOpacity,
                        transform: [{ scale: boxScale }],
                    },
                ]}
            >
                {/* Ícone */}
                <AppText style={styles.icon}>🗑️</AppText>

                {/* Título */}
                <AppText weight="bold" style={styles.title}>
                    Deseja excluir esse registro?
                </AppText>

                {/* Detalhe */}
                <View style={styles.detailRow}>
                    <AppText weight="bold" style={styles.detailAmount}>
                        {savingAmount}
                    </AppText>
                    <AppText variant="muted" style={styles.detailText}>
                        {' · '}{savingDescription}{' · '}{savingDate}
                    </AppText>
                </View>

                {/* Botões */}
                <View style={styles.buttons}>
                    {/* Botão CANCELAR */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onCancel}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Cancelar exclusão"
                    >
                        <AppText weight="bold" style={styles.cancelText}>
                            CANCELAR
                        </AppText>
                    </TouchableOpacity>

                    {/* Botão OK (confirmar exclusão) */}
                    <TouchableOpacity
                        onPress={onConfirm}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Confirmar exclusão do registro"
                        style={styles.confirmTouchable}
                    >
                        <LinearGradient
                            colors={[colors.redGradientStart, colors.redGradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.confirmButton}
                        >
                            <AppText weight="bold" style={styles.confirmText}>
                                OK
                            </AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: zIndices.modal,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.backdrop,
    },
    box: {
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: radii['3xl'],
        padding: spacing['3xl'],
        alignItems: 'center',
    },
    icon: {
        fontSize: sizes.deleteModalIconSize,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: sizes.deleteModalTitleSize,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: spacing['2xl'],
    },
    detailAmount: {
        fontSize: sizes.deleteModalDetailSize,
        color: colors.textPrimary,
    },
    detailText: {
        fontSize: sizes.deleteModalDetailSize,
    },
    buttons: {
        flexDirection: 'row',
        gap: spacing.lg,
        width: '100%',
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
    confirmTouchable: {
        flex: 1,
        minHeight: sizes.minTouchTarget,
    },
    confirmButton: {
        flex: 1,
        borderWidth: borderWidths.medium,
        borderColor: colors.redGlow,
        borderRadius: sizes.btnBorderRadius,
        paddingVertical: sizes.btnPaddingV,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.redGlowSoft,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 4,
    },
    confirmText: {
        fontSize: sizes.btnFontSize,
        color: colors.textPrimary,
        letterSpacing: letterSpacings.tight,
    },
});

export default React.memo(DeleteConfirmModal);
