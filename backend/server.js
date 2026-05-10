const express = require('express');
const cors = require('cors');
const db = require('./db');

const DEMO_USER_ID = 66357;
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

const parseAllergens = (raw) => {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
};

const toUserDTO = (row) => ({
  id: row.id,
  name: row.name,
  age: row.age,
  diabetesType: row.diabetes_type,
  targetMin: row.target_min,
  targetMax: row.target_max,
  allergens: parseAllergens(row.allergens),
});

const toReadingDTO = (row) => ({
  id: row.id,
  value: row.value,
  measuredAt: row.measured_at,
  note: row.note || undefined,
});

const toSettingsDTO = (row) => ({
  remindersEnabled: !!row.reminders_enabled,
  reminderTimes: JSON.parse(row.reminder_times),
  darkMode: !!row.dark_mode,
  language: row.language,
});

// --- USER ---
app.get('/api/user', (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(DEMO_USER_ID);
  if (!row) return res.status(404).json({ error: 'Kullanıcı bulunamadı. Önce seed çalıştırın.' });
  res.json(toUserDTO(row));
});

app.put('/api/user', (req, res) => {
  const { name, age, diabetesType, targetMin, targetMax } = req.body;
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(DEMO_USER_ID);
  if (!current) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  db.prepare(`
    UPDATE users
    SET name = ?, age = ?, diabetes_type = ?, target_min = ?, target_max = ?
    WHERE id = ?
  `).run(
    name ?? current.name,
    age ?? current.age,
    diabetesType ?? current.diabetes_type,
    targetMin ?? current.target_min,
    targetMax ?? current.target_max,
    DEMO_USER_ID
  );

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(DEMO_USER_ID);
  res.json(toUserDTO(updated));
});

// --- PREFERENCES (alerjenler — kullanici geneli) ---
app.get('/api/preferences', (req, res) => {
  const row = db.prepare('SELECT allergens FROM users WHERE id = ?').get(DEMO_USER_ID);
  if (!row) return res.status(404).json({ error: 'Kullanici bulunamadi.' });
  res.json({ allergens: parseAllergens(row.allergens) });
});

app.put('/api/preferences', (req, res) => {
  const { allergens } = req.body;
  if (!Array.isArray(allergens) || !allergens.every((a) => typeof a === 'string')) {
    return res.status(400).json({ error: 'allergens string dizisi olmali.' });
  }
  db.prepare('UPDATE users SET allergens = ? WHERE id = ?')
    .run(JSON.stringify(allergens), DEMO_USER_ID);
  res.json({ allergens });
});

// --- READINGS ---
app.get('/api/readings/latest', (req, res) => {
  // Şu andan sonraki (gelecek-tarihli seed) ölçümleri "son" sayma
  const row = db.prepare(`
    SELECT * FROM glucose_readings
    WHERE user_id = ? AND measured_at <= ?
    ORDER BY measured_at DESC
    LIMIT 1
  `).get(DEMO_USER_ID, new Date().toISOString());
  if (!row) return res.json(null);
  res.json(toReadingDTO(row));
});

app.get('/api/readings', (req, res) => {
  const days = Math.max(1, Math.min(365, parseInt(req.query.days, 10) || 7));
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = db.prepare(`
    SELECT * FROM glucose_readings
    WHERE user_id = ? AND measured_at >= ?
    ORDER BY measured_at DESC
  `).all(DEMO_USER_ID, since.toISOString());

  res.json(rows.map(toReadingDTO));
});

