// src/stores/useConfigStore.ts
// Configuração do usuário (taxa fixa)

import { create } from 'zustand';
import * as configRepo from '@/repositories/configRepository';

const DEFAULT_FIXED_RATE = 12.5;

type ConfigState = {
    fixedRate: number;
    hasUserRate: boolean;
    setFixedRate: (rate: number) => void;
    setFixedRateFromMarket: (rate: number) => void;
    markUserRate: () => void;
    loadConfig: () => void;
};

export const useConfigStore = create<ConfigState>()((set, get) => ({
    fixedRate: DEFAULT_FIXED_RATE,
    hasUserRate: false,

    setFixedRate: (rate) => {
        configRepo.set('fixed_rate', String(rate));
        set({ fixedRate: rate });
    },

    setFixedRateFromMarket: (rate) => {
        if (!get().hasUserRate) {
            set({ fixedRate: rate });
        }
    },

    markUserRate: () => {
        configRepo.set('has_user_rate', 'true');
        set({ hasUserRate: true });
    },

    loadConfig: () => {
        const stored = configRepo.get('fixed_rate');
        const fixedRate = stored != null ? parseFloat(stored) : DEFAULT_FIXED_RATE;
        const hasUserRate = configRepo.get('has_user_rate') === 'true';
        set({
            fixedRate: isNaN(fixedRate) ? DEFAULT_FIXED_RATE : fixedRate,
            hasUserRate,
        });
    },
}));
