// src/screens/LegalScreen.tsx
// Tela legal com 3 seções: main, privacy, terms — seção 11.4 do plano

import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, sizes, spacing, borderWidths, radii, fonts, letterSpacings } from '@/theme';
import AppText from '@/components/base/AppText';

type Section = 'main' | 'privacy' | 'terms';

type LegalScreenProps = {
    onClose: () => void;
};

const APP_VERSION = '1.0.0';
const CONTACT_EMAIL = 'contato@compensaapp.com';

const PRIVACY_POLICY = `POLÍTICA DE PRIVACIDADE — COMPENSA APP
Última atualização: Fevereiro 2026

1. DADOS COLETADOS
O Compensa App é 100% offline-first. NÃO coletamos, armazenamos ou transmitimos dados pessoais a servidores externos.
Dados armazenados LOCALMENTE no dispositivo:
• Valores de economias registradas
• Descrições de gastos evitados
• Configuração de taxa de renda fixa
• Cache de dados de mercado (preço BTC, taxa SELIC)

2. DADOS DE MERCADO
Requisições a APIs públicas (CoinGecko, Banco Central do Brasil). Requisições NÃO incluem dados pessoais. Nenhum identificador do dispositivo é enviado.

3. TERCEIROS
NÃO utiliza: analytics, publicidade, SDKs de rastreamento, crash reporting com dados pessoais.

4. ARMAZENAMENTO E SEGURANÇA
Dados no sandbox do app, protegidos pelo OS. Sem backup em nuvem.

5. COMPARTILHAMENTO
NÃO compartilha dados com terceiros.

6. RETENÇÃO E EXCLUSÃO
Dados retidos enquanto o app estiver instalado. Para excluir: desinstalar o app ou excluir registros individualmente.

7. CRIANÇAS
Não direcionado a menores de 13 anos.

8. LGPD (Lei 13.709/2018)
Base legal: consentimento ao usar o app. Dados exclusivamente locais. Direito de exclusão via desinstalação ou exclusão de registros. Direito de acesso: todos os dados visíveis no app.

9. ALTERAÇÕES
Reservamo-nos o direito de atualizar esta política.

10. CONTATO
${CONTACT_EMAIL}`;

const TERMS_OF_USE = `TERMOS DE USO — COMPENSA APP

1. ACEITAÇÃO
Ao utilizar o Compensa App, você concorda com estes termos.

2. NATUREZA DO APP
Simulador educacional de comportamento financeiro. NÃO é e NÃO substitui: assessoria de investimentos, recomendação de compra/venda, plataforma de negociação, serviço financeiro regulamentado.

3. PROJEÇÕES E SIMULAÇÕES
Projeções HIPOTÉTICAS baseadas em: performance histórica (Bitcoin CAGR), taxas definidas pelo usuário (Renda Fixa).
PERFORMANCE PASSADA NÃO É GARANTIA DE RESULTADOS FUTUROS.
Valores meramente ilustrativos.

4. DADOS DE MERCADO
Fontes públicas (CoinGecko, BCB). Sem garantia de precisão ou disponibilidade.

5. ISENÇÃO DE RESPONSABILIDADE
O desenvolvedor NÃO se responsabiliza por: decisões financeiras, perdas, indisponibilidade de dados, imprecisões.

6. DADOS DO USUÁRIO
Armazenados exclusivamente no dispositivo. Ver Política de Privacidade.

7. PROPRIEDADE INTELECTUAL
App, design, código e conteúdo protegidos por direitos autorais.

8. ALTERAÇÕES
Termos podem ser atualizados. Uso continuado = aceitação.

9. LEGISLAÇÃO APLICÁVEL
Leis da República Federativa do Brasil.`;

