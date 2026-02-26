/**
 * ExpenseModal — Bottom-sheet style modal for logging a new expense.
 *
 * Props:
 *   visible    {boolean}
 *   onClose    {() => void}
 *   onAdd      {(expense) => void}
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Radius, Shadow, Spacing, Typography } from '../constants/theme';

// ─── Category options ─────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'yemek',     label: 'Yemek',     emoji: '🍽️', color: '#FF7043' },
  { id: 'ulasim',    label: 'Ulaşım',    emoji: '🚗', color: '#42A5F5' },
  { id: 'konaklama', label: 'Konaklama', emoji: '🏨', color: '#66BB6A' },
  { id: 'aktivite',  label: 'Aktivite',  emoji: '⚡', color: '#FFCA28' },
  { id: 'alisveris', label: 'Alışveriş', emoji: '🛍️', color: '#AB47BC' },
  { id: 'diger',     label: 'Diğer',     emoji: '📦', color: '#78909C' },
];

// ─── Category Button ──────────────────────────────────────────────────────

function CatBtn({ cat, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        catStyles.btn,
        { borderColor: cat.color },
        selected && { backgroundColor: cat.color },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={catStyles.emoji}>{cat.emoji}</Text>
      <Text style={[catStyles.label, selected && catStyles.labelSel]}>{cat.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function ExpenseModal({ visible, onClose, onAdd }) {
  const [categoryId, setCategoryId] = useState('yemek');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const slideY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }).start();
    } else {
      Animated.timing(slideY, { toValue: 400, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible]);

  const reset = () => {
    setCategoryId('yemek');
    setAmount('');
    setNote('');
  };

  const handleAdd = () => {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) return;
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    onAdd({
      category: categoryId,
      emoji: cat.emoji,
      label: cat.label,
      color: cat.color,
      amount: parsed,
      note: note.trim(),
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selected = CATEGORIES.find((c) => c.id === categoryId);
  const valid = parseFloat(amount.replace(',', '.')) > 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, Shadow.lg, { transform: [{ translateY: slideY }] }]}>
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>Gider Ekle</Text>

          {/* Category grid */}
          <Text style={styles.sectionLabel}>Kategori</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <CatBtn
                key={cat.id}
                cat={cat}
                selected={categoryId === cat.id}
                onPress={() => setCategoryId(cat.id)}
              />
            ))}
          </View>

          {/* Amount */}
          <Text style={styles.sectionLabel}>Tutar</Text>
          <View style={[styles.amountRow, Shadow.sm]}>
            <Text style={[styles.currency, { color: selected?.color }]}>₺</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus={visible}
              maxLength={10}
            />
          </View>

          {/* Note */}
          <TextInput
            style={styles.noteInput}
            placeholder="Not (isteğe bağlı)..."
            placeholderTextColor={Colors.textTertiary}
            value={note}
            onChangeText={setNote}
            maxLength={80}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.8}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: valid ? selected?.color || Colors.primary : Colors.border }]}
              onPress={handleAdd}
              disabled={!valid}
              activeOpacity={0.85}
            >
              <Text style={styles.addText}>Ekle {valid ? `₺${parseFloat(amount.replace(',', '.')).toFixed(2)}` : ''}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  currency: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, marginRight: 4 },
  amountInput: {
    flex: 1,
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm + 4,
  },
  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: Typography.size.base, fontWeight: Typography.weight.semibold, color: Colors.textSecondary },
  addBtn: {
    flex: 2,
    height: 52,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  addText: { fontSize: Typography.size.base, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
});

const catStyles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    backgroundColor: Colors.background,
  },
  emoji: { fontSize: 16 },
  label: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium, color: Colors.textSecondary },
  labelSel: { color: '#FFFFFF', fontWeight: Typography.weight.bold },
});
