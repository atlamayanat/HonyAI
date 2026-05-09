const db = require('./db');

const DEMO_USER_ID = 66357;
const reset = process.argv.includes('--reset');

if (reset) {
  db.exec(`
    DELETE FROM glucose_readings;
    DELETE FROM settings;
    DELETE FROM users;
  `);
  console.log('Tablolar temizlendi.');
}

const userExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get(DEMO_USER_ID);
if (!userExists) {
  db.prepare(`
    INSERT INTO users (id, name, age, diabetes_type, target_min, target_max)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(DEMO_USER_ID, 'Ahmet BÜYÜK', 45, 'Tip 2 Diyabet', 70, 140);
  console.log('Demo kullanıcısı eklendi.');
}

const settingsExist = db.prepare('SELECT 1 FROM settings WHERE user_id = ?').get(DEMO_USER_ID);
if (!settingsExist) {
  db.prepare(`
    INSERT INTO settings (user_id, reminders_enabled, reminder_times, dark_mode, language)
    VALUES (?, 1, '["08:00","13:00","20:00"]', 0, 'tr')
  `).run(DEMO_USER_ID);
  console.log('Default ayarlar eklendi.');
}

const readingCount = db.prepare(
  'SELECT COUNT(*) as c FROM glucose_readings WHERE user_id = ?'
).get(DEMO_USER_ID).c;

if (readingCount === 0) {
  const insert = db.prepare(`
    INSERT INTO glucose_readings (user_id, value, measured_at, note)
    VALUES (?, ?, ?, ?)
  `);

  // Son 14 günün her birine 3 ölçüm: sabah aç (90-130), öğle tokluk (130-200), akşam (110-220)
  // Son birkaç gün biraz yüksek (dramatik trend) — demo için ilgi çekici
  const insertMany = db.transaction(() => {
    const now = new Date();
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const recencyBoost = dayOffset < 3 ? 30 : 0; // son 3 gün biraz yüksek
      const slots = [
        { hour: 8, min: 90, max: 130, label: 'Sabah aç' },
        { hour: 13, min: 130, max: 200, label: 'Öğle tokluk' },
        { hour: 20, min: 110, max: 180, label: 'Akşam' },
      ];

      slots.forEach((slot) => {
        const d = new Date(now);
        d.setDate(d.getDate() - dayOffset);
        d.setHours(slot.hour, Math.floor(Math.random() * 60), 0, 0);
        const value = Math.round(
          slot.min + Math.random() * (slot.max - slot.min) + recencyBoost
        );
        insert.run(DEMO_USER_ID, value, d.toISOString(), slot.label);
      });
    }
  });

  insertMany();
  console.log('14 günlük örnek ölçüm verisi eklendi (42 kayıt).');
} else {
  console.log(`Zaten ${readingCount} ölçüm mevcut, ekleme atlandı.`);
}

console.log('Seed tamamlandı.');
