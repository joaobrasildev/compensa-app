// src/rules/formatRules.ts
// Funções puras de formatação. Sem dependência de React/Zustand/SQLite.
// Usa .toFixed() + .replace() manual. Não depende 100% de Intl.NumberFormat.

/** "R$ 1.234,56" */
export function formatBRL(value: number): string {
    const abs = Math.abs(value);
    const fixed = abs.toFixed(2);
    const parts = fixed.split('.');
    const intPart = parts[0] ?? '0';
    const decPart = parts[1] ?? '00';

    // Adiciona pontos como separador de milhar
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const sign = value < 0 ? '-' : '';
    return `${sign}R$ ${withDots},${decPart}`;
}

/** "0,00182400 BTC" */
export function formatBTC(value: number): string {
    const fixed = value.toFixed(8);
    const formatted = fixed.replace('.', ',');
    return `${formatted} BTC`;
}

/** "+12,5%" ou "-3,2%" */
export function formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    const fixed = value.toFixed(1).replace('.', ',');
    return `${sign}${fixed}%`;
}

/** "21/02/2026" */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/** "Hoje", "Há 3 dias", "Há 2 semanas", "Há 1 mês", etc. */
export function formatRelativeDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffDay < 1) return 'Hoje';
    if (diffDay === 1) return 'Há 1 dia';
    if (diffDay < 7) return `Há ${diffDay} dias`;
    if (diffWeek === 1) return 'Há 1 semana';
    if (diffWeek < 5) return `Há ${diffWeek} semanas`;
    if (diffMonth === 1) return 'Há 1 mês';
    if (diffMonth < 12) return `Há ${diffMonth} meses`;
    if (diffYear === 1) return 'Há 1 ano';
    return `Há ${diffYear} anos`;
}
