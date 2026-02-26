import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Radius, Shadow, Spacing, Typography } from '../constants/theme';

const TIER_CONFIG = {
  ekonomik: {
    label: 'Ekonomik',
    color: Colors.budgetEkonomik,
    bg: '#E8F5E9',
    emoji: '💚',
  },
  standart: {
    label: 'Standart',
    color: Colors.budgetStandart,
    bg: '#FFF8E1',
    emoji: '✨',
  },
  lux: {
    label: 'Lüks',
    color: Colors.budgetLux,
    bg: '#FBE9E7',
    emoji: '👑',
  },
};

function BudgetRow({ label, value, currency = '₺', color }) {
  return (
    <View style={styles.budgetRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color }]}>
        {currency}{value.toLocaleString('tr-TR')}
      </Text>
    </View>
  );
}

export default function BudgetTracker({ totalBudget }) {
  if (!totalBudget) return null;

  const { fuel, accommodation, food, total, tier = 'standart', currency = '₺' } = totalBudget;
  const config = TIER_CONFIG[tier] || TIER_CONFIG.standart;

  // Progress bar widths (relative to total)
  const fuelPct = Math.round((fuel / total) * 100);
  const accomPct = Math.round((accommodation / total) * 100);
  const foodPct = Math.round((food / total) * 100);

  return (
    <View style={[styles.container, Shadow.md]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Bütçe Takibi</Text>
          <View style={[styles.tierBadge, { backgroundColor: config.bg }]}>
            <Text style={styles.tierEmoji}>{config.emoji}</Text>
            <Text style={[styles.tierLabel, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={[styles.totalValue, { color: config.color }]}>
            {currency}{total.toLocaleString('tr-TR')}
          </Text>
        </View>
      </View>

      {/* Stacked bar */}
      <View style={styles.barContainer}>
        <View style={[styles.barSegment, {
          width: `${fuelPct}%`,
          backgroundColor: '#4A7C59',
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
        }]} />
        <View style={[styles.barSegment, {
          width: `${accomPct}%`,
          backgroundColor: config.color,
        }]} />
        <View style={[styles.barSegment, {
          width: `${foodPct}%`,
          backgroundColor: Colors.accent,
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
        }]} />
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <LegendDot color='#4A7C59' label='Yakıt' />
        <LegendDot color={config.color} label='Konaklama' />
        <LegendDot color={Colors.accent} label='Yemek' />
      </View>

      {/* Breakdown */}
      <View style={styles.breakdown}>
        <BudgetRow label='⛽ Yakıt' value={fuel} currency={currency} color='#4A7C59' />
        <View style={styles.divider} />
        <BudgetRow label='🏕️ Konaklama' value={accommodation} currency={currency} color={config.color} />
        <View style={styles.divider} />
        <BudgetRow label='🍽️ Yemek' value={food} currency={currency} color={Colors.accent} />
      </View>

      <Text style={styles.note}>* Tahmini değerlerdir, kişi başı hesaplanmıştır.</Text>
    </View>
  );
}

function LegendDot({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md + 4,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  tierEmoji: { fontSize: 12 },
  tierLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  totalBox: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.weight.medium,
  },
  totalValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
  },
  barContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  barSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  breakdown: {
    gap: 0,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
  },
  rowLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  note: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
