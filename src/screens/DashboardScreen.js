import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { generateRoute, PREMIUM_FEATURES } from '../utils/routeGenerator';
import BudgetTracker from '../components/BudgetTracker';
import DayCard from '../components/DayCard';
import AccommodationBadge from '../components/AccommodationBadge';

// ─── Accommodation label helpers ──────────────────────────────────────────────

const ACCOM_META = {
  caravan: {
    icon: '🚐',
    routeNote: 'Kamping & Su Noktaları Öncelikli',
    color: Colors.caravan,
  },
  camping: {
    icon: '⛺',
    routeNote: 'Ücretsiz Doğa Alanları Öncelikli',
    color: Colors.camping,
  },
  hotel: {
    icon: '🏨',
    routeNote: 'Şehir Merkezi & Butik Oteller Öncelikli',
    color: Colors.hotel,
  },
};

// ─── Premium Feature Teaser ───────────────────────────────────────────────────

function PremiumTeaser({ feature }) {
  return (
    <View style={pStyles.teaser}>
      <View style={pStyles.teaserLeft}>
        <Text style={pStyles.lockIcon}>🔒</Text>
        <View>
          <Text style={pStyles.featureName}>{feature.name}</Text>
          <Text style={pStyles.featureDesc}>{feature.description}</Text>
        </View>
      </View>
      <TouchableOpacity style={pStyles.unlockBtn} activeOpacity={0.85}>
        <Text style={pStyles.unlockText}>Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ emoji, label, value, color }) {
  return (
    <View style={[statStyles.card, Shadow.sm]}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={[statStyles.value, color && { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen({ navigation, route }) {
  const preferences = route?.params?.preferences || {
    destination: 'Kapadokya',
    days: 3,
    accommodationType: 'caravan',
    budget: 'standart',
    interests: [],
  };

  const [expandedDay, setExpandedDay] = useState(1);

  // Generate route plan (memoized — won't re-run unless preferences change)
  const { days: dayPlans, totalBudget, meta } = useMemo(
    () => generateRoute(preferences),
    [preferences]
  );

  const accomMeta = ACCOM_META[preferences.accommodationType] || ACCOM_META.caravan;

  const budgetLabelMap = { ekonomik: 'Ekonomik', standart: 'Standart', lux: 'Lüks' };
  const budgetLabel = budgetLabelMap[preferences.budget] || 'Standart';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Gezi Planım</Text>
          <View style={styles.topRight} />
        </View>

        {/* ── Hero Card ── */}
        <View style={[styles.heroCard, Shadow.md]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.destinationLabel}>Hedef</Text>
              <Text style={styles.destinationName}>{preferences.destination}</Text>
            </View>
            <Text style={styles.heroAccomIcon}>{accomMeta.icon}</Text>
          </View>

          <View style={styles.heroBadgeRow}>
            <AccommodationBadge type={preferences.accommodationType} size="lg" />
            <View style={styles.routeNoteBadge}>
              <Text style={styles.routeNoteText}>{accomMeta.routeNote}</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <StatCard emoji="📅" label="Gün" value={`${preferences.days}`} color={Colors.primary} />
            <StatCard emoji="💰" label="Bütçe" value={budgetLabel} color={Colors.accent} />
            <StatCard
              emoji="🏕️"
              label="Aktivite"
              value={`${dayPlans.reduce((sum, d) => sum + d.activities.length, 0)}`}
              color={Colors.secondary}
            />
          </View>
        </View>

        {/* ── Budget Tracker Widget ── */}
        <View style={styles.widgetHeader}>
          <Text style={styles.widgetTitle}>Bütçe Özeti</Text>
        </View>
        <BudgetTracker totalBudget={totalBudget} />

        {/* ── Day-by-Day Timeline ── */}
        <View style={styles.widgetHeader}>
          <Text style={styles.widgetTitle}>Günlük Plan</Text>
          <Text style={styles.widgetSubtitle}>Karta dokun, detayları gör</Text>
        </View>

        {dayPlans.map((dayPlan) => (
          <DayCard
            key={dayPlan.day}
            dayPlan={dayPlan}
            isExpanded={dayPlan.day === expandedDay}
          />
        ))}

        {/* ── Premium Features ── */}
        <View style={styles.widgetHeader}>
          <View style={styles.premiumHeaderRow}>
            <Text style={styles.widgetTitle}>Premium Özellikler</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>👑 Yükselt</Text>
            </View>
          </View>
        </View>

        <View style={[styles.premiumCard, Shadow.sm]}>
          {Object.values(PREMIUM_FEATURES).map((feat, idx, arr) => (
            <React.Fragment key={feat.id}>
              <PremiumTeaser feature={feat} />
              {idx < arr.length - 1 && <View style={styles.premiumDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Replan Button ── */}
        <TouchableOpacity
          style={[styles.replanBtn, Shadow.sm]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.replanText}>🔄 Yeni Rota Oluştur</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
  topTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  topRight: { width: 40 },

  // Hero card
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md + 4,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  destinationLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  destinationName: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroAccomIcon: {
    fontSize: 36,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  routeNoteBadge: {
    flex: 1,
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  routeNoteText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
  },
  heroDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // Widget headers
  widgetHeader: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  widgetTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  widgetSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },

  // Premium
  premiumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  premiumBadge: {
    backgroundColor: Colors.accentFaded,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  premiumBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.accentDark,
  },
  premiumCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  premiumDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
  },

  // Replan
  replanBtn: {
    marginHorizontal: Spacing.md,
    height: 52,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  replanText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
  },
});

// ─── Sub-component styles ─────────────────────────────────────────────────────

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 2,
    alignItems: 'center',
    gap: 4,
  },
  emoji: { fontSize: 20 },
  value: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
  },
});

const pStyles = StyleSheet.create({
  teaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  teaserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  lockIcon: { fontSize: 22 },
  featureName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  unlockBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  unlockText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
});
