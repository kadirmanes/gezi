/**
 * NomadWise AI — Route Generator
 *
 * Each day is in a DIFFERENT city along the route startLocation → destination.
 * Days are anchored to actual calendar dates from preferences.
 */

import { generateRouteCities } from './geocoder';

// ─── Activity Pools ───────────────────────────────────────────────────────

const POI_POOLS = {
  caravan: {
    ekonomik: [
      { time: '08:00', title: 'Ücretsiz Otopark & Sabah Kahvaltısı', tag: 'Mola' },
      { time: '10:00', title: 'Doğa Parkı (Ücretsiz Giriş)', tag: 'Doğa' },
      { time: '13:00', title: 'Yerel Esnaf Lokantası', tag: 'Yemek', cost: '₺80' },
      { time: '16:00', title: 'Su Doldurma Noktası + Kamping Alanı', tag: 'Kamping', cost: 'Ücretsiz' },
      { time: '19:00', title: 'Ateş Başı Akşam Yemeği', tag: 'Akşam' },
    ],
    standart: [
      { time: '08:30', title: 'Sabah Jogging — Nehir Kenarı', tag: 'Aktivite' },
      { time: '10:00', title: 'Milli Park Girişi', tag: 'Doğa', cost: '₺120' },
      { time: '13:00', title: 'Orta Segment Restoran', tag: 'Yemek', cost: '₺200' },
      { time: '16:00', title: 'Tesisli Karavan Parkı', tag: 'Konaklama', cost: '₺350/gece' },
      { time: '20:00', title: 'Piknik & Yıldız Gözlemi', tag: 'Akşam' },
    ],
    lux: [
      { time: '09:00', title: 'Glamping Check-in & Brunch', tag: 'Premium', cost: '₺2.500' },
      { time: '11:00', title: 'Özel Rehberli Doğa Turu', tag: 'Tur', cost: '₺800' },
      { time: '14:00', title: 'Fine Dining Restoran', tag: 'Yemek', cost: '₺600' },
      { time: '17:00', title: 'Özel Plaj / Göl Alanı', tag: 'Premium' },
      { time: '20:00', title: 'Yüksek Puanlı Restoran — Akşam', tag: 'Yemek', cost: '₺900' },
    ],
  },
  camping: {
    ekonomik: [
      { time: '07:00', title: 'Gün Doğumu Meditasyonu', tag: 'Huzur' },
      { time: '09:00', title: 'Ücretsiz Patika — Ormanlık Alan', tag: 'Doğa' },
      { time: '12:00', title: 'Kendi Malzemelerinle Öğle', tag: 'Yemek' },
      { time: '15:00', title: 'Ücretsiz Plaj / Göl Kenarı', tag: 'Doğa' },
      { time: '19:00', title: 'Kamp Ateşi & Sosyal Alan', tag: 'Akşam' },
    ],
    standart: [
      { time: '08:00', title: 'Sabah Kamp Kahvaltısı', tag: 'Sabah' },
      { time: '10:00', title: 'Trekking Rotası — Orta Zorluk', tag: 'Aktivite' },
      { time: '13:00', title: 'Kafe Lokantası', tag: 'Yemek', cost: '₺150' },
      { time: '16:00', title: 'Kano / Bisiklet Kiralama', tag: 'Aktivite', cost: '₺200' },
      { time: '20:00', title: 'Güzel Kamp Alanı Akşamı', tag: 'Akşam' },
    ],
    lux: [
      { time: '08:30', title: 'Glamping Çadır Suite Kahvaltı', tag: 'Premium' },
      { time: '10:30', title: 'Özel Doğa Fotoğrafçılığı Turu', tag: 'Tur', cost: '₺1.200' },
      { time: '13:30', title: 'Orman İçi Özel Yemek Servisi', tag: 'Yemek', cost: '₺700' },
      { time: '16:30', title: 'Çadır Spa & Masaj', tag: 'Premium', cost: '₺1.500' },
      { time: '20:00', title: 'Açık Hava Sinema Gecesi', tag: 'Akşam' },
    ],
  },
  hotel: {
    ekonomik: [
      { time: '08:00', title: 'Dahili Otel Kahvaltısı', tag: 'Sabah' },
      { time: '10:00', title: 'Şehir Yürüyüşü — Tarihi Merkez', tag: 'Keşif' },
      { time: '13:00', title: 'Halk Pazarı & Sokak Lezzetleri', tag: 'Yemek', cost: '₺60' },
      { time: '16:00', title: 'Ücretsiz Müze', tag: 'Kültür' },
      { time: '20:00', title: 'Mahalle Restoranı', tag: 'Akşam', cost: '₺120' },
    ],
    standart: [
      { time: '09:00', title: 'Butik Otel Kahvaltısı', tag: 'Sabah' },
      { time: '10:30', title: 'Rehberli Şehir Turu', tag: 'Tur', cost: '₺300' },
      { time: '13:00', title: 'Şehir Merkezi Restoran', tag: 'Yemek', cost: '₺250' },
      { time: '15:30', title: 'Müze & Galeri Ziyareti', tag: 'Kültür', cost: '₺100' },
      { time: '20:00', title: 'Romantik Butik Restoran', tag: 'Akşam', cost: '₺400' },
    ],
    lux: [
      { time: '09:00', title: 'Lüks Otel A la Carte Kahvaltı', tag: 'Premium' },
      { time: '11:00', title: 'Özel VIP Şehir Turu', tag: 'Premium', cost: '₺2.000' },
      { time: '13:30', title: 'Fine Dining Restoran', tag: 'Yemek', cost: '₺1.200' },
      { time: '16:00', title: 'Özel Plaj Kulübü / SPA', tag: 'Premium', cost: '₺2.500' },
      { time: '20:30', title: 'Rooftop Akşam Yemeği — Panoramik', tag: 'Akşam', cost: '₺1.500' },
    ],
  },
};

