const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const multer = require('multer');
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
//   food:       +calories / 10  (örn. 300 kcal yemek → +30 mg/dL)
//   exercise:   -calories / 15  (örn. 300 kcal yakım → -20 mg/dL)
//   medication: ilaç preseti üzerinden sabit düşüş
//   sonuç 60-300 mg/dL aralığına clamp'lenir.
const MEDICATION_PRESETS = {
  lispro:      { name: 'Insulin lispro',    icon: '💉', delta: -65, info: 'Hızlı etkili • 10-15 dk başlangıç' },
  aspart:      { name: 'Insulin aspart',    icon: '💉', delta: -75, info: 'Hızlı etkili • 10-15 dk başlangıç' },
  glulisine:   { name: 'Insulin glulisine', icon: '💉', delta: -60, info: 'Çok hızlı etki • zirve 1-1.5 sa' },
  regular:     { name: 'Regular insulin',   icon: '💉', delta: -40, info: 'Kısa etkili • 30-45 dk başlangıç' },
  repaglinide: { name: 'Repaglinide',       icon: '💊', delta: -30, info: 'Oral • yemek öncesi' },
  nateglinide: { name: 'Nateglinide',       icon: '💊', delta: -25, info: 'Oral • hızlı/hafif' },
};

function simulateGlucoseDelta(type, calories, medicationId) {
  if (type === 'food') return Math.round(calories / 10);
  if (type === 'exercise') return -Math.round(calories / 15);
  if (type === 'medication') {
    const preset = MEDICATION_PRESETS[medicationId];
    return preset ? preset.delta : 0;
  }
  return 0;
}

function clampGlucose(value) {
  return Math.max(60, Math.min(300, Math.round(value)));
}

app.get('/api/medications/presets', (req, res) => {
  res.json(
    Object.entries(MEDICATION_PRESETS).map(([id, p]) => ({
      id,
      name: p.name,
      icon: p.icon,
      delta: p.delta,
      info: p.info,
    }))
  );
});

app.post('/api/activities', (req, res) => {
  const { type, name, calories, occurred_at, medicationId } = req.body;
  if (type !== 'food' && type !== 'exercise' && type !== 'medication') {
    return res.status(400).json({ error: 'type "food", "exercise" veya "medication" olmalı.' });
  }

  let resolvedName = name;
  let cal = 0;

  if (type === 'medication') {
    const preset = MEDICATION_PRESETS[medicationId];
    if (!preset) {
      return res.status(400).json({ error: 'Geçersiz medicationId.' });
    }
    resolvedName = preset.name;
    cal = 0;
  } else {
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name zorunlu.' });
    }
    cal = Number(calories);
    if (!Number.isFinite(cal) || cal < 0 || cal > 5000) {
      return res.status(400).json({ error: 'calories 0-5000 aralığında olmalı.' });
    }
  }

  const occurredAt = occurred_at || new Date().toISOString();
  const delta = simulateGlucoseDelta(type, cal, medicationId);

  const lastReading = db.prepare(`
    SELECT * FROM glucose_readings
    WHERE user_id = ? AND measured_at <= ?
    ORDER BY measured_at DESC LIMIT 1
  `).get(DEMO_USER_ID, occurredAt);
  const baseValue = lastReading ? lastReading.value : 110;
  const newValue = clampGlucose(baseValue + delta);

  const noteLabel =
    type === 'food' ? 'Yemek' : type === 'exercise' ? 'Egzersiz' : 'İlaç';

  const tx = db.transaction(() => {
    const aResult = db.prepare(`
      INSERT INTO activities (user_id, type, name, calories, occurred_at, glucose_delta)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(DEMO_USER_ID, type, resolvedName, Math.round(cal), occurredAt, delta);

    db.prepare(`
      INSERT INTO glucose_readings (user_id, value, measured_at, note)
      VALUES (?, ?, ?, ?)
    `).run(
      DEMO_USER_ID,
      newValue,
      occurredAt,
      `${noteLabel}: ${resolvedName}`
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

// --- LAB RESULTS (e-Nabız PDF yüklemeleri) ---

const LAB_UPLOAD_DIR = path.join(__dirname, 'uploads', 'lab_results');
fs.mkdirSync(LAB_UPLOAD_DIR, { recursive: true });

const PYTHON_BIN =
  process.env.PYTHON_BIN ||
  (process.platform === 'win32' ? 'python' : 'python3');

// Profilde gösterilen highlight parametreler (HonyAI için kritik 5).
const LAB_HIGHLIGHT_KEYS = [
  'glike_hemoglobin',
  'glukoz',
  'insulin',
  'kreatinin',
  'ldl_kolesterol',
];

const labUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, LAB_UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ts = Date.now();
      const safe = (file.originalname || 'tahlil.pdf').replace(/[^\w.-]+/g, '_');
      cb(null, `${ts}_${safe}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname || '');
    if (isPdf) return cb(null, true);
    cb(new Error('Sadece PDF dosyaları kabul edilir'));
  },
});

