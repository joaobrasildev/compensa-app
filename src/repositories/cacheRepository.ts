// src/repositories/cacheRepository.ts
// Cache de dados externos (BTC, SELIC)

import { getDatabase } from './database';
import type { CacheEntry } from '@/types';

export function get(key: string): CacheEntry | null {
    const db = getDatabase();
    const row = db.getFirstSync<CacheEntry>(
        'SELECT key, value, fetched_at FROM external_data_cache WHERE key = ?',
        [key],
    );
    return row ?? null;
}

export function set(key: string, value: unknown): void {
    const db = getDatabase();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    db.runSync(
        'INSERT OR REPLACE INTO external_data_cache (key, value, fetched_at) VALUES (?, ?, datetime("now"))',
        [key, serialized],
    );
}

/**
 * Verifica se o cache existe e se fetched_at é "hoje" (mesmo dia UTC).
 */
export function isValid(key: string): boolean {
    const db = getDatabase();
    const row = db.getFirstSync<{ fetched_at: string }>(
        'SELECT fetched_at FROM external_data_cache WHERE key = ?',
        [key],
    );

    if (row == null) return false;

    const fetchedDate = row.fetched_at.slice(0, 10); // 'YYYY-MM-DD'
    const todayDate = new Date().toISOString().slice(0, 10);
    return fetchedDate === todayDate;
}
