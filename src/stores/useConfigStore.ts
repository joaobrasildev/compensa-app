// src/stores/useConfigStore.ts
// Configuração do usuário (taxa fixa)

import { create } from 'zustand';
import * as configRepo from '@/repositories/configRepository';

const DEFAULT_FIXED_RATE = 12.5;

type ConfigState = {
    fixedRate: number;
    setFixedRate: (rate: number) => void;
    loadConfig: () => void;
};

export const useConfigStore = create<ConfigState>()((set) => ({
    fixedRate: DEFAULT_FIXED_RATE,

    setFixedRate: (rate) => {
        configRepo.set('fixed_rate', String(rate));
        set({ fixedRate: rate });
    },

    loadConfig: () => {
        const stored = configRepo.get('fixed_rate');
        const fixedRate = stored != null ? parseFloat(stored) : DEFAULT_FIXED_RATE;
        set({ fixedRate: isNaN(fixedRate) ? DEFAULT_FIXED_RATE : fixedRate });
    },
}));
