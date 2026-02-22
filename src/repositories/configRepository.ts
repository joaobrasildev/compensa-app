// src/repositories/configRepository.ts
// Configurações persistentes (chave/valor)

import { getDatabase } from './database';

export function get(key: string): string | null {
    const db = getDatabase();
    const row = db.getFirstSync<{ value: string }>(
        'SELECT value FROM config WHERE key = ?',
        [key],
    );
    return row?.value ?? null;
}

export function set(key: string, value: string): void {
    const db = getDatabase();
    db.runSync(
        'INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)',
        [key, value],
    );
}
