// src/App.tsx
// Entry point do Compensa App — boot flow (seção 12)

import React, { useCallback } from 'react';
import { View, StyleSheet, StatusBar, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, sizes } from '@/theme';
import { useInitApp } from '@/hooks/useInitApp';
import { useAppStore } from '@/stores/useAppStore';
import TopTabNavigator from '@/navigation/TopTabNavigator';
import LoadingOverlay from '@/components/base/LoadingOverlay';
import AppText from '@/components/base/AppText';
import AppButton from '@/components/base/AppButton';
import LegalScreen from '@/screens/LegalScreen';

/**
 * Boot flow:
 * 1. useInitApp() → abre SQLite, carrega config, fetch dados
 * 2. Enquanto loading → LoadingOverlay
 * 3. Se erro sem cache → tela de erro com retry
 * 4. Se pronto → TopTabNavigator (3 abas)
 */
export default function App() {
    const { isReady, isLoading, error } = useInitApp();
    const hasCache = useAppStore((s) => s.hasCache);
    const legalVisible = useAppStore((s) => s.legalVisible);
    const setLegalVisible = useAppStore((s) => s.setLegalVisible);

    const handleRetry = useCallback(() => {
        // Re-inicializa o app
        const { setLoading, setError } = useAppStore.getState();
        setLoading(true);
        setError(null);
        void import('@/services/initService').then((m) => m.initializeApp());
    }, []);

    const handleCloseLegal = useCallback(() => {
        setLegalVisible(false);
    }, [setLegalVisible]);

    // ── Loading ──
    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />
                <LoadingOverlay visible message="Carregando dados de mercado..." />
            </View>
        );
    }

    // ── Erro sem cache ──
    if (error != null && !hasCache) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />
                <View style={styles.errorContainer}>
                    <AppText style={styles.errorIcon}>⚠️</AppText>
                    <AppText weight="bold" style={styles.errorTitle}>
                        Sem conexão
                    </AppText>
                    <AppText variant="muted" align="center" style={styles.errorMessage}>
                        {error}
                    </AppText>
                    <View style={styles.retryWrapper}>
                        <AppButton
                            label="TENTAR NOVAMENTE"
                            icon="🔄"
                            onPress={handleRetry}
                            variant="primary"
                        />
                    </View>
                </View>
            </View>
        );
    }

    // ── App pronto ──
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <SafeAreaView style={styles.container} edges={['top']}>
                        <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />
                        <TopTabNavigator />

                        {/* Modal Legal (full-screen) */}
                        <Modal
                            visible={legalVisible}
                            animationType="slide"
                            presentationStyle="fullScreen"
                            onRequestClose={handleCloseLegal}
                        >
                            <LegalScreen onClose={handleCloseLegal} />
                        </Modal>
                    </SafeAreaView>
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing['4xl'],
    },
    errorIcon: {
        fontSize: sizes.emptyIconSize,
        marginBottom: spacing['2xl'],
    },
    errorTitle: {
        fontSize: sizes.text2xl,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    errorMessage: {
        fontSize: sizes.textMdPlus,
        lineHeight: 22,
        marginBottom: spacing['3xl'],
    },
    retryWrapper: {
        width: '100%',
    },
});
