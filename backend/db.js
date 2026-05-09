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
    target_max INTEGER NOT NULL DEFAULT 140
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
`);

module.exports = db;