app.post('/api/readings', (req, res) => {
  const { value, measured_at, note } = req.body;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 20 || numeric > 600) {
    return res.status(400).json({ error: 'Geçersiz değer (20-600 mg/dL aralığında olmalı).' });
  }
  const measuredAt = measured_at || new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO glucose_readings (user_id, value, measured_at, note)
    VALUES (?, ?, ?, ?)
  `).run(DEMO_USER_ID, Math.round(numeric), measuredAt, note || null);

  const row = db.prepare('SELECT * FROM glucose_readings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(toReadingDTO(row));
});

app.delete('/api/readings/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = db.prepare(
    'DELETE FROM glucose_readings WHERE id = ? AND user_id = ?'
  ).run(id, DEMO_USER_ID);
  if (result.changes === 0) return res.status(404).json({ error: 'Ölçüm bulunamadı.' });
  res.json({ ok: true });
});

// --- SETTINGS ---
app.get('/api/settings', (req, res) => {
  const row = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(DEMO_USER_ID);
  if (!row) return res.status(404).json({ error: 'Ayar bulunamadı.' });
  res.json(toSettingsDTO(row));
});

app.put('/api/settings', (req, res) => {
  const { remindersEnabled, reminderTimes, darkMode, language } = req.body;
  const current = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(DEMO_USER_ID);
  if (!current) return res.status(404).json({ error: 'Ayar bulunamadı.' });

  db.prepare(`
    UPDATE settings
    SET reminders_enabled = ?, reminder_times = ?, dark_mode = ?, language = ?
    WHERE user_id = ?
  `).run(
    remindersEnabled === undefined ? current.reminders_enabled : (remindersEnabled ? 1 : 0),
    reminderTimes ? JSON.stringify(reminderTimes) : current.reminder_times,
    darkMode === undefined ? current.dark_mode : (darkMode ? 1 : 0),
    language ?? current.language,
    DEMO_USER_ID
  );

  const updated = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(DEMO_USER_ID);
  res.json(toSettingsDTO(updated));
});

// --- ACTIVITIES (food / exercise) ---
const toActivityDTO = (row) => ({
  id: row.id,
  type: row.type,
  name: row.name,
  calories: row.calories,
  occurredAt: row.occurred_at,
  glucoseDelta: row.glucose_delta,
});

// DEMO: Basitleştirilmiş kan şekeri simülasyonu — gerçek tıbbi hesaplama değildir.
//   food:     +calories / 10  (örn. 300 kcal yemek → +30 mg/dL)
//   exercise: -calories / 15  (örn. 300 kcal yakım → -20 mg/dL)
//   sonuç 60-300 mg/dL aralığına clamp'lenir.
function simulateGlucoseDelta(type, calories) {
  if (type === 'food') return Math.round(calories / 10);
  if (type === 'exercise') return -Math.round(calories / 15);
  return 0;
}

function clampGlucose(value) {
  return Math.max(60, Math.min(300, Math.round(value)));
}

app.post('/api/activities', (req, res) => {
  const { type, name, calories, occurred_at } = req.body;
  if (type !== 'food' && type !== 'exercise') {
    return res.status(400).json({ error: 'type "food" veya "exercise" olmalı.' });
  }
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name zorunlu.' });
  }
  const cal = Number(calories);
  if (!Number.isFinite(cal) || cal < 0 || cal > 5000) {
    return res.status(400).json({ error: 'calories 0-5000 aralığında olmalı.' });
  }

  const occurredAt = occurred_at || new Date().toISOString();
  const delta = simulateGlucoseDelta(type, cal);

  const lastReading = db.prepare(`
    SELECT * FROM glucose_readings
    WHERE user_id = ? AND measured_at <= ?
    ORDER BY measured_at DESC LIMIT 1
  `).get(DEMO_USER_ID, occurredAt);
  const baseValue = lastReading ? lastReading.value : 110;
  const newValue = clampGlucose(baseValue + delta);

  const tx = db.transaction(() => {
    const aResult = db.prepare(`
      INSERT INTO activities (user_id, type, name, calories, occurred_at, glucose_delta)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(DEMO_USER_ID, type, name, Math.round(cal), occurredAt, delta);

    db.prepare(`
      INSERT INTO glucose_readings (user_id, value, measured_at, note)
      VALUES (?, ?, ?, ?)
    `).run(
      DEMO_USER_ID,
      newValue,
      occurredAt,
      `${type === 'food' ? 'Yemek' : 'Egzersiz'}: ${name}`
    );

    return aResult.lastInsertRowid;
  });

  const newId = tx();
  const activityRow = db.prepare('SELECT * FROM activities WHERE id = ?').get(newId);

  res.status(201).json({
    activity: toActivityDTO(activityRow),
    newGlucose: newValue,
    previousGlucose: baseValue,
    delta,
  });
});

