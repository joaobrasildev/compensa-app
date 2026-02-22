// src/App.tsx
// Entry point do Compensa App
// Preparado para o boot flow (useInitApp → TopTabNavigator)

import React from 'react';
import { View, StyleSheet, StatusBar, Text, ActivityIndicator } from 'react-native';
import { colors } from '@/theme';

/**
 * App.tsx — Entry point
 *
 * Boot flow (será implementado na Fase 4+):
 * 1. useInitApp() → abre SQLite, carrega config, fetch dados
 * 2. Enquanto loading → LoadingOverlay
 * 3. Se erro sem cache → tela de erro com retry
 * 4. Se pronto → TopTabNavigator (3 abas)
 */
export default function App() {
    // TODO Fase 4: const { isReady, isLoading, error } = useInitApp();

    // Placeholder de loading enquanto as fases seguintes são implementadas
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />
            <View style={styles.content}>
                <Text style={styles.title}>Compensa</Text>
                <Text style={styles.subtitle}>Simulador comportamental financeiro</Text>
                <ActivityIndicator
                    size="large"
                    color={colors.accent}
                    style={styles.loader}
                />
                <Text style={styles.status}>Setup completo ✅</Text>
                <Text style={styles.hint}>Próximo: Fase 1 — Componentes Base</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 32,
    },
    loader: {
        marginBottom: 24,
    },
    status: {
        fontSize: 16,
        color: colors.greenText,
        fontWeight: '600',
        marginBottom: 8,
    },
    hint: {
        fontSize: 12,
        color: colors.textMuted,
    },
});