const BUDGET_ESTIMATES = {
  caravan: {
    ekonomik: { fuel: 200, accommodation: 50,   food: 150,  total: 400  },
    standart: { fuel: 280, accommodation: 350,  food: 350,  total: 980  },
    lux:      { fuel: 280, accommodation: 2500, food: 2300, total: 5080 },
  },
  camping: {
    ekonomik: { fuel: 150, accommodation: 30,   food: 100,  total: 280  },
    standart: { fuel: 200, accommodation: 250,  food: 300,  total: 750  },
    lux:      { fuel: 200, accommodation: 3000, food: 2700, total: 5900 },
  },
  hotel: {
    ekonomik: { fuel: 100, accommodation: 500,  food: 200,  total: 800  },
    standart: { fuel: 120, accommodation: 1200, food: 700,  total: 2020 },
    lux:      { fuel: 120, accommodation: 5000, food: 4200, total: 9320 },
  },
};

const INTEREST_ACTIVITIES = {
  dogal:      { title: 'Patika Yürüyüşü & Doğa Fotoğrafçılığı', tag: 'Doğa' },
  tarih:      { title: 'Tarihi Kalıntılar & Antik Kent Turu',    tag: 'Kültür' },
  gastronomi: { title: 'Yerel Mutfak Workshop',                   tag: 'Gastronomi' },
  macera:     { title: 'Zipline / Rafting Aktivitesi',            tag: 'Macera' },
  huzur:      { title: 'Yoga & Meditasyon Seansı',                tag: 'Huzur' },
};

// ─── Date Helpers ─────────────────────────────────────────────────────────

const TR_MONTHS    = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TR_DAYS_SHORT = ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];

function formatTurkishDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]}`;
}

function addDays(dateInput, n) {
  const d = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  d.setDate(d.getDate() + n);
  return d;
}

function getDayOfWeekTR(date) {
  const d = date instanceof Date ? date : new Date(date);
  return TR_DAYS_SHORT[(d.getDay() + 6) % 7];
}

// ─── Main Generator ───────────────────────────────────────────────────────

/**
 * @param {Object} preferences
 * @param {string} preferences.startLocation    — trip departure city
 * @param {string} preferences.destination      — trip end city
 * @param {string} [preferences.startDate]      — ISO 'YYYY-MM-DD'
 * @param {string} [preferences.endDate]        — ISO 'YYYY-MM-DD'
 * @param {number} preferences.days             — total days (derived from dates)
 * @param {string} preferences.accommodationType
 * @param {string} preferences.budget
 * @param {string[]} preferences.interests
 */
export function generateRoute(preferences) {
  const {
    startLocation     = 'İstanbul',
    destination       = 'Kapadokya',
    startDate,
    days              = 3,
    accommodationType = 'caravan',
    budget            = 'standart',
    interests         = [],
  } = preferences;

  const pool      = POI_POOLS[accommodationType]?.[budget] || POI_POOLS.caravan.standart;
  const dailyCost = BUDGET_ESTIMATES[accommodationType]?.[budget] || BUDGET_ESTIMATES.caravan.standart;

  // Corridor-based city stops from startLocation → destination
  const routeCities = generateRouteCities(startLocation, destination, days);

  const dayPlans = routeCities.map((city, i) => {
    const date       = startDate ? addDays(startDate, i) : null;
    const dateLabel  = date ? formatTurkishDate(date) : null;
    const dayOfWeek  = date ? getDayOfWeekTR(date) : null;

    // Activities pool + interest injection
    const activities = pool.map((act) => ({ ...act }));
    if (interests.length > 0) {
      const interest = interests[i % interests.length];
      const bonus    = INTEREST_ACTIVITIES[interest];
      if (bonus) activities.splice(2, 0, { time: '11:30', ...bonus });
    }

    const contextParts = [
      dayOfWeek && dateLabel ? `${dayOfWeek}, ${dateLabel}` : null,
      i === 0                 ? 'Yolculuk başlıyor'          : null,
      i === routeCities.length - 1 ? 'Son durak'             : null,
    ].filter(Boolean);

    return {
      day:           i + 1,
      location:      city.name,
      locationEmoji: city.emoji || '📍',
      date:          dateLabel,
      title:         city.name,
      subtitle:      contextParts.join(' • ') || city.name,
      activities,
      estimatedCost: dailyCost.total,
      coordinate:    { latitude: city.lat, longitude: city.lng },
    };
  });

  const totalBudget = {
    fuel:          dailyCost.fuel          * days,
    accommodation: dailyCost.accommodation * days,
    food:          dailyCost.food          * days,
    total:         dailyCost.total         * days,
    tier:          budget,
    currency:      '₺',
  };

  return {
    days: dayPlans,
    totalBudget,
    meta: { startLocation, destination, days, startDate, accommodationType, budget, interests, generatedAt: new Date().toISOString() },
  };
}

// ─── Premium Feature Flags ────────────────────────────────────────────────

export const PREMIUM_FEATURES = {
  audioGuide: { id: 'audio_guide', name: 'Sesli Rehber',          isPremium: true, description: 'Her rota için AI destekli sesli anlatım' },
  offlineMap: { id: 'offline_map', name: 'Çevrimdışı Harita',     isPremium: true, description: 'İnternetsiz ortamlarda tam harita erişimi' },
  aiReplan:   { id: 'ai_replan',   name: 'Anlık AI Replanlama',   isPremium: true, description: 'Hava durumuna göre rotayı otomatik güncelle' },
};
