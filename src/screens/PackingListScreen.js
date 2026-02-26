/**
 * PackingListScreen — Auto-generated packing checklist.
 *
 * Items are derived from accommodation type + travel interests.
 * Users can check/uncheck items and see packed progress.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { useTrip } from '../context/TripContext';

// ─── Item database ────────────────────────────────────────────────────────

const BASE_ITEMS = [
  { id: 'id',          label: '🪪 Kimlik / Pasaport',      category: 'Temel' },
  { id: 'cash',        label: '💵 Nakit Para',              category: 'Temel' },
  { id: 'phone',       label: '📱 Telefon & Şarj Kablosu',  category: 'Temel' },
  { id: 'powerbank',   label: '🔋 Powerbank',               category: 'Temel' },
  { id: 'sunscreen',   label: '🧴 Güneş Kremi (SPF 50+)',   category: 'Sağlık' },
  { id: 'first_aid',   label: '🩹 İlk Yardım Çantası',      category: 'Sağlık' },
  { id: 'medicine',    label: '💊 Kişisel İlaçlar',          category: 'Sağlık' },
  { id: 'water_btl',   label: '💧 Su Matarası',             category: 'Temel' },
  { id: 'headphones',  label: '🎧 Kulaklık',                category: 'Teknoloji' },
];

const BY_ACCOM = {
  caravan: [
    { id: 'water_tank',    label: '🪣 Su Tankı / Kanister',     category: 'Karavan' },
    { id: 'level_blocks',  label: '🔲 Tesviye Takozları',        category: 'Karavan' },
    { id: 'elec_cable',    label: '🔌 Uzatma Kablosu (20m)',     category: 'Karavan' },
    { id: 'waste_bag',     label: '🗑️ Atık Su Torbası',          category: 'Karavan' },
    { id: 'gas_cartridge', label: '🔥 Gaz Kartuşu (x2)',         category: 'Karavan' },
    { id: 'tool_kit',      label: '🔧 Acil Tamir Seti',          category: 'Karavan' },
    { id: 'awning',        label: '⛱️ Tente / Gölgelik',         category: 'Karavan' },
  ],
  camping: [
    { id: 'tent',          label: '⛺ Çadır + Kazıklar',         category: 'Kamp' },
    { id: 'sleeping_bag',  label: '🛌 Uyku Tulumu',              category: 'Kamp' },
    { id: 'sleeping_mat',  label: '🟩 Uyku Matı',                category: 'Kamp' },
    { id: 'headlamp',      label: '🔦 Kafa Feneri + Pil',        category: 'Kamp' },
    { id: 'camp_stove',    label: '🍳 Kamp Ocağı + Tencere',     category: 'Kamp' },
    { id: 'fire_starter',  label: '🔥 Çakmak / Ateş Çakısı',    category: 'Kamp' },
    { id: 'tarp',          label: '🧊 Tarp / Yağmurluk Örtü',   category: 'Kamp' },
  ],
  hotel: [
    { id: 'luggage_lock',  label: '🔒 Bagaj Kilidi',             category: 'Otel' },
    { id: 'adapter',       label: '🔌 Seyahat Adaptörü',         category: 'Otel' },
    { id: 'toiletry_bag',  label: '🪥 Tuvalet Çantası',          category: 'Otel' },
    { id: 'eye_mask',      label: '😴 Uyku Maskesi',             category: 'Otel' },
    { id: 'slippers',      label: '🥿 Terlik',                   category: 'Otel' },
  ],
};

const BY_INTEREST = {
  fotograf: [
    { id: 'camera',     label: '📷 Kamera Gövdesi',              category: 'Fotoğraf' },
    { id: 'tripod',     label: '📐 Tripod',                      category: 'Fotoğraf' },
    { id: 'extra_batt', label: '🔋 Yedek Batarya (x2)',          category: 'Fotoğraf' },
    { id: 'nd_filter',  label: '🔲 ND Filtre Seti',              category: 'Fotoğraf' },
    { id: 'mem_card',   label: '💾 Hafıza Kartı (x2)',           category: 'Fotoğraf' },
  ],
  macera: [
    { id: 'hiking_boot', label: '🥾 Trekking Botu',             category: 'Macera' },
    { id: 'gloves',      label: '🧤 Tırmanma Eldiveni',          category: 'Macera' },
    { id: 'rope',        label: '🪢 Emniyet İpi',                category: 'Macera' },
    { id: 'map_compass', label: '🧭 Harita + Pusula',            category: 'Macera' },
    { id: 'whistle',     label: '📣 Acil Düdük',                 category: 'Macera' },
  ],
  gastronomi: [
    { id: 'food_guide',  label: '📖 Bölge Yemek Rehberi',        category: 'Gastronomi' },
    { id: 'cutlery',     label: '🍴 Taşınabilir Çatal-Kaşık',    category: 'Gastronomi' },
    { id: 'insulated',   label: '🧊 Soğutucu Çanta',             category: 'Gastronomi' },
  ],
  huzur: [
    { id: 'yoga_mat',    label: '🧘 Yoga Matı',                  category: 'Huzur' },
    { id: 'journal',     label: '📔 Günlük Defteri + Kalem',     category: 'Huzur' },
    { id: 'noise_cancel',label: '🎧 Gürültü Önleyici Kulaklık',  category: 'Huzur' },
  ],
  dogal: [
    { id: 'binoculars',  label: '🔭 Dürbün',                     category: 'Doğa' },
    { id: 'insect_rep',  label: '🦟 Böcek Kovucu Sprey',         category: 'Doğa' },
    { id: 'rain_jacket', label: '🧥 Yağmurluk / Rüzgarlık',      category: 'Doğa' },
  ],
  tarih: [
    { id: 'guidebook',   label: '📚 Rehber Kitap',               category: 'Kültür' },
    { id: 'notebook',    label: '📓 Not Defteri',                 category: 'Kültür' },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function buildItems(preferences) {
  const items = [...BASE_ITEMS];
  const accomItems = BY_ACCOM[preferences.accommodationType] || [];
  items.push(...accomItems);
  (preferences.interests || []).forEach((interest) => {
    const extra = BY_INTEREST[interest] || [];
    items.push(...extra);
  });
  return items;
}

function groupByCategory(items) {
  const map = {};
  items.forEach((item) => {
    if (!map[item.category]) map[item.category] = [];
    map[item.category].push(item);
  });
  return map;
}

// ─── CircleProgress ──────────────────────────────────────────────────────

function CircleProgress({ packed, total }) {
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
  const color = pct === 100 ? Colors.secondary : Colors.primary;
  return (
    <View style={cpStyles.wrap}>
      <View style={[cpStyles.circle, { borderColor: color }]}>
        <Text style={[cpStyles.pct, { color }]}>{pct}%</Text>
        <Text style={cpStyles.label}>hazır</Text>
      </View>
      <View>
        <Text style={cpStyles.count}>
          {packed} / {total} eşya
        </Text>
        <Text style={cpStyles.sub}>
          {pct === 100 ? '✅ Bavulun hazır!' : `${total - packed} kaldı`}
        </Text>
      </View>
    </View>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item, checked, onToggle }) {
  return (
    <TouchableOpacity
      style={rowStyles.row}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={[rowStyles.checkbox, checked && rowStyles.checkboxDone]}>
        {checked && <Text style={rowStyles.tick}>✓</Text>}
      </View>
      <Text style={[rowStyles.label, checked && rowStyles.labelDone]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────

export default function PackingListScreen({ navigation }) {
  const { preferences } = useTrip();

  const items = useMemo(() => buildItems(preferences || {}), [preferences]);
  const grouped = useMemo(() => groupByCategory(items), [items]);
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const checkAll = () => {
    const all = {};
    items.forEach((i) => (all[i.id] = true));
    setChecked(all);
  };

  const packedCount = items.filter((i) => checked[i.id]).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Hazırlık Listesi</Text>
        <TouchableOpacity style={styles.checkAllBtn} onPress={checkAll} activeOpacity={0.8}>
          <Text style={styles.checkAllText}>Tümü ✓</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <CircleProgress packed={packedCount} total={items.length} />

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(grouped).map(([category, catItems]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.catLabel}>{category}</Text>
            <View style={[styles.catCard, Shadow.sm]}>
              {catItems.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <ItemRow item={item} checked={!!checked[item.id]} onToggle={() => toggle(item.id)} />
                  {idx < catItems.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  backBtn: { minWidth: 64 },
  backText: { fontSize: Typography.size.base, color: Colors.primary, fontWeight: Typography.weight.semibold },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  checkAllBtn: {
    minWidth: 64,
    alignItems: 'flex-end',
  },
  checkAllText: { fontSize: Typography.size.sm, color: Colors.secondary, fontWeight: Typography.weight.bold },
  listContent: { padding: Spacing.md },
  section: { marginBottom: Spacing.lg },
  catLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  catCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 56 },
});

const cpStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.extrabold,
    lineHeight: 22,
  },
  label: { fontSize: 9, color: Colors.textTertiary, fontWeight: Typography.weight.medium },
  count: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  sub: { fontSize: Typography.size.sm, color: Colors.textTertiary, marginTop: 2 },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  tick: { fontSize: 14, fontWeight: Typography.weight.bold, color: '#FFF' },
  label: { fontSize: Typography.size.base, color: Colors.textPrimary, flex: 1 },
  labelDone: { color: Colors.textTertiary, textDecorationLine: 'line-through' },
});
