// Typed localStorage wrapper. All Zuuno persistence flows through here so that
// account export/deletion (PRD §11) can enumerate and clear every key.

const PREFIX = 'zuuno.';

export const STORAGE_KEYS = {
  profile: 'profile',
  consent: 'consent',
  onboarded: 'onboarded',
  premium: 'premium',
  savedTrials: 'savedTrials',
  savedProviders: 'savedProviders',
  transcripts: 'transcripts',
  accessibility: 'accessibility',
} as const;

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable or quota exceeded — non-fatal for an offline-first app.
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export function exportAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        const raw = localStorage.getItem(k);
        out[k.slice(PREFIX.length)] = raw ? safeParse(raw) : null;
      }
    }
  } catch {
    // ignore
  }
  return out;
}

export function clearAll(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
