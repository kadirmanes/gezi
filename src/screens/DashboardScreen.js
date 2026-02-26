import React, { useRef, useEffect, useState } from 'react';
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
import { PREMIUM_FEATURES } from '../utils/routeGenerator';
import BudgetTracker from '../components/BudgetTracker';
import DayCard from '../components/DayCard';
import AccommodationBadge from '../components/AccommodationBadge';
import WeatherWidget from '../components/WeatherWidget';
import ExpenseModal from '../components/ExpenseModal';
import { useTrip } from '../context/TripContext';
import { Routes } from '../navigation/AppNavigator';

// ─── Constants ────────────────────────────────────────────────────────────

const ACCOM_META = {
  caravan: { icon: '🚐', routeNote: 'Kamping & Su Noktaları Öncelikli', color: Colors.caravan },
  camping: { icon: '⛺', routeNote: 'Ücretsiz Doğa Alanları Öncelikli',  color: Colors.camping },
  hotel:   { icon: '🏨', routeNote: 'Şehir Merkezi & Butik Oteller',      color: Colors.hotel  },
};

const BUDGET_LABELS = { ekonomik: 'Ekonomik', standart: 'Standart', lux: 'Lüks' };

// ─── Sub-components ───────────────────────────────────────────────────────

function StatCard({ emoji, label, value, color }) {
  return (
    <View style={[statStyles.card, Shadow.sm]}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={[statStyles.value, color && { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function PremiumTeaser({ feature }) {
  return (
    <View style={pStyles.teaser}>
      <View style={pStyles.left}>
        <Text style={pStyles.lock}>🔒</Text>
        <View>
          <Text style={pStyles.name}>{feature.name}</Text>
          <Text style={pStyles.desc}>{feature.description}</Text>
        </View>
      </View>
      <TouchableOpacity style={pStyles.btn} activeOpacity={0.85}>
        <Text style={pStyles.btnText}>Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

function ExpenseRow({ expense, onRemove }) {
  return (
    <View style={expStyles.row}>
      <View style={[expStyles.dot, { backgroundColor: expense.color + '33' }]}>
        <Text style={expStyles.emoji}>{expense.emoji}</Text>
      </View>
      <View style={expStyles.info}>
        <Text style={expStyles.label}>{expense.label}</Text>
        {expense.note ? <Text style={expStyles.note}>{expense.note}</Text> : null}
      </View>
      <View style={expStyles.right}>
        <Text style={[expStyles.amount, { color: expense.color }]}>₺{expense.amount.toFixed(2)}</Text>
        <Text style={expStyles.time}>{expense.timestamp}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemove(expense.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={expStyles.del}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Animated section wrapper ─────────────────────────────────────────────

function FadeSlide({ children, delay = 0 }) {
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────

export default function DashboardScreen({ navigation }) {
  const { preferences, tripData, resetTrip, expenses, totalSpent, addExpense, removeExpense } = useTrip();
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);

  if (!preferences || !tripData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🧭</Text>
          <Text style={styles.emptyTitle}>Rota hazır değil</Text>
          <Text style={styles.emptySubtitle}>
            Onboarding ekranından bir seyahat planı oluştur.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate(Routes.ONBOARDING)}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>Rota Oluştur →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { days: dayPlans, totalBudget } = tripData;
  const accomMeta       = ACCOM_META[preferences.accommodationType] || ACCOM_META.caravan;
  const budgetLabel     = BUDGET_LABELS[preferences.budget] || 'Standart';
  const totalActivities = dayPlans.reduce((s, d) => s + d.activities.length, 0);
  const budgetRemain    = (totalBudget?.total || 0) - totalSpent;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <FadeSlide delay={0}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.topGreeting}>Gezi Planın 🗓️</Text>
              <Text style={styles.topDest}>{preferences.destination}</Text>
            </View>
            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate(Routes.PACKING_LIST)}
                activeOpacity={0.8}
              >
                <Text style={styles.iconBtnText}>🎒</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => { resetTrip(); navigation.navigate(Routes.ONBOARDING); }}
                activeOpacity={0.8}
              >
                <Text style={styles.iconBtnText}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeSlide>

        {/* ── Hero Card ── */}
        <FadeSlide delay={80}>
          <View style={[styles.heroCard, Shadow.md]}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.destLabel}>Hedef</Text>
                <Text style={styles.destName}>{preferences.destination}</Text>
              </View>
              <Text style={styles.heroIcon}>{accomMeta.icon}</Text>
            </View>

            <View style={styles.heroBadges}>
              <AccommodationBadge type={preferences.accommodationType} size="lg" />
              <View style={styles.routeNote}>
                <Text style={styles.routeNoteText}>{accomMeta.routeNote}</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.statsRow}>
              <StatCard emoji="📅" label="Gün"      value={`${preferences.days}`}  color={Colors.primary} />
              <StatCard emoji="💰" label="Bütçe"    value={budgetLabel}             color={Colors.accent} />
              <StatCard emoji="⚡" label="Aktivite" value={`${totalActivities}`}    color={Colors.secondary} />
            </View>
          </View>
        </FadeSlide>

        {/* ── Quick actions row ── */}
        <FadeSlide delay={140}>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: Colors.primaryFaded }]}
              onPress={() => navigation.navigate(Routes.PACKING_LIST)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickBtnEmoji}>🎒</Text>
              <Text style={[styles.quickBtnText, { color: Colors.primary }]}>Hazırlık Listesi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: Colors.secondaryFaded || '#E8F5E9' }]}
              onPress={() => setExpenseModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickBtnEmoji}>💸</Text>
              <Text style={[styles.quickBtnText, { color: Colors.secondary }]}>Gider Ekle</Text>
            </TouchableOpacity>
          </View>
        </FadeSlide>

        {/* ── Expenses section ── */}
        {expenses.length > 0 && (
          <FadeSlide delay={0}>
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetTitle}>Harcamalar 💸</Text>
              <View style={styles.widgetTitleRow}>
                <Text style={styles.widgetSub}>
                  Toplam: ₺{totalSpent.toFixed(2)}
                  {totalBudget?.total ? `  •  Kalan: ₺${budgetRemain.toFixed(2)}` : ''}
                </Text>
              </View>
            </View>
            <View style={[styles.expCard, Shadow.sm]}>
              {expenses.slice(0, 8).map((exp, idx, arr) => (
                <React.Fragment key={exp.id}>
                  <ExpenseRow expense={exp} onRemove={removeExpense} />
                  {idx < arr.length - 1 && <View style={styles.expDivider} />}
                </React.Fragment>
              ))}
              {expenses.length > 8 && (
                <Text style={styles.moreExpenses}>+{expenses.length - 8} daha fazla gider</Text>
              )}
            </View>
          </FadeSlide>
        )}

        {/* ── Weather Widget ── */}
        <FadeSlide delay={200}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetTitle}>Hava Durumu ☀️</Text>
            <Text style={styles.widgetSub}>Seyahat dönemine ait tahmin</Text>
          </View>
          <WeatherWidget destination={preferences.destination} />
        </FadeSlide>

        {/* ── Budget Tracker ── */}
        <FadeSlide delay={260}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetTitle}>Bütçe Takibi</Text>
            {totalSpent > 0 && (
              <Text style={styles.widgetSub}>₺{totalSpent.toFixed(2)} harcandı</Text>
            )}
          </View>
          <BudgetTracker totalBudget={totalBudget} spent={totalSpent} />
        </FadeSlide>

        {/* ── Timeline ── */}
        <FadeSlide delay={320}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetTitle}>Günlük Plan</Text>
            <Text style={styles.widgetSub}>Aktiviteye dokun → Detaylar</Text>
          </View>

          {dayPlans.map((dayPlan) => (
            <DayCard
              key={dayPlan.day}
              dayPlan={dayPlan}
              isExpanded={dayPlan.day === 1}
              onActivityPress={(activity) =>
                navigation.navigate(Routes.ACTIVITY_DETAIL, { activity, dayTitle: dayPlan.title })
              }
            />
          ))}
        </FadeSlide>

        {/* ── Premium Teasers ── */}
        <FadeSlide delay={380}>
          <View style={styles.widgetHeader}>
            <View style={styles.premiumRow}>
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
        </FadeSlide>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Expense Modal */}
      <ExpenseModal
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
        onAdd={addExpense}
      />

      {/* FAB — add expense */}
      <TouchableOpacity
        style={[styles.fab, Shadow.lg]}
        onPress={() => setExpenseModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+ ₺</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  emptySubtitle: { fontSize: Typography.size.base, color: Colors.textTertiary, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 4,
    ...Shadow.sm,
  },
  emptyBtnText: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: '#FFFFFF' },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  topGreeting: { fontSize: Typography.size.sm, color: Colors.textTertiary, fontWeight: Typography.weight.medium },
  topDest: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  topActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  iconBtnText: { fontSize: 18 },

  // Hero card
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md + 4,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  destLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  destName: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroIcon: { fontSize: 36 },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  routeNote: {
    flex: 1,
    backgroundColor: Colors.primaryFaded,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  routeNoteText: { fontSize: 10, color: Colors.primary, fontWeight: Typography.weight.semibold },
  heroDivider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.xl,
  },
  quickBtnEmoji: { fontSize: 18 },
  quickBtnText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold },

  // Widget header
  widgetHeader: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  widgetTitleRow: { marginTop: 2 },
  widgetTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  widgetSub: { fontSize: Typography.size.xs, color: Colors.textTertiary, marginTop: 2 },

  // Expense card
  expCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  expDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 56 },
  moreExpenses: {
    textAlign: 'center',
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    padding: Spacing.sm,
    fontStyle: 'italic',
  },

  // Premium
  premiumRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  premiumBadge: {
    backgroundColor: Colors.accentFaded,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  premiumBadgeText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, color: Colors.accentDark },
  premiumCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  premiumDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.md },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.extrabold, color: '#FFFFFF' },
});

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
  value: { fontSize: Typography.size.lg, fontWeight: Typography.weight.extrabold, color: Colors.textPrimary },
  label: { fontSize: Typography.size.xs, color: Colors.textTertiary },
});

const pStyles = StyleSheet.create({
  teaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  lock: { fontSize: 22 },
  name: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: 2 },
  desc: { fontSize: Typography.size.xs, color: Colors.textTertiary, lineHeight: 16 },
  btn: { backgroundColor: Colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  btnText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
});

const expStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  info: { flex: 1 },
  label: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: Colors.textPrimary },
  note: { fontSize: Typography.size.xs, color: Colors.textTertiary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold },
  time: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  del: { fontSize: 14, color: Colors.textTertiary, paddingLeft: Spacing.sm },
});
