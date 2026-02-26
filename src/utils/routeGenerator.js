/**
 * NomadWise AI — Route Generator
 *
 * Generates a day-by-day travel plan based on user preferences.
 * This is a mock/local generator for Step 1.
 * In production, this will be replaced by an AI API call (Claude/GPT).
 *
 * Logic:
 *   - Accommodation type  → determines POI priorities
 *   - Budget tier         → determines cost class of recommendations
 *   - Interests           → filters activity suggestions
 *   - Days                → controls timeline depth
 */

// ─── Data Pools ──────────────────────────────────────────────────────────────

const POI_POOLS = {
  caravan: {
    ekonomik: [
      { time: '08:00', title: 'Ücretsiz Otopark & Sabah Kahvaltısı', icon: 'coffee', tag: 'Mola' },
      { time: '10:00', title: 'Doğa Parkı (Ücretsiz Giriş)', icon: 'trees', tag: 'Doğa' },
      { time: '13:00', title: 'Yerel Esnaf Lokantası', icon: 'utensils', tag: 'Yemek', cost: '₺80' },
      { time: '16:00', title: 'Su Doldurma Noktası + Kamping Alanı', icon: 'droplets', tag: 'Kamping', cost: 'Ücretsiz' },
      { time: '19:00', title: 'Ateş Başı Akşam Yemeği', icon: 'flame', tag: 'Akşam' },
    ],
    standart: [
      { time: '08:30', title: 'Sabah Jogging — Nehir Kenarı', icon: 'footprints', tag: 'Aktivite' },
      { time: '10:00', title: 'Milli Park Girişi', icon: 'mountain', tag: 'Doğa', cost: '₺120' },
      { time: '13:00', title: 'Orta Segment Restoran', icon: 'utensils', tag: 'Yemek', cost: '₺200' },
      { time: '16:00', title: 'Tesisli Karavan Parkı', icon: 'car', tag: 'Konaklama', cost: '₺350/gece' },
      { time: '20:00', title: 'Piknik & Yıldız Gözlemi', icon: 'star', tag: 'Akşam' },
    ],
    lux: [
      { time: '09:00', title: 'Glamping Check-in & Brunch', icon: 'sparkles', tag: 'Premium', cost: '₺2.500' },
      { time: '11:00', title: 'Özel Rehberli Doğa Turu', icon: 'map', tag: 'Tur', cost: '₺800' },
      { time: '14:00', title: 'Fine Dining Restoran', icon: 'wine', tag: 'Yemek', cost: '₺600' },
      { time: '17:00', title: 'Özel Plaj / Göl Alanı', icon: 'waves', tag: 'Premium' },
      { time: '20:00', title: 'Yüksek Puanlı Restoran — Akşam', icon: 'star', tag: 'Yemek', cost: '₺900' },
    ],
  },

  camping: {
    ekonomik: [
      { time: '07:00', title: 'Gün Doğumu Meditasyonu', icon: 'sunrise', tag: 'Huzur' },
      { time: '09:00', title: 'Ücretsiz Patika — Ormanlık Alan', icon: 'trees', tag: 'Doğa' },
      { time: '12:00', title: 'Kendi Malzemelerinle Öğle', icon: 'backpack', tag: 'Yemek' },
      { time: '15:00', title: 'Ücretsiz Plaj / Göl Kenarı', icon: 'waves', tag: 'Dinlenme' },
      { time: '19:00', title: 'Kamp Ateşi & Sosyal Alan', icon: 'flame', tag: 'Akşam' },
    ],
    standart: [
      { time: '08:00', title: 'Sabah Kamp Kahvaltısı', icon: 'coffee', tag: 'Sabah' },
      { time: '10:00', title: 'Trekking Rotası — Orta Zorluk', icon: 'mountain', tag: 'Aktivite' },
      { time: '13:00', title: 'Kafe Lokantası', icon: 'utensils', tag: 'Yemek', cost: '₺150' },
      { time: '16:00', title: 'Kano / Bisiklet Kiralama', icon: 'bike', tag: 'Aktivite', cost: '₺200' },
      { time: '20:00', title: 'Güzel Kamp Alanı Akşamı', icon: 'tent', tag: 'Akşam' },
    ],
    lux: [
      { time: '08:30', title: 'Glamping — Çadır Suite Kahvaltı', icon: 'sparkles', tag: 'Premium' },
      { time: '10:30', title: 'Özel Doğa Fotoğrafçılığı Turu', icon: 'camera', tag: 'Tur', cost: '₺1.200' },
      { time: '13:30', title: 'Orman İçi Özel Yemek Servisi', icon: 'wine', tag: 'Yemek', cost: '₺700' },
      { time: '16:30', title: 'Çadır Spa & Masaj', icon: 'heart', tag: 'Premium', cost: '₺1.500' },
      { time: '20:00', title: 'Semalı Gece — Açık Hava Sinema', icon: 'star', tag: 'Akşam' },
    ],
  },

  hotel: {
    ekonomik: [
      { time: '08:00', title: 'Dahili Otel Kahvaltısı', icon: 'coffee', tag: 'Sabah' },
      { time: '10:00', title: 'Şehir Yürüyüşü — Tarihi Merkez', icon: 'map-pin', tag: 'Keşif' },
      { time: '13:00', title: 'Halk Pazarı & Sokak Lezzetleri', icon: 'store', tag: 'Yemek', cost: '₺60' },
      { time: '16:00', title: 'Ücretsiz Müze', icon: 'landmark', tag: 'Kültür' },
      { time: '20:00', title: 'Mahalle Restoranı', icon: 'utensils', tag: 'Akşam', cost: '₺120' },
    ],
    standart: [
      { time: '09:00', title: 'Butik Otel Kahvaltısı', icon: 'coffee', tag: 'Sabah' },
      { time: '10:30', title: 'Rehberli Şehir Turu', icon: 'map', tag: 'Tur', cost: '₺300' },
      { time: '13:00', title: 'Şehir Merkezi Restoran', icon: 'utensils', tag: 'Yemek', cost: '₺250' },
      { time: '15:30', title: 'Müze & Galeri Ziyareti', icon: 'landmark', tag: 'Kültür', cost: '₺100' },
      { time: '20:00', title: 'Romantik Butik Restoran', icon: 'wine', tag: 'Akşam', cost: '₺400' },
    ],
    lux: [
      { time: '09:00', title: 'Lüks Otel A la Carte Kahvaltı', icon: 'sparkles', tag: 'Premium' },
      { time: '11:00', title: 'Özel VIP Şehir Turu', icon: 'car', tag: 'Premium', cost: '₺2.000' },
      { time: '13:30', title: 'Michelin Restoran / Fine Dining', icon: 'wine', tag: 'Yemek', cost: '₺1.200' },
      { time: '16:00', title: 'Özel Plaj Kulübü / SPA', icon: 'waves', tag: 'Premium', cost: '₺2.500' },
      { time: '20:30', title: 'Rooftop Akşam Yemeği — Panoramik', icon: 'star', tag: 'Akşam', cost: '₺1.500' },
    ],
  },
};

