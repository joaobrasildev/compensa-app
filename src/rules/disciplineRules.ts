// src/rules/disciplineRules.ts
// Funções puras de disciplina. Sem dependência de React/Zustand/SQLite.

import type { Saving, DisciplineStats } from '@/types';

/**
 * Calcula estatísticas de disciplina baseadas nos registros.
 * Streaks contam meses consecutivos com pelo menos 1 registro.
 */
export function calculateDiscipline(savings: Saving[]): DisciplineStats {
    if (savings.length === 0) {
        return {
            totalRecords: 0,
            averagePerMonth: 0,
            currentStreak: 0,
            bestStreak: 0,
            emoji: '🌱',
        };
    }

    const totalRecords = savings.length;

    // Coletar meses únicos (YYYY-MM) com registros
    const monthsSet = new Set<string>();
    for (const s of savings) {
        monthsSet.add(s.created_at.slice(0, 7)); // 'YYYY-MM'
    }

    // Ordenar meses
    const months = [...monthsSet].sort();

    // Média por mês
    const averagePerMonth =
        months.length > 0 ? totalRecords / months.length : 0;

    // Calcular streaks de meses consecutivos
    let currentStreak = 1;
    let bestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < months.length; i++) {
        const prev = months[i - 1]!;
        const curr = months[i]!;
        if (isConsecutiveMonth(prev, curr)) {
            tempStreak += 1;
        } else {
            tempStreak = 1;
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
    }

    // Current streak: contar de trás pra frente a partir do mês atual
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = months[months.length - 1];

    if (lastMonth != null && (lastMonth === currentMonth || isConsecutiveMonth(lastMonth, currentMonth))) {
        currentStreak = 1;
        for (let i = months.length - 2; i >= 0; i--) {
            const a = months[i]!;
            const b = months[i + 1]!;
            if (isConsecutiveMonth(a, b)) {
                currentStreak += 1;
            } else {
                break;
            }
        }
    } else {
        currentStreak = 0;
    }

    const emoji = getEmoji(currentStreak);

    return {
        totalRecords,
        averagePerMonth: Math.round(averagePerMonth * 10) / 10,
        currentStreak,
        bestStreak,
        emoji,
    };
}

/** Verifica se dois meses YYYY-MM são consecutivos */
function isConsecutiveMonth(a: string, b: string): boolean {
    const partsA = a.split('-');
    const partsB = b.split('-');
    const yA = Number(partsA[0]);
    const mA = Number(partsA[1]);
    const yB = Number(partsB[0]);
    const mB = Number(partsB[1]);

    const totalA = yA * 12 + mA;
    const totalB = yB * 12 + mB;

    return totalB - totalA === 1;
}

/** Emoji baseado na streak atual */
function getEmoji(streak: number): string {
    if (streak === 0) return '😴';
    if (streak === 1) return '🌱';
    if (streak <= 3) return '🔥';
    if (streak <= 6) return '💪';
    if (streak <= 12) return '⭐';
    return '🏆';
}
