// src/stores/useSavingsStore.ts
// Estado das economias salvas

import { create } from 'zustand';
import type { Saving, NewSaving } from '@/types';
import * as savingsRepo from '@/repositories/savingsRepository';

type SavingsState = {
    savings: Saving[];
    totalSaved: number;
    count: number;
    addSaving: (saving: NewSaving) => void;
    loadSavings: () => void;
    deleteSaving: (id: number) => void;
};

export const useSavingsStore = create<SavingsState>()((set) => ({
    savings: [],
    totalSaved: 0,
    count: 0,

    addSaving: (saving) => {
        savingsRepo.insert(saving);
        // Reload after insert
        const savings = savingsRepo.getAll();
        const totalSaved = savingsRepo.getTotalAmount();
        const count = savingsRepo.getCount();
        set({ savings, totalSaved, count });
    },

    loadSavings: () => {
        const savings = savingsRepo.getAll();
        const totalSaved = savingsRepo.getTotalAmount();
        const count = savingsRepo.getCount();
        set({ savings, totalSaved, count });
    },

    deleteSaving: (id) => {
        savingsRepo.deleteById(id);
        // Reload completo após deletar
        const savings = savingsRepo.getAll();
        const totalSaved = savingsRepo.getTotalAmount();
        const count = savingsRepo.getCount();
        set({ savings, totalSaved, count });
    },
}));