// ─── Budget cost estimates per day ─────────────────────────────────────────

const BUDGET_ESTIMATES = {
  caravan: {
    ekonomik: { fuel: 200, accommodation: 50, food: 150, total: 400 },
    standart: { fuel: 280, accommodation: 350, food: 350, total: 980 },
    lux:      { fuel: 280, accommodation: 2500, food: 2300, total: 5080 },
  },
  camping: {
    ekonomik: { fuel: 150, accommodation: 30, food: 100, total: 280 },
    standart: { fuel: 200, accommodation: 250, food: 300, total: 750 },
    lux:      { fuel: 200, accommodation: 3000, food: 2700, total: 5900 },
  },
  hotel: {
    ekonomik: { fuel: 100, accommodation: 500, food: 200, total: 800 },
    standart: { fuel: 120, accommodation: 1200, food: 700, total: 2020 },
    lux:      { fuel: 120, accommodation: 5000, food: 4200, total: 9320 },
  },
};

// ─── Interest-based activity injector ─────────────────────────────────────

const INTEREST_ACTIVITIES = {
  dogal: { title: 'Patika Yürüyüşü & Doğa Fotoğrafçılığı', icon: 'camera', tag: 'Doğa' },
  tarih: { title: 'Tarihi Kalıntılar & Antik Kent Turu', icon: 'landmark', tag: 'Kültür' },
  gastronomi: { title: 'Yerel Mutfak Workshop', icon: 'chef-hat', tag: 'Gastronomi' },
  macera: { title: 'Zipline / Rafting Aktivitesi', icon: 'zap', tag: 'Macera' },
  huzur: { title: 'Yoga & Meditasyon Seansı', icon: 'heart', tag: 'Huzur' },
};