app.get('/api/activities', (req, res) => {
  const days = Math.max(1, Math.min(365, parseInt(req.query.days, 10) || 7));
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = db.prepare(`
    SELECT * FROM activities
    WHERE user_id = ? AND occurred_at >= ?
    ORDER BY occurred_at DESC
  `).all(DEMO_USER_ID, since.toISOString());

  res.json(rows.map(toActivityDTO));
});

app.delete('/api/activities/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = db.prepare(
    'DELETE FROM activities WHERE id = ? AND user_id = ?'
  ).run(id, DEMO_USER_ID);
  if (result.changes === 0) return res.status(404).json({ error: 'Aktivite bulunamadı.' });
  res.json({ ok: true });
});

// --- WATER INTAKE ---
const WATER_GOAL_ML = 2000; // gunluk hedef: 8 bardak * 250ml

app.get('/api/water/today', (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const row = db.prepare(`
    SELECT COALESCE(SUM(amount_ml), 0) AS total
    FROM water_intakes
    WHERE user_id = ? AND consumed_at >= ?
  `).get(DEMO_USER_ID, startOfDay.toISOString());

  const consumed = row.total || 0;
  res.json({
    consumedMl: consumed,
    goalMl: WATER_GOAL_ML,
    progress: Math.min(1, consumed / WATER_GOAL_ML),
    glasses: Math.floor(consumed / 250),
    glassMl: 250,
  });
});

app.post('/api/water', (req, res) => {
  const amount = Number(req.body?.amountMl) || 250;
  if (amount <= 0 || amount > 2000) {
    return res.status(400).json({ error: 'amountMl 1-2000 araliginda olmali.' });
  }
  db.prepare(`
    INSERT INTO water_intakes (user_id, amount_ml, consumed_at)
    VALUES (?, ?, ?)
  `).run(DEMO_USER_ID, Math.round(amount), new Date().toISOString());

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const row = db.prepare(`
    SELECT COALESCE(SUM(amount_ml), 0) AS total
    FROM water_intakes
    WHERE user_id = ? AND consumed_at >= ?
  `).get(DEMO_USER_ID, startOfDay.toISOString());

  res.status(201).json({
    consumedMl: row.total || 0,
    goalMl: WATER_GOAL_ML,
    progress: Math.min(1, (row.total || 0) / WATER_GOAL_ML),
    glasses: Math.floor((row.total || 0) / 250),
    glassMl: 250,
  });
});

app.delete('/api/water/today', (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  db.prepare('DELETE FROM water_intakes WHERE user_id = ? AND consumed_at >= ?')
    .run(DEMO_USER_ID, startOfDay.toISOString());
  res.json({ ok: true });
});

// --- STEPS (DEMO) ---
// DEMO: Adım sayacı saat ilerledikçe artan deterministik bir değer döner.
// Gerçek entegrasyon için: iOS HealthKit / Android Fit / Expo Pedometer.
app.get('/api/steps/today', (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const elapsedMs = now.getTime() - startOfDay.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const progress = Math.min(1, elapsedMs / dayMs);
  // Hedef 10000, gün ilerledikçe 0 → ~7500 arası rastgele görünümlü değer
  const seed = now.getDate() + now.getMonth() * 31;
  const wiggle = 500 + (seed % 700);
  const steps = Math.round(progress * 7800 + wiggle);
  res.json({
    steps,
    goal: 10000,
    progress: Math.min(1, steps / 10000),
  });
});

// --- HEALTHCHECK ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HoneyAI backend dinliyor: http://localhost:${PORT}`);
  console.log(`LAN'dan erişim için bilgisayarınızın IP'sini kullanın.`);
});
