import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import StatusBadge from './StatusBadge';
import { formatINR, formatDate } from '../utils/formatters';

export const PaymentItem = ({
  payment,
  onPress,
  onPay,
  canApprove = false,
}) => {
  const {
    stage,
    amount,
    status = 'pending',
    date,
    payment_type,
    description,
  } = payment;

  const isPaid = status === 'paid' || status === 'completed';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.stageCol}>
          <Text style={styles.stageTitle} numberOfLines={2}>
            {stage}
          </Text>
          {date ? (
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={theme.colors.textMuted}
              />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>
          ) : null}
        </View>
        <StatusBadge status={status} size="sm" />
      </View>

      {description ? (
        <Text style={styles.descText} numberOfLines={2}>
          {description}
        </Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.methodCol}>
          <Text style={styles.methodLabel}>Method</Text>
          <Text style={styles.methodValue}>
            {payment_type || 'Bank Transfer'}
          </Text>
        </View>

        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Milestone Amount</Text>
          <Text style={styles.amountValue}>{formatINR(amount)}</Text>
        </View>
      </View>

      {canApprove && !isPaid && onPay && (
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => onPay(payment)}
          activeOpacity={0.8}
        >
          <Ionicons name="card-outline" size={16} color="#ffffff" />
          <Text style={styles.payBtnText}>Pay / Release Milestone</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm + 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stageCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  stageTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  descText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  methodCol: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  methodValue: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 2,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
    gap: 8,
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
  },
});

export default PaymentItem;
