// src/components/composed/SuccessToast.tsx
// Toast animado de sucesso — renderizado no App.tsx, fora do PagerView

import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, sizes, spacing, zIndices, radii, borderWidths } from '@/theme';
import { useAppStore } from '@/stores/useAppStore';
import AppText from '@/components/base/AppText';

const TOAST_DURATION = 3500;
const ANIM_IN = 350;
const ANIM_OUT = 300;

function SuccessToast() {
    const toastVisible = useAppStore((s) => s.toastVisible);
    const toastMessage = useAppStore((s) => s.toastMessage);
    const toastSub = useAppStore((s) => s.toastSub);
    const hideToast = useAppStore((s) => s.hideToast);

    const translateY = useRef(new Animated.Value(-120)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isAnimating = useRef(false);

    const animateOut = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -120,
                duration: ANIM_OUT,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: ANIM_OUT,
                useNativeDriver: true,
            }),
        ]).start(() => {
            isAnimating.current = false;
            hideToast();
        });
    }, [translateY, opacity, hideToast]);

    useEffect(() => {
        if (toastVisible) {
            isAnimating.current = true;
            // Animate in
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 60,
                    friction: 9,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: ANIM_IN,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto-dismiss
            timerRef.current = setTimeout(animateOut, TOAST_DURATION);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [toastVisible, translateY, opacity, animateOut]);

    if (!toastVisible && !isAnimating.current) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
            accessibilityRole="alert"
            accessibilityLabel={`${toastMessage}${toastSub ? `. ${toastSub}` : ''}`}
        >
            <View style={styles.content}>
                <AppText style={styles.icon}>✅</AppText>
                <View style={styles.textContainer}>
                    <AppText weight="bold" style={styles.message}>
                        {toastMessage}
                    </AppText>
                    {toastSub.length > 0 && (
                        <AppText variant="muted" style={styles.sub}>
                            {toastSub}
                        </AppText>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: spacing['2xl'],
        left: spacing['2xl'],
        right: spacing['2xl'],
        zIndex: zIndices.toast,
        backgroundColor: colors.toastBg,
        borderWidth: borderWidths.medium,
        borderColor: colors.toastBorder,
        borderRadius: sizes.toastBorderRadius,
        paddingVertical: sizes.toastPaddingV,
        paddingHorizontal: sizes.toastPaddingH,
        shadowColor: colors.greenGlow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    icon: {
        fontSize: sizes.toastIconSize,
    },
    textContainer: {
        flex: 1,
    },
    message: {
        fontSize: sizes.toastFontSize,
        color: colors.green,
    },
    sub: {
        fontSize: sizes.toastSubFontSize,
        marginTop: spacing.xxs,
    },
});

export default React.memo(SuccessToast);