function runLabParser(pdfAbsPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_BIN, ['-m', 'lab_parser.cli', pdfAbsPath], {
      cwd: __dirname,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString('utf8'); });
    proc.stderr.on('data', (d) => { stderr += d.toString('utf8'); });
    proc.on('error', (err) => {
      reject(new Error(`Python başlatılamadı (${PYTHON_BIN}): ${err.message}`));
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(
          `Parser exit ${code}: ${stderr.trim() || 'bilinmeyen hata'}`
        ));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error(
          `Parser JSON döndürmedi: ${e.message}. İlk 500 char: ${stdout.slice(0, 500)}`
        ));
      }
    });
  });
}

function relPathFromBackend(absPath) {
  return path.relative(__dirname, absPath).replace(/\\/g, '/');
}

function insertLabResult(userId, parsed, file) {
  const params = Object.entries(parsed.parameters || {});
  const abnormalCount = Number.isFinite(parsed.abnormal_count) ? parsed.abnormal_count : 0;

  const tx = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO lab_results
        (user_id, test_date, test_time, facility, patient_name, patient_gender,
         patient_birth_date, abnormal_count, source_pdf_path, source_file_name,
         status, extractor_version, processed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processed', ?, datetime('now'))
    `).run(
      userId,
      parsed.test_date || null,
      parsed.test_time || null,
      parsed.facility || null,
      parsed.patient?.name || null,
      parsed.patient?.gender || null,
      parsed.patient?.birth_date || null,
      abnormalCount,
      file.path,
      file.originalName,
      parsed.extractor_version || null
    );
    const labId = result.lastInsertRowid;

    const insertParam = db.prepare(`
      INSERT INTO lab_parameters
        (lab_result_id, param_key, raw_label, value, unit, ref_min, ref_max, is_abnormal, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const [key, p] of params) {
      if (!Number.isFinite(p?.value)) continue;
      insertParam.run(
        labId,
        key,
        p.raw_label || null,
        p.value,
        p.unit || null,
        Number.isFinite(p.ref_min) ? p.ref_min : null,
        Number.isFinite(p.ref_max) ? p.ref_max : null,
        p.is_abnormal ? 1 : 0,
        p.category || 'unknown'
      );
    }
    return labId;
  });

  return tx();
}

function insertFailedLabResult(userId, file, errorMessage) {
  const result = db.prepare(`
    INSERT INTO lab_results
      (user_id, source_pdf_path, source_file_name, status, error_message, processed_at)
    VALUES (?, ?, ?, 'failed', ?, datetime('now'))
  `).run(userId, file.path, file.originalName, errorMessage);
  return result.lastInsertRowid;
}

function getLabResultListItem(row) {
  const cnt = db.prepare(
    'SELECT COUNT(*) AS c FROM lab_parameters WHERE lab_result_id = ?'
  ).get(row.id).c;
  return {
    id: row.id,
    testDate: row.test_date,
    testTime: row.test_time,
    facility: row.facility,
    patientName: row.patient_name,
    patientGender: row.patient_gender,
    patientBirthDate: row.patient_birth_date,
    abnormalCount: row.abnormal_count,
    parameterCount: cnt,
    sourceFileName: row.source_file_name,
    status: row.status,
    errorMessage: row.error_message,
    extractorVersion: row.extractor_version,
    processedAt: row.processed_at,
    createdAt: row.created_at,
  };
}

