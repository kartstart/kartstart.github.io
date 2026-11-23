export const journalKey = 'kartstart-rides-v1';
export const conditions = ['unspecified', 'dry', 'wet', 'mixed'];
export const limits = { track: 90, kart: 80, time: 15, weather: 80, notes: 1000 };

export function today() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0')).join('-');
}

export function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function normalizeTime(raw) {
  if (!raw) return '';
  const formatted = raw.match(/^(\d{1,3}):([0-5]\d)(?:[.,](\d{1,3}))?$/);
  const secondsOnly = raw.match(/^(\d{1,4})(?:[.,](\d{1,3}))?$/);
  if (!formatted && !secondsOnly) return null;
  const seconds = formatted ? Number(formatted[1]) * 60 + Number(formatted[2]) : Number(secondsOnly[1]);
  const millis = (formatted?.[3] ?? secondsOnly?.[2] ?? '').padEnd(3, '0');
  if (seconds === 0 && millis === '000') return null;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}.${millis}`;
}

function readEntry(entry) {
  if (!entry || typeof entry.id !== 'string' || !entry.id || !isDate(entry.date)) {
    throw new Error('Invalid journal entry');
  }
  const rows = {};
  for (const [key, maximum] of Object.entries(limits)) {
    const value = entry[key] ?? '';
    if (typeof value !== 'string' || value.length > maximum) throw new Error('Invalid journal field');
    rows[key] = value;
  }
  if (!rows.track.trim()) throw new Error('Missing track name');
  return {
    id: entry.id,
    date: entry.date,
    ...rows,
    condition: conditions.includes(entry.condition) ? entry.condition : 'unspecified'
  };
}

function readList(values) {
  if (!Array.isArray(values)) throw new Error('Invalid journal');
  const records = values.map(readEntry);
  if (new Set(records.map(record => record.id)).size !== records.length) {
    throw new Error('Duplicate journal entry');
  }
  return records;
}

export function readRides() {
  return readList(JSON.parse(localStorage.getItem(journalKey) ?? '[]'));
}

export async function changeRides(transform, reset = false) {
  function commit() {
    const current = reset ? [] : readRides();
    const next = transform(current);
    localStorage.setItem(journalKey, JSON.stringify(next));
    return next;
  }
  // Serialize read–modify–write across open tabs where Web Locks is available.
  if (navigator.locks?.request) return navigator.locks.request(journalKey, commit);
  return commit();
}

export function entryFromForm(form) {
  const fields = Object.fromEntries(new FormData(form));
  const date = fields.date;
  const track = fields.track.trim();
  const enteredTime = fields.time.trim();
  const time = normalizeTime(enteredTime);
  const errors = {};
  if (!isDate(date)) errors.date = 'dateError';
  if (!track) errors.track = 'trackError';
  if (time === null) errors.time = 'timeError';
  return {
    errors,
    ride: {
      date, track, time,
      condition: conditions.includes(fields.condition) ? fields.condition : 'unspecified',
      kart: fields.kart.trim(),
      weather: fields.weather.trim(),
      notes: fields.notes.trim()
    }
  };
}

export function readBackup(text) {
  const backup = JSON.parse(text);
  if (backup?.product !== 'KartStart' || (backup.version !== undefined && backup.version !== 1)) {
    throw new Error('Invalid journal backup');
  }
  return readList(backup.rides);
}

export async function downloadBackup(rides) {
  const data = JSON.stringify({ product: 'KartStart', version: 1, exportedAt: new Date().toISOString(), rides }, null, 2);
  const filename = `kartstart-rides-${today()}.json`;
  const blob = new Blob([data], { type: 'application/json' });
  if (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    const files = [new File([blob], filename, { type: 'application/json' })];
    if (navigator.canShare?.({ files })) {
      try {
        await navigator.share({ files });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