// ─── Generator ─────────────────────────────────────────────────────────────

/**
 * @param {Object} preferences
 * @param {string} preferences.destination
 * @param {number} preferences.days
 * @param {string} preferences.accommodationType  — 'caravan' | 'camping' | 'hotel'
 * @param {string} preferences.budget             — 'ekonomik' | 'standart' | 'lux'
 * @param {string[]} preferences.interests
 * @returns {{ days: Array, totalBudget: Object, meta: Object }}
 */
export function generateRoute(preferences) {
  const {
    destination = 'Kapadokya',
    days = 3,
    accommodationType = 'caravan',
    budget = 'standart',
    interests = [],
  } = preferences;

  const pool = POI_POOLS[accommodationType]?.[budget] || POI_POOLS.caravan.standart;
  const dailyCost = BUDGET_ESTIMATES[accommodationType]?.[budget] || BUDGET_ESTIMATES.caravan.standart;

  // Build daily plan
  const dayPlans = Array.from({ length: days }, (_, i) => {
    const dayNumber = i + 1;
    const activities = [...pool];

    // Inject interest-based activity on alternate days
    if (interests.length > 0) {
      const interest = interests[i % interests.length];
      const bonus = INTEREST_ACTIVITIES[interest];
      if (bonus) {
        activities.splice(2, 0, { time: '11:30', ...bonus });
      }
    }

    return {
      day: dayNumber,
      title: `Gün ${dayNumber} — ${getDayTheme(dayNumber, accommodationType)}`,
      subtitle: getDaySubtitle(dayNumber, destination, budget),
      activities,
      estimatedCost: dailyCost.total,
    };
  });

  // Compute total trip budget
  const totalBudget = {
    fuel: dailyCost.fuel * days,
    accommodation: dailyCost.accommodation * days,
    food: dailyCost.food * days,
    total: dailyCost.total * days,
    tier: budget,
    currency: '₺',
  };

  const meta = {
    destination,
    days,
    accommodationType,
    budget,
    interests,
    generatedAt: new Date().toISOString(),
  };

  return { days: dayPlans, totalBudget, meta };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getDayTheme(dayNumber, type) {
  const themes = {
    caravan: ['Yola Çıkış & Keşif', 'Doğanın İçinde', 'Huzur & Dönüş'],
    camping: ['Doğayla Buluşma', 'Orman Günü', 'Son Gece Ateşi'],
    hotel: ['Şehre Giriş', 'Kültür & Keşif', 'Lezzet & Dinlenme'],
  };
  const list = themes[type] || themes.caravan;
  return list[(dayNumber - 1) % list.length];
}

function getDaySubtitle(dayNumber, destination, budget) {
  if (dayNumber === 1) return `${destination} serüveni başlıyor`;
  if (budget === 'lux') return 'Premium deneyimler sizi bekliyor';
  if (budget === 'ekonomik') return 'Akıllı bütçe, dolu dolu gün';
  return 'Dengeli bir gün planı';
}

// ─── Premium Feature Flags ─────────────────────────────────────────────────

export const PREMIUM_FEATURES = {
  audioGuide: {
    id: 'audio_guide',
    name: 'Sesli Rehber',
    icon: 'headphones',
    isPremium: true,
    description: 'Her rota için AI destekli sesli anlatım',
  },
  offlineMap: {
    id: 'offline_map',
    name: 'Çevrimdışı Harita',
    icon: 'map',
    isPremium: true,
    description: 'İnternetsiz ortamlarda tam harita erişimi',
  },
  aiReplan: {
    id: 'ai_replan',
    name: 'Anlık AI Replanlama',
    icon: 'refresh-cw',
    isPremium: true,
    description: 'Hava durumuna göre rotayı otomatik güncelle',
  },
};