function getLabResultDetail(id, userId) {
  const row = db.prepare(
    'SELECT * FROM lab_results WHERE id = ? AND user_id = ?'
  ).get(id, userId);
  if (!row) return null;

  const params = db.prepare(`
    SELECT param_key, raw_label, value, unit, ref_min, ref_max, is_abnormal, category
    FROM lab_parameters WHERE lab_result_id = ?
  `).all(id);

  const parameters = {};
  for (const p of params) {
    parameters[p.param_key] = {
      rawLabel: p.raw_label,
      value: p.value,
      unit: p.unit,
      refMin: p.ref_min,
      refMax: p.ref_max,
      isAbnormal: !!p.is_abnormal,
      category: p.category,
    };
  }

  return { ...getLabResultListItem(row), parameters };
}

// Liste — yeniden eskiye
app.get('/api/lab-results', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM lab_results
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(DEMO_USER_ID);
  res.json(rows.map(getLabResultListItem));
});

// Özet — profil kartı için en son tahlilin highlight değerleri (route :id'den ÖNCE)
app.get('/api/lab-results/summary', (req, res) => {
  const latest = db.prepare(`
    SELECT id, test_date, abnormal_count, created_at
    FROM lab_results
    WHERE user_id = ? AND status = 'processed'
    ORDER BY created_at DESC
    LIMIT 1
  `).get(DEMO_USER_ID);

  if (!latest) return res.json(null);

  const placeholders = LAB_HIGHLIGHT_KEYS.map(() => '?').join(',');
  const params = db.prepare(`
    SELECT param_key, value, unit, is_abnormal, ref_min, ref_max
    FROM lab_parameters
    WHERE lab_result_id = ? AND param_key IN (${placeholders})
  `).all(latest.id, ...LAB_HIGHLIGHT_KEYS);

  const values = {};
  for (const p of params) {
    values[p.param_key] = {
      value: p.value,
      unit: p.unit,
      isAbnormal: !!p.is_abnormal,
      refMin: p.ref_min,
      refMax: p.ref_max,
    };
  }

  res.json({
    labResultId: latest.id,
    testDate: latest.test_date,
    abnormalCount: latest.abnormal_count,
    values,
    createdAt: latest.created_at,
  });
});

// Detay
app.get('/api/lab-results/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Geçersiz id' });

  const detail = getLabResultDetail(id, DEMO_USER_ID);
  if (!detail) return res.status(404).json({ error: 'Tahlil bulunamadı' });
  res.json(detail);
});

// Sil
app.delete('/api/lab-results/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Geçersiz id' });

  const row = db.prepare(
    'SELECT source_pdf_path FROM lab_results WHERE id = ? AND user_id = ?'
  ).get(id, DEMO_USER_ID);
  if (!row) return res.status(404).json({ error: 'Tahlil bulunamadı' });

  db.prepare('DELETE FROM lab_results WHERE id = ? AND user_id = ?')
    .run(id, DEMO_USER_ID);

  if (row.source_pdf_path) {
    const abs = path.resolve(__dirname, row.source_pdf_path);
    fs.promises.unlink(abs).catch(() => {});
  }
  res.json({ ok: true });
});

// Yükleme — multipart/form-data, alan adı: 'pdf'
app.post('/api/lab-uploads', labUpload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'PDF dosyası gönderilmedi (form alanı adı: "pdf")',
    });
  }

  const file = {
    path: relPathFromBackend(req.file.path),
    absPath: req.file.path,
    originalName: req.file.originalname,
  };

  try {
    const parsed = await runLabParser(file.absPath);
    const labId = insertLabResult(DEMO_USER_ID, parsed, file);
    const created = getLabResultDetail(labId, DEMO_USER_ID);
    res.status(201).json(created);
  } catch (err) {
    console.error('Lab parser hatası:', err);
    const failedId = insertFailedLabResult(
      DEMO_USER_ID,
      file,
      (err && err.message) ? err.message : String(err)
    );
    res.status(500).json({
      error: 'PDF işlenemedi',
      detail: err && err.message ? err.message : String(err),
      labResultId: failedId,
    });
  }
});

// Multer/yükleme hata yakalayıcı (genel hata middleware'inden ÖNCE)
app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({
      error: `Yükleme hatası: ${err.message}`,
      code: err.code,
    });
  }
  if (err && /Sadece PDF/.test(err.message || '')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
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
