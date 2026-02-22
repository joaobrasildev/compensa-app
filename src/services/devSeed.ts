// src/services/devSeed.ts
// ⚠️  TEMPORÁRIO — inserir economias de teste para visualizar o gráfico
// Remover este arquivo e a chamada em initService após validação

import { getDatabase } from '@/repositories/database';

export function seedTestSavings(): void {
    const db = getDatabase();

    // Só roda se tiver poucas economias (evita duplicar)
    const row = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM savings',
    );
    if ((row?.count ?? 0) >= 10) return;

    const records = [
        // Set/2025
        { amount: 523.47, desc: 'Café especial cancelado', type: 'RF', date: '2025-09-03 08:22:00' },
        { amount: 2890.30, desc: 'Tênis desistido', type: 'BTC', date: '2025-09-17 14:10:00' },

        // Out/2025
        { amount: 1199.90, desc: 'Camisa de marca', type: 'RF', date: '2025-10-05 11:45:00' },
        { amount: 7430.55, desc: 'Curso online caro', type: 'BTC', date: '2025-10-14 09:30:00' },
        { amount: 845.20, desc: 'Delivery evitado', type: 'RF', date: '2025-10-29 20:15:00' },

        // Nov/2025
        { amount: 13750.88, desc: 'iPhone novo desistido', type: 'BTC', date: '2025-11-08 10:00:00' },
        { amount: 672.35, desc: 'Streaming cancelado', type: 'RF', date: '2025-11-21 07:50:00' },
        { amount: 3120.00, desc: 'Black Friday resistida', type: 'RF', date: '2025-11-28 23:00:00' },

        // Dez/2025
        { amount: 4560.75, desc: 'Presente trocado por caseiro', type: 'RF', date: '2025-12-10 15:30:00' },
        { amount: 9870.42, desc: 'Viagem de ano novo', type: 'BTC', date: '2025-12-22 18:00:00' },

        // Jan/2026
        { amount: 1380.60, desc: 'Uber economizado', type: 'RF', date: '2026-01-06 12:00:00' },
        { amount: 6245.19, desc: 'Gadget adiado', type: 'BTC', date: '2026-01-15 16:40:00' },
        { amount: 990.00, desc: 'Assinatura cancelada', type: 'RF', date: '2026-01-27 09:00:00' },

        // Fev/2026
        { amount: 11430.65, desc: 'TV nova desistida', type: 'BTC', date: '2026-02-04 13:20:00' },
        { amount: 587.80, desc: 'Lanche da tarde', type: 'RF', date: '2026-02-18 17:00:00' },
    ];

    for (const r of records) {
        const btcEquiv = r.type === 'BTC' ? r.amount / 650000 : 0;
        db.runSync(
            `INSERT INTO savings (
        amount, description, investment_type,
        fixed_rate_at_save, selic_at_save, btc_price_at_save, btc_equivalent,
        cagr_1y_at_save, cagr_5y_at_save, cagr_10y_at_save,
        proj_1y_rf, proj_5y_rf, proj_10y_rf,
        proj_1y_btc, proj_5y_btc, proj_10y_btc,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                r.amount,
                r.desc,
                r.type,
                12.5,           // fixed_rate_at_save
                15.0,           // selic_at_save
                650000,         // btc_price_at_save
                btcEquiv,       // btc_equivalent
                80, 60, 50,     // CAGRs
                r.amount * 1.125,   // proj_1y_rf
                r.amount * 1.8,     // proj_5y_rf
                r.amount * 3.2,     // proj_10y_rf
                r.amount * 1.8,     // proj_1y_btc
                r.amount * 8.5,     // proj_5y_btc
                r.amount * 25.0,    // proj_10y_btc
                r.date,             // created_at retroativo
            ],
        );
    }

    if (__DEV__) {
        console.log('[devSeed] 15 economias de teste inseridas (set/25 → fev/26)');
    }
}
