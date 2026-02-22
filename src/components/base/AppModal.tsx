// src/components/base/AppModal.tsx
import React, { useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { colors, sizes, spacing, zIndices, borderWidths } from '@/theme';
import AppText from './AppText';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type AppModalProps = {
    visible: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
};

function AppModal({
    visible,
    onClose,
    title,
    subtitle,
    children,
}: AppModalProps) {
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
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
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, backdropOpacity, slideAnim]);

    if (!visible) return null;

    return (
        <View style={styles.overlay} accessibilityViewIsModal>
            <TouchableWithoutFeedback onPress={onClose} accessible={false}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: backdropOpacity },
                    ]}
                />
            </TouchableWithoutFeedback>

            <KeyboardAvoidingView
                behavior="padding"
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.handleBar} />

                    {title != null && (
                        <AppText weight="bold" style={styles.title}>
                            {title}
                        </AppText>
                    )}
                    {subtitle != null && (
                        <AppText variant="muted" style={styles.subtitle}>
                            {subtitle}
                        </AppText>
                    )}

                    <ScrollView
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: zIndices.modal,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.backdrop,
    },
    keyboardView: {
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.bgCard,
        borderTopLeftRadius: sizes.modalTopRadius,
        borderTopRightRadius: sizes.modalTopRadius,
        borderWidth: borderWidths.thin,
        borderBottomWidth: 0,
        borderColor: colors.border,
        paddingHorizontal: spacing['3xl'],
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['3xl'],
    },
    handleBar: {
        width: sizes.modalHandleW,
        height: sizes.modalHandleH,
        backgroundColor: colors.border,
        borderRadius: sizes.modalHandleRadius,
        alignSelf: 'center',
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: sizes.textLgPlus,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: sizes.textSmPlus,
        marginBottom: spacing['2xl'],
    },
});

export default React.memo(AppModal);
