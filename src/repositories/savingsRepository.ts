// src/repositories/savingsRepository.ts
// CRUD de economias

import { getDatabase } from './database';
import type { Saving, NewSaving } from '@/types';

export function insert(saving: NewSaving): number {
  const db = getDatabase();

  const result = db.runSync(
    `INSERT INTO savings (
      amount, description, investment_type,
      fixed_rate_at_save, selic_at_save, btc_price_at_save, btc_equivalent,
      cagr_1y_at_save, cagr_5y_at_save, cagr_10y_at_save,
      proj_1y_rf, proj_5y_rf, proj_10y_rf,
      proj_1y_btc, proj_5y_btc, proj_10y_btc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      saving.amount,
      saving.description,
      saving.investment_type,
      saving.fixed_rate_at_save,
      saving.selic_at_save,
      saving.btc_price_at_save,
      saving.btc_equivalent,
      saving.cagr_1y_at_save,
      saving.cagr_5y_at_save,
      saving.cagr_10y_at_save,
      saving.proj_1y_rf,
      saving.proj_5y_rf,
      saving.proj_10y_rf,
      saving.proj_1y_btc,
      saving.proj_5y_btc,
      saving.proj_10y_btc,
    ],
  );

  return result.lastInsertRowId;
}

export function getAll(): Saving[] {
  const db = getDatabase();
  return db.getAllSync<Saving>('SELECT * FROM savings ORDER BY created_at DESC');
}

export function getTopN(n: number): Saving[] {
  const db = getDatabase();
  return db.getAllSync<Saving>(
    'SELECT * FROM savings ORDER BY amount DESC LIMIT ?',
    [n],
  );
}

export function getTotalAmount(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM savings',
  );
  return row?.total ?? 0;
}

export function getCount(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM savings',
  );
  return row?.count ?? 0;
}

export function deleteById(id: number): void {
  const db = getDatabase();
  db.runSync('DELETE FROM savings WHERE id = ?', [id]);
}
