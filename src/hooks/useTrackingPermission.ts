// src/hooks/useTrackingPermission.ts
// Solicita permissão ATT (App Tracking Transparency) no iOS antes de exibir anúncios.
// Aguarda AppState === 'active' + delay para garantir que o dialog ATT
// seja exibido corretamente em iPadOS 26+.

import { useEffect, useState } from 'react';
import { AppState, InteractionManager, Platform } from 'react-native';
import {
    requestTrackingPermissionsAsync,
    getTrackingPermissionsAsync,
    PermissionStatus,
} from 'expo-tracking-transparency';

export type TrackingState = 'loading' | 'granted' | 'denied';

/** Delay (ms) após o app estar ativo para exibir o prompt ATT */
const ATT_DELAY_MS = 1200;

/**
 * Aguarda até que AppState esteja 'active'.
 * Resolve imediatamente se já estiver ativo.
 */
function waitForActiveState(): Promise<void> {
    return new Promise((resolve) => {
        if (AppState.currentState === 'active') {
            resolve();
            return;
        }
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                subscription.remove();
                resolve();
            }
        });
    });
}

/** Delay simples baseado em Promise */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Aguarda InteractionManager.runAfterInteractions */
function waitForInteractions(): Promise<void> {
    return new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => resolve());
    });
}

/**
 * Hook que solicita a permissão ATT no iOS.
 * No Android, retorna 'granted' imediatamente.
 *
 * Sequência no iOS:
 * 1. Aguarda isReady === true
 * 2. Aguarda AppState === 'active'
 * 3. Aguarda InteractionManager (animações/transições concluídas)
 * 4. Aguarda ATT_DELAY_MS para garantir primeiro frame renderizado
 * 5. Solicita permissão ATT (exibe dialog nativo)
 */
export function useTrackingPermission(isReady: boolean): TrackingState {
    const [status, setStatus] = useState<TrackingState>(
        Platform.OS === 'android' ? 'granted' : 'loading',
    );

    useEffect(() => {
        if (Platform.OS !== 'ios' || !isReady) return;

        let cancelled = false;

        async function requestPermission(): Promise<void> {
            try {
                // 1. Espera o app estar em primeiro plano
                await waitForActiveState();
                if (cancelled) return;

                // 2. Espera animações/transições terminarem
                await waitForInteractions();
                if (cancelled) return;

                // 3. Delay de segurança para iOS aceitar exibir o dialog
                await delay(ATT_DELAY_MS);
                if (cancelled) return;

                // 4. Verifica se já tem permissão
                const current = await getTrackingPermissionsAsync();

                if (current.status === PermissionStatus.GRANTED) {
                    if (!cancelled) setStatus('granted');
                    return;
                }

                if (current.status === PermissionStatus.DENIED) {
                    if (!cancelled) setStatus('denied');
                    return;
                }

                // 5. Solicita permissão (exibe o dialog nativo)
                const result = await requestTrackingPermissionsAsync();
                if (!cancelled) {
                    setStatus(
                        result.status === PermissionStatus.GRANTED
                            ? 'granted'
                            : 'denied',
                    );
                }
            } catch {
                // Em caso de erro, assume negado (anúncios não-personalizados)
                if (!cancelled) setStatus('denied');
            }
        }

        void requestPermission();

        return () => {
            cancelled = true;
        };
    }, [isReady]);

    return status;
}
