/**
 * NomadWise AI — Anthropic API Route Generator
 *
 * Features:
 *  - 2-phase route generation (city list → full route)
 *  - Meal recommendations (optional, based on includeMeals pref)
 *  - 3 accommodation options per day
 *  - Free time & shopping block at 16:00
 *  - Visited places memory (excluded from prompts)
 *  - Single activity replacement
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVisitedPlaces } from '../utils/storage';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL         = 'claude-haiku-4-5-20251001';
export const API_KEY_STORAGE = 'anthropic_api_key';

// ─── API Key helpers ──────────────────────────────────────────────────────

export async function getApiKey() {
  try {
    return await AsyncStorage.getItem(API_KEY_STORAGE);
  } catch {
    return null;
  }
}

export async function saveApiKey(key) {
  await AsyncStorage.setItem(API_KEY_STORAGE, key.trim());
}

// ─── Labels ───────────────────────────────────────────────────────────────

const BUDGET_LABELS = {
  ekonomik: 'ekonomik (düşük bütçe, ücretsiz alanlar tercih edilmeli)',
  standart: 'standart (orta segment, konfor & tasarruf dengesi)',
  lux:      'lüks (premium mekanlar, fine dining, glamping)',
};

const ACCOM_LABELS = {
  caravan: 'karavan (karavan parkı, kamp alanı, elektrik & su bağlantılı)',
  camping: 'çadır kampı (doğada, ücretsiz ya da ücretli kamp alanları)',
  hotel:   'otel / pansiyon (butik otel, konakevi veya pansiyon)',
};

// ─── Prompt builder ───────────────────────────────────────────────────────

function buildPrompt(prefs) {
  const {
    startLocation, destination, startDate, endDate, days,
    accommodationType, budget, interests, includeMeals,
    selectedCities, visitedPlaces,
  } = prefs;

  const accomLabel  = ACCOM_LABELS[accommodationType] || accommodationType;
  const budgetLabel = BUDGET_LABELS[budget] || budget;
  const interestStr = (interests || []).length > 0 ? interests.join(', ') : 'genel keşif';

  const routeInstruction = selectedCities?.length
    ? `${selectedCities.join(' → ')} güzergahında ${days} günlük bir ${accomLabel} seyahati planla.`
    : `${startLocation}'dan ${destination}'a ${days} günlük bir ${accomLabel} seyahati planla.`;

  const visitedNote = visitedPlaces?.length
    ? `\nKullanıcının daha önce gördüğü ve TEKRAR ÖNERİLMEMESİ gereken yerler: ${visitedPlaces.join(', ')}`
    : '';

  const mealRules = includeMeals
    ? `YEMEK MOLALARI — ZORUNLU:
- Kahvaltı (08:30): Konaklamada kahvaltı dahil değilse gerçek bir kafe veya restoran adı öner. Tag: "Yemek".
- Öğle yemeği (12:30): Gerçek restoran adı öner. Description'a adres ve yöresel yemek önerisi ekle. Tag: "Yemek".
- Akşam yemeği (19:30): Gerçek restoran adı öner. Description'a adres ve yöresel yemek önerisi ekle. Tag: "Yemek".
- Tüm yemek aktivitelerinde cost alanına kişi başı tahmini fiyat yaz (örn. "₺150-200 kişi başı").
- address alanına mekanın kısa adresini/semtini yaz.`
    : `YEMEK MOLALARI:
- Her gün öğle (12:30) ve akşam (19:30) için tag: "Yemek" aktivite ekle. Genel öneri yeterli, gerçek restoran zorunlu değil.`;

  return `Sen Türkiye ve Avrupa'yı iyi bilen bir seyahat rehberisin.

${routeInstruction}
Tarihler: ${startDate} → ${endDate}
Bütçe: ${budgetLabel}
İlgi alanları: ${interestStr}${visitedNote}

KURALLAR:
1. Her gün FARKLI bir şehirde geç, coğrafi sıra izle.
2. Her aktivite başlığında GERÇEK mekan adı kullan.
3. Her aktivitenin "description" alanı: 1 kısa cümle (max 12 kelime).
4. Her gün 16:00'da "Serbest Zaman & Alışveriş" ekle: gerçek çarşı/pazar/AVM adı, tag: "Serbest".
5. Her gün 3 konaklama seçeneği: kamp, otel, kiralık. Sadece name+address(kısa)+cost+note.
6. Tag şunlardan biri: Kültür, Doğa, Yemek, Akşam, Aktivite, Sabah, Huzur, Keşif, Macera, Gastronomi, Premium, Serbest.
7. Günde tam 6 aktivite.
${mealRules}

SADECE JSON yanıt ver:

{"route":[{"day":1,"location":"Şehir","lat":39.9,"lng":32.8,"activities":[{"time":"09:00","title":"Mekan Adı","tag":"Kültür","cost":"Ücretsiz","description":"1 cümle bilgi.","address":"Semt (yemek için)"}],"accommodationOptions":[{"type":"kamp","name":"Kamp adı","address":"Semt","cost":"₺xx/gece","note":"Not"},{"type":"otel","name":"Otel adı","address":"Semt","cost":"₺xx/gece","note":"Not"},{"type":"kiralık","name":"Daire/mahalle","address":"Semt","cost":"₺xx/gece","note":"Not"}]}]}`;
}

// ─── JSON extractor ───────────────────────────────────────────────────────

function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text.trim()); } catch (_) {}

  // Find first { … last } block
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s === -1 || e === -1 || s >= e) throw new Error('JSON bulunamadı');
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch (parseErr) {
    throw new Error(`JSON parse hatası: ${parseErr.message.slice(0, 120)}`);
  }
}

// ─── Phase 1: generate city list (fast) ──────────────────────────────────

export async function generateCityList(preferences, apiKey, onProgress) {
  if (!apiKey) throw new Error('API_KEY_MISSING');

  onProgress?.('Güzergah şehirleri belirleniyor...');

  const { startLocation, destination, days } = preferences;
  const prompt = `${startLocation}'dan ${destination}'a ${days} günlük güzergahta her gün kalınacak şehirleri listele. Coğrafi açıdan mantıklı sırayla, ${days} şehir olsun.
SADECE şu JSON formatında yanıt ver:
{"cities": ["Şehir1", "Şehir2", "Şehir3"]}`;

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 512,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('API_KEY_INVALID');
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text || '';
  console.log('[generateCityList] raw:', text.slice(0, 200));
  try {
    const parsed = extractJSON(text);
    return Array.isArray(parsed?.cities) ? parsed.cities : [];
  } catch (parseErr) {
    console.error('[generateCityList] JSON parse failed:', parseErr.message);
    return [];
  }
}

// ─── Phase 2: full route generation (with auto-batching for long trips) ──

const BATCH_SIZE = 5; // max days per API call

export async function generateAIRoute(preferences, apiKey, onProgress) {
  if (!apiKey) throw new Error('API_KEY_MISSING');

  const visitedPlaces = await getVisitedPlaces();
  const prefs = { ...preferences, visitedPlaces };

  const cities = prefs.selectedCities;

  // Auto-batch: if more than BATCH_SIZE cities, split into multiple calls
  if (cities && cities.length > BATCH_SIZE) {
    return _generateBatched(prefs, apiKey, onProgress);
  }

  return _generateSingle(prefs, apiKey, onProgress, 0);
}

async function _callAPI(prefs, apiKey) {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 8192,
      messages:   [{ role: 'user', content: buildPrompt(prefs) }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('API_KEY_INVALID');
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const stopReason = data?.stop_reason;
  const text = data?.content?.[0]?.text || '';

  console.log('[_callAPI] stop_reason:', stopReason, '| chars:', text.length);

  if (stopReason === 'max_tokens') {
    throw new Error('AI yanıtı token limitini aştı. Seçili şehir sayısını azalt.');
  }

  let parsed;
  try {
    parsed = extractJSON(text);
  } catch (parseErr) {
    console.error('[_callAPI] extractJSON failed:', parseErr.message, '| tail:', text.slice(-80));
    throw parseErr;
  }

  if (!parsed?.route?.length) {
    console.error('[_callAPI] no route:', JSON.stringify(parsed)?.slice(0, 200));
    throw new Error('Geçersiz AI yanıtı — route alanı bulunamadı');
  }

  return parsed.route;
}

async function _generateSingle(prefs, apiKey, onProgress, dayOffset) {
  onProgress?.('Rota oluşturuluyor...');
  const route = await _callAPI(prefs, apiKey);

  // Adjust day numbers if this is a batch continuation
  if (dayOffset > 0) {
    route.forEach((d) => { d.day = d.day + dayOffset; });
  }

  return normalizeAIResponse(route, prefs);
}

async function _generateBatched(prefs, apiKey, onProgress) {
  const cities = prefs.selectedCities;
  const batches = [];
  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    batches.push(cities.slice(i, i + BATCH_SIZE));
  }

  const allDays = [];
  let dayOffset = 0;

  for (let i = 0; i < batches.length; i++) {
    onProgress?.(`Rota oluşturuluyor (${i + 1}/${batches.length})...`);
    const batchPrefs = {
      ...prefs,
      selectedCities: batches[i],
      days: batches[i].length,
    };
    const route = await _callAPI(batchPrefs, apiKey);
    route.forEach((d) => { d.day = d.day + dayOffset; });
    allDays.push(...route);
    dayOffset += batches[i].length;
  }

  return normalizeAIResponse(allDays, prefs);
}

// ─── Single activity replacement ─────────────────────────────────────────

export async function replaceActivity(dayInfo, activity, reason, preferences, apiKey) {
  if (!apiKey) throw new Error('API_KEY_MISSING');

  const { accommodationType, budget, interests } = preferences;
  const visitedPlaces = await getVisitedPlaces();

  const visitedNote = visitedPlaces.length > 0
    ? `\nDaha önce gittiği yerler (TEKRAR ÖNERMEYİN): ${visitedPlaces.join(', ')}`
    : '';

  const prompt = `Sen deneyimli bir seyahat rehberisin.

Şehir: ${dayInfo.location}
Saat: ${activity.time}
Değiştirilecek aktivite: ${activity.title} (tag: ${activity.tag})
Değiştirme sebebi: ${reason}
Konaklama tipi: ${ACCOM_LABELS[accommodationType] || accommodationType}
Bütçe: ${BUDGET_LABELS[budget] || budget}
İlgi alanları: ${(interests || []).join(', ') || 'genel'}${visitedNote}

Bu aktivite yerine AYNI şehirde, AYNI saatte farklı ve daha uygun bir aktivite öner.
SADECE şu JSON formatında yanıt ver:
{
  "time": "${activity.time}",
  "title": "Yeni aktivite başlığı",
  "tag": "Kültür",
  "cost": "₺xxx",
  "description": "2-3 cümle açıklama.",
  "address": "Mekanın adresi (isteğe bağlı)"
}`;

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 512,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text || '';
  return extractJSON(text);
}

// ─── Normalize AI response → app format ──────────────────────────────────

const BUDGET_ESTIMATES = {
  caravan: { ekonomik: 400,  standart: 980,  lux: 5080 },
  camping: { ekonomik: 280,  standart: 750,  lux: 5900 },
  hotel:   { ekonomik: 800,  standart: 2020, lux: 9320 },
};

function normalizeAIResponse(route, preferences) {
  const { days: totalDays, accommodationType = 'caravan', budget = 'standart' } = preferences;
  const dailyCost = BUDGET_ESTIMATES[accommodationType]?.[budget] || 980;

  const dayPlans = route.map((day) => ({
    day:           day.day,
    location:      day.location,
    locationEmoji: '📍',
    date:          day.date || null,
    title:         day.location,
    subtitle:      day.date || day.location,
    activities: (day.activities || []).map((act) => ({
      time:        act.time,
      title:       act.title,
      tag:         act.tag || 'Keşif',
      cost:        act.cost || null,
      description: act.description || null,
      address:     act.address || null,
    })),
    accommodationOptions: day.accommodationOptions || null,
    // backward compat: first option as default
    accommodation: day.accommodationOptions?.[0] || day.accommodation || null,
    estimatedCost: dailyCost,
    coordinate:    { latitude: day.lat || 39.0, longitude: day.lng || 35.0 },
  }));

  const totalBudget = {
    fuel:          0,
    accommodation: 0,
    food:          0,
    total:         dailyCost * totalDays,
    tier:          budget,
    currency:      '₺',
  };

  return {
    days: dayPlans,
    totalBudget,
    meta: { ...preferences, aiGenerated: true, generatedAt: new Date().toISOString() },
  };
}
