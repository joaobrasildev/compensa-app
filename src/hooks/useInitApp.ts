// src/hooks/useInitApp.ts
// Hook de inicialização do app

import { useEffect } from 'react';
import { initializeApp } from '@/services/initService';
import { useAppStore } from '@/stores/useAppStore';

type InitStatus = {
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
};

export function useInitApp(): InitStatus {
    const isReady = useAppStore((s) => s.isReady);
    const isLoading = useAppStore((s) => s.isLoading);
    const error = useAppStore((s) => s.error);

    useEffect(() => {
        void initializeApp();
    }, []);

    return { isReady, isLoading, error };
}
