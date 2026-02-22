// src/repositories/database.ts
// Conexão SQLite + migrations

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'compensa.db';

let db: SQLite.SQLiteDatabase | null = null;

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS savings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    investment_type TEXT NOT NULL CHECK(investment_type IN ('RF', 'BTC')),
    fixed_rate_at_save REAL NOT NULL,
    selic_at_save REAL NOT NULL,
    btc_price_at_save REAL NOT NULL,
    btc_equivalent REAL NOT NULL,
    cagr_1y_at_save REAL,
    cagr_5y_at_save REAL,
    cagr_10y_at_save REAL,
    proj_1y_rf REAL,
    proj_5y_rf REAL,
    proj_10y_rf REAL,
    proj_1y_btc REAL,
    proj_5y_btc REAL,
    proj_10y_btc REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,
  `CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS external_data_cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,
];

export function getDatabase(): SQLite.SQLiteDatabase {
  if (db != null) return db;

  db = SQLite.openDatabaseSync(DB_NAME);

  db.execSync('PRAGMA journal_mode = WAL;');

  for (const migration of MIGRATIONS) {
    db.execSync(migration);
  }

  return db;
}