function LegalScreen({ onClose }: LegalScreenProps) {
    const [section, setSection] = useState<Section>('main');

    const goToPrivacy = useCallback(() => setSection('privacy'), []);
    const goToTerms = useCallback(() => setSection('terms'), []);
    const goToMain = useCallback(() => setSection('main'), []);

    // ── Seção Privacy ──
    if (section === 'privacy') {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={goToMain}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                >
                    <AppText style={styles.backText}>← Voltar</AppText>
                </TouchableOpacity>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <AppText weight="bold" style={styles.sectionTitle}>
                        📜 Política de Privacidade
                    </AppText>
                    <AppText variant="secondary" style={styles.legalText}>
                        {PRIVACY_POLICY}
                    </AppText>
                </ScrollView>
            </View>
        );
    }

    // ── Seção Terms ──
    if (section === 'terms') {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={goToMain}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                >
                    <AppText style={styles.backText}>← Voltar</AppText>
                </TouchableOpacity>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <AppText weight="bold" style={styles.sectionTitle}>
                        📋 Termos de Uso
                    </AppText>
                    <AppText variant="secondary" style={styles.legalText}>
                        {TERMS_OF_USE}
                    </AppText>
                </ScrollView>
            </View>
        );
    }

    // ── Seção Main ──
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                >
                    <AppText style={styles.backText}>← Voltar</AppText>
                </TouchableOpacity>
                <AppText weight="bold" style={styles.headerTitle}>
                    Sobre / Legal
                </AppText>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Menu items */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={goToPrivacy}
                    accessibilityRole="button"
                    accessibilityLabel="Ver Política de Privacidade"
                >
                    <AppText style={styles.menuIcon}>📜</AppText>
                    <AppText weight="semibold" style={styles.menuText}>
                        Política de Privacidade
                    </AppText>
                    <AppText variant="muted" style={styles.menuArrow}>→</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={goToTerms}
                    accessibilityRole="button"
                    accessibilityLabel="Ver Termos de Uso"
                >
                    <AppText style={styles.menuIcon}>📋</AppText>
                    <AppText weight="semibold" style={styles.menuText}>
                        Termos de Uso
                    </AppText>
                    <AppText variant="muted" style={styles.menuArrow}>→</AppText>
                </TouchableOpacity>

                {/* Sobre o App */}
                <View style={styles.infoBlock}>
                    <AppText weight="bold" style={styles.infoTitle}>
                        Sobre o App
                    </AppText>
                    <AppText variant="secondary" style={styles.infoText}>
                        Compensa — Simulador Comportamental Financeiro
                    </AppText>
                    <AppText variant="muted" style={styles.infoText}>
                        Versão {APP_VERSION}
                    </AppText>
                    <AppText variant="muted" style={styles.infoText}>
                        © 2026 Compensa App. Todos os direitos reservados.
                    </AppText>
                    <AppText variant="muted" style={styles.infoText}>
                        Contato: {CONTACT_EMAIL}
                    </AppText>
                </View>

                {/* Dados de Mercado */}
                <View style={styles.infoBlock}>
                    <AppText weight="bold" style={styles.infoTitle}>
                        Dados de Mercado
                    </AppText>
                    <AppText variant="secondary" style={styles.infoText}>
                        Preço do Bitcoin fornecido pela CoinGecko API (gratuita, sem autenticação).
                    </AppText>
                    <AppText variant="secondary" style={styles.infoText}>
                        Taxa SELIC fornecida pelo Banco Central do Brasil (API pública).
                    </AppText>
                    <AppText variant="muted" style={styles.infoSmall}>
                        Dados utilizados exclusivamente para simulações educacionais. Sem garantia de precisão ou disponibilidade.
                    </AppText>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    header: {
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing['4xl'],
        paddingBottom: spacing.lg,
        borderBottomWidth: borderWidths.thin,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: sizes.textXl,
        color: colors.textPrimary,
        marginTop: spacing.md,
    },
    backButton: {
        minHeight: sizes.minTouchTarget,
        justifyContent: 'center',
    },
    backText: {
        fontSize: sizes.textMdPlus,
        color: colors.accent,
        fontWeight: fonts.weight.semibold,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing['2xl'],
        paddingBottom: spacing['4xl'],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: radii.xl,
        padding: spacing['2xl'],
        marginBottom: spacing.md,
        minHeight: sizes.minTouchTarget,
        gap: spacing.lg,
    },
    menuIcon: {
        fontSize: sizes.textLgPlus,
    },
    menuText: {
        flex: 1,
        fontSize: sizes.textMdPlus,
        color: colors.textPrimary,
    },
    menuArrow: {
        fontSize: sizes.textLgPlus,
    },
    infoBlock: {
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: radii.xl,
        padding: spacing['2xl'],
        marginTop: spacing['2xl'],
        gap: spacing.sm,
    },
    infoTitle: {
        fontSize: sizes.textLg,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: sizes.textBase,
        lineHeight: 18,
    },
    infoSmall: {
        fontSize: sizes.textSm,
        lineHeight: 16,
        marginTop: spacing.xs,
    },
    sectionTitle: {
        fontSize: sizes.textXl,
        color: colors.textPrimary,
        marginBottom: spacing['2xl'],
    },
    legalText: {
        fontSize: sizes.textSmPlus,
        lineHeight: 20,
    },
});

export default LegalScreen;
