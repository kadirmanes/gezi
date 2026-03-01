import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, GradientSets } from '../constants/colors';
import { Radius, Spacing, Typography } from '../constants/theme';

const CONFIG = {
  caravan: {
    label: 'Karavan',
    emoji: '🚐',
    color: Colors.caravan,
    bg: '#E8F5E9',
  },
  camping: {
    label: 'Çadır',
    emoji: '⛺',
    color: Colors.camping,
    bg: '#E0F2F1',
  },
  hotel: {
    label: 'Otel',
    emoji: '🏨',
    color: Colors.hotel,
    bg: '#FFF8E1',
  },
};

export default function AccommodationBadge({ type = 'caravan', size = 'md' }) {
  const config = CONFIG[type] || CONFIG.caravan;
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.color + '40' },
        isLarge && styles.badgeLarge,
      ]}
    >
      <Text style={isLarge ? styles.emojiLarge : styles.emoji}>
        {config.emoji}
      </Text>
      <Text
        style={[
          styles.label,
          { color: config.color },
          isLarge && styles.labelLarge,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeLarge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  emoji: {
    fontSize: 14,
  },
  emojiLarge: {
    fontSize: 18,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
  labelLarge: {
    fontSize: Typography.size.sm,
  },
});
