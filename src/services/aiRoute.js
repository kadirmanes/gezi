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

  return `Sen Türkiye ve Avrupa'yı çok iyi bilen deneyimli bir seyahat rehberisin.

${routeInstruction}
Tarihler: ${startDate} → ${endDate}
Bütçe: ${budgetLabel}
İlgi alanları: ${interestStr}${visitedNote}

KURALLAR:
1. Her gün FARKLI bir şehirde geç — coğrafi açıdan mantıklı güzergah izle.
2. Her aktivitenin başlığında o şehrin GERÇEK mekan adını kullan (örn. "Sümela Manastırı Turu").
3. Her aktivitenin "description" alanına o yer hakkında 2-3 cümle gerçek bilgi yaz.
4. Her gün 16:00'da "Serbest Zaman & Alışveriş" aktivitesi ekle: o şehrin gerçek çarşısı/pazarı/AVM adını kullan. Description'a yakınındaki bir kafe öner. Tag: "Serbest".
5. Her gün için 3 FARKLI konaklama seçeneği sun: biri kamp/karavan, biri otel/pansiyon, biri kiralık daire.
6. Konaklama maliyetleri bütçeye uygun olsun.
7. Aktivite "tag" değerleri şunlardan biri olsun: Kültür, Doğa, Yemek, Akşam, Aktivite, Sabah, Huzur, Keşif, Macera, Gastronomi, Premium, Serbest.
8. Her gün minimum 6, maksimum 8 aktivite olsun.
${mealRules}

SADECE aşağıdaki JSON formatında yanıt ver. Başka hiçbir şey yazma:

{
  "route": [
    {
      "day": 1,
      "location": "Şehir adı",
      "lat": 39.9334,
      "lng": 32.8597,
      "activities": [
        {
          "time": "09:00",
          "title": "Gerçek mekan adı içeren aktivite başlığı",
          "tag": "Kültür",
          "cost": "Ücretsiz",
          "description": "Bu yer hakkında 2-3 cümle gerçek bilgi.",
          "address": "Mekanın adresi veya semti (özellikle yemek için)"
        }
      ],
      "accommodationOptions": [
        {
          "type": "kamp",
          "name": "Kamp alanı veya karavan parkı adı",
          "address": "Adres veya semt",
          "cost": "₺xxx/gece",
          "facilities": "Elektrik, su, duş",
          "note": "Kısa pratik not"
        },
        {
          "type": "otel",
          "name": "Otel veya pansiyon adı",
          "address": "Adres veya semt",
          "cost": "₺xxx/gece",
          "facilities": "Kahvaltı dahil, ücretsiz Wi-Fi",
          "note": "Kısa pratik not"
        },
        {
          "type": "kiralık",
          "name": "Kiralık daire / mahalle",
          "address": "Mahalle veya semt",
          "cost": "₺xxx/gece",
          "facilities": "Mutfak, çamaşır makinesi",
          "note": "Kısa pratik not"
        }
      ]
    }
  ]
}`;
}

// ─── JSON extractor ───────────────────────────────────────────────────────

function extractJSON(text) {
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('JSON bulunamadı');
  return JSON.parse(text.slice(start, end + 1));
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
  const parsed = extractJSON(text);
  return Array.isArray(parsed?.cities) ? parsed.cities : [];
}

// ─── Phase 2: full route generation ──────────────────────────────────────

export async function generateAIRoute(preferences, apiKey, onProgress) {
  if (!apiKey) throw new Error('API_KEY_MISSING');

  onProgress?.('Yapay zeka rotanı analiz ediyor...');

  // Load visited places and inject into prompt
  const visitedPlaces = await getVisitedPlaces();
  const prefs = { ...preferences, visitedPlaces };

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

  onProgress?.('Şehirler ve mekanlar seçiliyor...');

  const data = await response.json();
  const text = data?.content?.[0]?.text || '';

  onProgress?.('Konaklama alternatifleri oluşturuluyor...');

  const parsed = extractJSON(text);
  if (!parsed?.route?.length) throw new Error('Geçersiz AI yanıtı');

  return normalizeAIResponse(parsed.route, preferences);
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
