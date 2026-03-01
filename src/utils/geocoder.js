/**
 * Geocoder — Turkish city database + corridor-based route generation.
 *
 * generateRouteCities(startName, endName, count)
 *   → Returns an array of {name, lat, lng, emoji} objects for a
 *     multi-day route from start to end, passing through geographically
 *     plausible intermediate cities.
 */

// ─── City Database ────────────────────────────────────────────────────────

const CITY_DB = [
  // ── Marmara ──
  { name: 'İstanbul',       keys: ['istanbul', 'İstanbul'],         lat: 41.0082, lng: 28.9784, emoji: '🕌' },
  { name: 'Kocaeli',        keys: ['kocaeli', 'izmit'],             lat: 40.7655, lng: 29.9408, emoji: '🌉' },
  { name: 'Sakarya',        keys: ['sakarya', 'adapazarı'],         lat: 40.7731, lng: 30.3948, emoji: '🌿' },
  { name: 'Düzce',          keys: ['düzce', 'duzce'],               lat: 40.8440, lng: 31.1565, emoji: '🌲' },
  { name: 'Bolu',           keys: ['bolu'],                         lat: 40.7395, lng: 31.6061, emoji: '🌲' },
  { name: 'Bursa',          keys: ['bursa'],                        lat: 40.1885, lng: 29.0610, emoji: '⛷️' },
  { name: 'Yalova',         keys: ['yalova'],                       lat: 40.6550, lng: 29.2747, emoji: '🌊' },
  { name: 'Balıkesir',      keys: ['balıkesir', 'balikesir'],       lat: 39.6484, lng: 27.8826, emoji: '🏔️' },
  { name: 'Çanakkale',      keys: ['çanakkale', 'canakkale'],       lat: 40.1553, lng: 26.4142, emoji: '⚓' },
  { name: 'Edirne',         keys: ['edirne'],                       lat: 41.6771, lng: 26.5557, emoji: '🕌' },
  { name: 'Tekirdağ',       keys: ['tekirdağ', 'tekirdag'],         lat: 40.9780, lng: 27.5152, emoji: '🌿' },

  // ── Ege ──
  { name: 'İzmir',          keys: ['izmir', 'İzmir'],               lat: 38.4192, lng: 27.1287, emoji: '🏙️' },
  { name: 'Manisa',         keys: ['manisa'],                       lat: 38.6191, lng: 27.4289, emoji: '🏛️' },
  { name: 'Aydın',          keys: ['aydın', 'aydin', 'kuşadası', 'kusadasi', 'didim'], lat: 37.8560, lng: 27.8416, emoji: '🏛️' },
  { name: 'Muğla',          keys: ['muğla', 'mugla'],               lat: 37.2154, lng: 28.3636, emoji: '🏖️' },
  { name: 'Bodrum',         keys: ['bodrum'],                       lat: 37.0344, lng: 27.4305, emoji: '🏖️' },
  { name: 'Marmaris',       keys: ['marmaris'],                     lat: 36.8556, lng: 28.2844, emoji: '⛵' },
  { name: 'Fethiye',        keys: ['fethiye'],                      lat: 36.6562, lng: 29.1228, emoji: '🏝️' },
  { name: 'Göcek',          keys: ['göcek', 'gocek'],               lat: 36.7523, lng: 28.9272, emoji: '⛵' },
  { name: 'Denizli',        keys: ['denizli', 'pamukkale'],         lat: 37.7765, lng: 29.0864, emoji: '🌊' },
  { name: 'Kütahya',        keys: ['kütahya', 'kutahya'],           lat: 39.4167, lng: 29.9833, emoji: '🏺' },
  { name: 'Afyonkarahisar', keys: ['afyon', 'afyonkarahisar'],      lat: 38.7507, lng: 30.5567, emoji: '⚫' },
  { name: 'Uşak',           keys: ['uşak', 'usak'],                 lat: 38.6823, lng: 29.4082, emoji: '🏺' },

  // ── Akdeniz ──
  { name: 'Antalya',        keys: ['antalya'],                      lat: 36.8969, lng: 30.7133, emoji: '🌊' },
  { name: 'Kaş',            keys: ['kaş', 'kas'],                   lat: 36.2017, lng: 29.6417, emoji: '🏝️' },
  { name: 'Olimpos',        keys: ['olimpos', 'olympos'],           lat: 36.3987, lng: 30.4694, emoji: '🌊' },
  { name: 'Side',           keys: ['side'],                         lat: 36.7686, lng: 31.3889, emoji: '🏛️' },
  { name: 'Alanya',         keys: ['alanya'],                       lat: 36.5436, lng: 31.9993, emoji: '🏰' },
  { name: 'Mersin',         keys: ['mersin', 'icel'],               lat: 36.8000, lng: 34.6333, emoji: '🌊' },
  { name: 'Adana',          keys: ['adana'],                        lat: 37.0000, lng: 35.3213, emoji: '🌶️' },
  { name: 'Hatay',          keys: ['hatay', 'antakya', 'iskenderun'], lat: 36.2021, lng: 36.1603, emoji: '🕌' },
  { name: 'Isparta',        keys: ['isparta'],                      lat: 37.7648, lng: 30.5566, emoji: '🌹' },
  { name: 'Burdur',         keys: ['burdur'],                       lat: 37.7267, lng: 30.2856, emoji: '🏔️' },

  // ── Karadeniz ──
  { name: 'Zonguldak',      keys: ['zonguldak', 'ereğli', 'eregli'], lat: 41.4564, lng: 31.7987, emoji: '🌊' },
  { name: 'Bartın',         keys: ['bartın', 'bartin', 'amasra'],   lat: 41.6344, lng: 32.3375, emoji: '🌊' },
  { name: 'Karabük',        keys: ['karabük', 'karabuk', 'safranbolu'], lat: 41.2003, lng: 32.6277, emoji: '🏡' },
  { name: 'Kastamonu',      keys: ['kastamonu'],                    lat: 41.3887, lng: 33.7827, emoji: '🏡' },
  { name: 'Sinop',          keys: ['sinop'],                        lat: 42.0231, lng: 35.1531, emoji: '⚓' },
  { name: 'Samsun',         keys: ['samsun'],                       lat: 41.2867, lng: 36.3300, emoji: '🌊' },
  { name: 'Ordu',           keys: ['ordu'],                         lat: 40.9862, lng: 37.8797, emoji: '🌿' },
  { name: 'Giresun',        keys: ['giresun'],                      lat: 40.9128, lng: 38.3895, emoji: '🌿' },
  { name: 'Trabzon',        keys: ['trabzon'],                      lat: 41.0027, lng: 39.7168, emoji: '🌿' },
  { name: 'Rize',           keys: ['rize'],                         lat: 41.0201, lng: 40.5234, emoji: '🍵' },
  { name: 'Artvin',         keys: ['artvin'],                       lat: 41.1828, lng: 41.8183, emoji: '🏔️' },

  // ── İç Anadolu ──
  { name: 'Ankara',         keys: ['ankara'],                       lat: 39.9334, lng: 32.8597, emoji: '🏛️' },
  { name: 'Eskişehir',      keys: ['eskişehir', 'eskisehir'],       lat: 39.7767, lng: 30.5206, emoji: '🎨' },
  { name: 'Konya',          keys: ['konya'],                        lat: 37.8713, lng: 32.4846, emoji: '🕌' },
  { name: 'Kayseri',        keys: ['kayseri'],                      lat: 38.7312, lng: 35.4787, emoji: '🏔️' },
  { name: 'Nevşehir',       keys: ['nevşehir', 'nevsehir', 'kapadok', 'cappadoc', 'göreme', 'goreme'], lat: 38.6431, lng: 34.8289, emoji: '🏜️' },
  { name: 'Sivas',          keys: ['sivas'],                        lat: 39.7477, lng: 37.0179, emoji: '🕌' },
  { name: 'Aksaray',        keys: ['aksaray'],                      lat: 38.3688, lng: 34.0370, emoji: '🏛️' },
  { name: 'Niğde',          keys: ['niğde', 'nigde'],               lat: 37.9667, lng: 34.6833, emoji: '🏔️' },
  { name: 'Karaman',        keys: ['karaman'],                      lat: 37.1759, lng: 33.2287, emoji: '🏔️' },
  { name: 'Çankırı',        keys: ['çankırı', 'cankiri'],           lat: 40.6013, lng: 33.6134, emoji: '🌿' },

  // ── Doğu Anadolu ──
  { name: 'Erzurum',        keys: ['erzurum'],                      lat: 39.9043, lng: 41.2679, emoji: '🏔️' },
  { name: 'Erzincan',       keys: ['erzincan'],                     lat: 39.7500, lng: 39.5000, emoji: '🏔️' },
  { name: 'Van',            keys: ['van'],                          lat: 38.4891, lng: 43.4089, emoji: '🏔️' },
  { name: 'Ağrı',           keys: ['ağrı', 'agri'],                 lat: 39.7191, lng: 43.0503, emoji: '🏔️' },
  { name: 'Kars',           keys: ['kars'],                         lat: 40.6013, lng: 43.0975, emoji: '🏰' },
  { name: 'Ardahan',        keys: ['ardahan'],                      lat: 41.1105, lng: 42.7022, emoji: '🏔️' },
  { name: 'Elazığ',         keys: ['elazığ', 'elazig'],             lat: 38.6748, lng: 39.2225, emoji: '🏔️' },
  { name: 'Malatya',        keys: ['malatya'],                      lat: 38.3552, lng: 38.3095, emoji: '🍑' },
  { name: 'Muş',            keys: ['muş', 'mus'],                   lat: 38.7462, lng: 41.5064, emoji: '🌿' },
  { name: 'Bitlis',         keys: ['bitlis', 'tatvan'],             lat: 38.3938, lng: 42.1232, emoji: '🏔️' },
  { name: 'Tunceli',        keys: ['tunceli', 'dersim'],            lat: 39.1079, lng: 39.5478, emoji: '🏔️' },
  { name: 'Bingöl',         keys: ['bingöl', 'bingol'],             lat: 38.8841, lng: 40.4982, emoji: '🏔️' },

  // ── Güneydoğu Anadolu ──
  { name: 'Gaziantep',      keys: ['gaziantep', 'antep'],           lat: 37.0662, lng: 37.3833, emoji: '🍽️' },
  { name: 'Şanlıurfa',      keys: ['şanlıurfa', 'sanliurfa', 'urfa'], lat: 37.1591, lng: 38.7969, emoji: '🕌' },
  { name: 'Diyarbakır',     keys: ['diyarbakır', 'diyarbakir'],     lat: 37.9144, lng: 40.2306, emoji: '🕌' },
  { name: 'Mardin',         keys: ['mardin'],                       lat: 37.3212, lng: 40.7245, emoji: '🕌' },
  { name: 'Kahramanmaraş',  keys: ['kahramanmaraş', 'maraş'],       lat: 37.5858, lng: 36.9371, emoji: '🍦' },
  { name: 'Adıyaman',       keys: ['adıyaman', 'adiyaman', 'nemrut'], lat: 37.7648, lng: 38.2786, emoji: '🏛️' },
  { name: 'Batman',         keys: ['batman'],                       lat: 37.8812, lng: 41.1351, emoji: '🏙️' },

  // ── Uluslararası ──
  { name: 'Paris',          keys: ['paris'],                        lat: 48.8566, lng: 2.3522,  emoji: '🗼' },
  { name: 'Roma',           keys: ['rom', 'rome', 'roma'],          lat: 41.9028, lng: 12.4964, emoji: '🏛️' },
  { name: 'Barselona',      keys: ['barselona', 'barcelona'],       lat: 41.3851, lng: 2.1734,  emoji: '⛵' },
  { name: 'Prag',           keys: ['prag', 'prague', 'praha'],      lat: 50.0755, lng: 14.4378, emoji: '🏰' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function findCity(query) {
  const lower = (query || '').toLowerCase().trim();
  if (!lower) return null;
  for (const city of CITY_DB) {
    if (city.keys.some((k) => lower.includes(k.toLowerCase()))) return city;
  }
  for (const city of CITY_DB) {
    if (city.name.toLowerCase().includes(lower)) return city;
  }
  return null;
}

function distDeg(a, b) {
  const dlat = a.lat - b.lat;
  const dlng = a.lng - b.lng;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

function projectionT(a, b, p) {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return 0;
  return ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / len2;
}

function perpDist(a, b, p) {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return distDeg(a, p);
  return Math.abs((p.lng - a.lng) * dy - (p.lat - a.lat) * dx) / len;
}

function _interpolateRoute(start, end, count) {
  const s = start || { name: 'Başlangıç', lat: 39.0, lng: 32.0, emoji: '📍' };
  const e = end   || { name: 'Hedef',     lat: 39.5, lng: 36.0, emoji: '📍' };
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 1 : i / (count - 1);
    if (t === 0) return s;
    if (t === 1) return e;
    return { name: `Konum ${i + 1}`, keys: [], lat: s.lat + t * (e.lat - s.lat), lng: s.lng + t * (e.lng - s.lng), emoji: '📍' };
  });
}

// ─── Public: Route City Generator ────────────────────────────────────────

/**
 * Returns `count` city stops along a route from startName to endName.
 */
export function generateRouteCities(startName, endName, count) {
  const start = findCity(startName);
  const end   = findCity(endName);

  if (!start && !end) return _interpolateRoute(null, null, count);
  if (!start)         return _interpolateRoute(end, end, count);
  if (!end)           return _interpolateRoute(start, start, count);
  if (count <= 1)     return [end];
  if (count === 2)    return [start, end];

  const totalDist = distDeg(start, end);
  const corridorW = Math.max(1.2, totalDist * 0.28);

  const corridor = CITY_DB.filter((city) => {
    if (city.name === start.name || city.name === end.name) return false;
    const t = projectionT(start, end, city);
    if (t < 0.04 || t > 0.96) return false;
    return perpDist(start, end, city) < corridorW;
  });

  corridor.sort((a, b) => projectionT(start, end, a) - projectionT(start, end, b));

  const needed   = count - 2;
  if (corridor.length === 0) return _interpolateRoute(start, end, count);

  const selected = [];
  for (let i = 0; i < needed; i++) {
    const t   = (i + 0.5) / needed;
    const idx = Math.round(t * (corridor.length - 1));
    const city = corridor[Math.min(idx, corridor.length - 1)];
    if (city && !selected.some((c) => c.name === city.name)) selected.push(city);
  }

  let result = [start, ...selected, end];

  // Fill gaps with interpolated midpoints if still short
  while (result.length < count) {
    let maxGap = 0, splitIdx = 0;
    for (let i = 0; i < result.length - 1; i++) {
      const gap = distDeg(result[i], result[i + 1]);
      if (gap > maxGap) { maxGap = gap; splitIdx = i; }
    }
    const a = result[splitIdx], b = result[splitIdx + 1];
    result.splice(splitIdx + 1, 0, {
      name: `${a.name} – ${b.name} arası`, keys: [],
      lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2, emoji: '📍',
    });
  }

  return result.slice(0, count);
}

/**
 * Returns MapView-ready waypoints for a route from startName to endName.
 */
export function generateRouteWaypoints(startName, endName, days) {
  const cities = generateRouteCities(startName, endName, days);
  return cities.map((city, i) => ({
    day: i + 1,
    name: city.name,
    emoji: city.emoji || '📍',
    coordinate: { latitude: city.lat, longitude: city.lng },
  }));
}

// ─── Legacy API ───────────────────────────────────────────────────────────

export function getDestinationCoords(destination) {
  const city = findCity(destination);
  if (city) return { lat: city.lat, lng: city.lng, emoji: city.emoji };
  return { lat: 39.0, lng: 35.0, emoji: '📍' };
}

export function generateWaypoints(destination, days) {
  const center = getDestinationCoords(destination);
  const radius = 0.06;
  return Array.from({ length: days }, (_, i) => {
    const angle = (i / Math.max(days - 1, 1)) * Math.PI * 1.5 - Math.PI * 0.25;
    return {
      day: i + 1,
      coordinate: {
        latitude:  center.lat + Math.sin(angle) * radius * (0.6 + (i % 3) * 0.2),
        longitude: center.lng + Math.cos(angle) * radius,
      },
    };
  });
}
