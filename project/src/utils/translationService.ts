const TRANSLATION_CACHE = new Map<string, string>();
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

const LANGUAGE_MAP: Record<string, string> = {
  en: 'en',
  ml: 'ml',
  ta: 'ta',
  kn: 'kn',
  te: 'te',
  hi: 'hi',
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const normalizeLang = (lang: string) => (lang || 'en').trim().toLowerCase();
const stripHtml = (text: string) =>
  (text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const cacheKeyOf = (sourceLang: string, targetLang: string, text: string) =>
  `${sourceLang}-${targetLang}-${text}`;

const localKeyOf = (key: string) => `tr_${key}`;

const getLocalCache = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setLocalCache = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

// -------------------- GLOBAL HARD STOP --------------------
// If 429 happens once, disable translations for a while.
const RATE_LIMIT_KEY = 'translation_rate_limited_until';
const RATE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

function getRateLimitedUntil(): number {
  try {
    return Number(localStorage.getItem(RATE_LIMIT_KEY) || '0');
  } catch {
    return 0;
  }
}

function setRateLimitedUntil(ts: number) {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(ts));
  } catch {}
}

function isRateLimitedNow() {
  return Date.now() < getRateLimitedUntil();
}

// -------------------- Throttle queue --------------------
let active = 0;
const MAX_CONCURRENT = 1;
const queue: Array<() => void> = [];

async function runQueued<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  active++;
  try {
    return await fn();
  } finally {
    active--;
    const next = queue.shift();
    if (next) next();
  }
}

// -------------------- translate --------------------
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<string> {
  if (!text || text.trim() === '') return text;

  const tgt = normalizeLang(targetLang);
  const src = normalizeLang(sourceLang);
  if (tgt === src) return text;

  const clean = stripHtml(text);
  if (!clean) return text;

  // ✅ HARD STOP: if rate limited, do not call API at all
  if (isRateLimitedNow()) {
    return text;
  }

  const targetCode = LANGUAGE_MAP[tgt] || tgt;
  const sourceCode = LANGUAGE_MAP[src] || src;

  const key = cacheKeyOf(sourceCode, targetCode, clean);

  if (TRANSLATION_CACHE.has(key)) return TRANSLATION_CACHE.get(key)!;

  const localKey = localKeyOf(key);
  const localVal = getLocalCache(localKey);
  if (localVal) {
    TRANSLATION_CACHE.set(key, localVal);
    return localVal;
  }

  return runQueued(async () => {
    // check again inside queue
    if (isRateLimitedNow()) return text;

    let attempts = 0;
    let delay = 1200;

    while (attempts < 2) {
      attempts++;

      try {
        const url =
          `${MYMEMORY_API}?q=${encodeURIComponent(clean)}&langpair=${encodeURIComponent(sourceCode)}|${encodeURIComponent(targetCode)}`;

        const response = await fetch(url);

        if (response.status === 429) {
          // ✅ set 30-min lock
          const until = Date.now() + RATE_LIMIT_MS;
          setRateLimitedUntil(until);
          console.warn('MyMemory 429 rate-limited. Disabling live translation for 30 minutes.');
          return text;
        }

        if (!response.ok) return text;

        const data = await response.json();
        if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
          const translated: string = data.responseData.translatedText;
          TRANSLATION_CACHE.set(key, translated);
          setLocalCache(localKey, translated);
          return translated;
        }

        return text;
      } catch {
        await sleep(delay);
        delay *= 2;
      }
    }

    return text;
  });
}

export async function translateObject<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  targetLang: string,
  sourceLang: string = 'en'
): Promise<T> {
  const tgt = normalizeLang(targetLang);
  const src = normalizeLang(sourceLang);
  if (tgt === src) return obj;

  const translated: any = { ...obj };
  for (const field of fields) {
    if (typeof obj[field] === 'string') {
      translated[field] = await translateText(obj[field] as string, tgt, src);
    }
  }
  return translated;
}

export async function translateArray<T extends Record<string, any>>(
  items: T[],
  fields: (keyof T)[],
  targetLang: string,
  sourceLang: string = 'en'
): Promise<T[]> {
  const tgt = normalizeLang(targetLang);
  const src = normalizeLang(sourceLang);
  if (tgt === src) return items;

  // ✅ sequential to avoid burst
  const results: T[] = [];
  for (const item of items) {
    results.push(await translateObject(item, fields, tgt, src));
  }
  return results;
}

export function clearTranslationCache() {
  TRANSLATION_CACHE.clear();
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {}
}
