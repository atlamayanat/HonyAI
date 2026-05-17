const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    diabetes_type TEXT,
    target_min INTEGER NOT NULL DEFAULT 70,
    target_max INTEGER NOT NULL DEFAULT 140,
    allergens TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS glucose_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    value INTEGER NOT NULL,
    measured_at TEXT NOT NULL,
    note TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_readings_user_time
    ON glucose_readings(user_id, measured_at DESC);

  CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER PRIMARY KEY,
    reminders_enabled INTEGER NOT NULL DEFAULT 1,
    reminder_times TEXT NOT NULL DEFAULT '["08:00","13:00","20:00"]',
    dark_mode INTEGER NOT NULL DEFAULT 0,
    language TEXT NOT NULL DEFAULT 'tr',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,            -- 'food' | 'exercise'
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,     -- food: alınan, exercise: yakılan
    occurred_at TEXT NOT NULL,
    glucose_delta INTEGER,         -- bu kayıt sonucu kan şekerine eklenen/çıkarılan
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_activities_user_time
    ON activities(user_id, occurred_at DESC);

  CREATE TABLE IF NOT EXISTS water_intakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount_ml INTEGER NOT NULL,
    consumed_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_water_user_time
    ON water_intakes(user_id, consumed_at DESC);

  -- Kan tahlili sonuçları (e-Nabız PDF yüklemeleri)
  CREATE TABLE IF NOT EXISTS lab_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    test_date TEXT,                  -- ISO yyyy-mm-dd; PDF'deki tahlil tarihi
    test_time TEXT,                  -- HH:MM
    facility TEXT,
    patient_name TEXT,
    patient_gender TEXT,
    patient_birth_date TEXT,
    abnormal_count INTEGER NOT NULL DEFAULT 0,
    source_pdf_path TEXT,            -- backend/uploads/... rel path
    source_file_name TEXT,
    status TEXT NOT NULL DEFAULT 'processed',  -- 'processed' | 'failed'
    error_message TEXT,
    extractor_version TEXT,
    processed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_lab_results_user_date
    ON lab_results(user_id, created_at DESC);

  -- Tahlil parametreleri (her tahlil için 10-50 satır)
  CREATE TABLE IF NOT EXISTS lab_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lab_result_id INTEGER NOT NULL,
    param_key TEXT NOT NULL,         -- 'ldl_kolesterol', 'hgb' vb.
    raw_label TEXT,                  -- PDF'deki orijinal etiket
    value REAL NOT NULL,
    unit TEXT,
    ref_min REAL,
    ref_max REAL,
    is_abnormal INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'unknown',
    FOREIGN KEY (lab_result_id) REFERENCES lab_results(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_lab_params_result
    ON lab_parameters(lab_result_id);

  CREATE INDEX IF NOT EXISTS idx_lab_params_user_key
    ON lab_parameters(lab_result_id, param_key);
`);

// Migration: var olan users tablolarına allergens kolonunu ekle
const userCols = db.prepare('PRAGMA table_info(users)').all();
if (!userCols.some((c) => c.name === 'allergens')) {
  db.exec("ALTER TABLE users ADD COLUMN allergens TEXT NOT NULL DEFAULT '[]'");
}

module.exports = db;
