// src/hooks/useTrackingPermission.ts
// Solicita permissão ATT (App Tracking Transparency) no iOS antes de exibir anúncios

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
    requestTrackingPermissionsAsync,
    getTrackingPermissionsAsync,
    PermissionStatus,
} from 'expo-tracking-transparency';

export type TrackingState = 'loading' | 'granted' | 'denied';

/**
 * Hook que solicita a permissão ATT no iOS.
 * No Android, retorna 'granted' imediatamente.
 *
 * Deve ser chamado apenas APÓS o app estar pronto (isReady = true),
 * para que o dialog ATT apareça quando o app já renderizou.
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
                // Verifica se já tem permissão
                const current = await getTrackingPermissionsAsync();

                if (current.status === PermissionStatus.GRANTED) {
                    if (!cancelled) setStatus('granted');
                    return;
                }

                if (current.status === PermissionStatus.DENIED) {
                    if (!cancelled) setStatus('denied');
                    return;
                }

                // Solicita permissão (exibe o dialog nativo)
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
