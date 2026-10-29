import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import StatusBadge from './StatusBadge';
import { formatINR } from '../utils/formatters';

export const MaterialItem = ({
  material,
  onPress,
  onApprove,
  onMarkDelivered,
  showActions = false,
}) => {
  const {
    name,
    quantity,
    unit = 'Units',
    rate,
    total,
    party,
    status = 'requested',
    date,
  } = material;

  const calculatedTotal = total || (quantity && rate ? quantity * rate : 0);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.infoCol}>
          <Text style={styles.materialName} numberOfLines={2}>
            {name}
          </Text>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyText}>
              {quantity} {unit}
            </Text>
            {rate ? (
              <Text style={styles.rateText}> • @ {formatINR(rate)}/{unit}</Text>
            ) : null}
          </View>
        </View>
        <StatusBadge status={status} size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.partyBadge}>
          <Ionicons
            name={party === 'homeowner' ? 'home-outline' : 'construct-outline'}
            size={12}
            color={party === 'homeowner' ? theme.colors.info : theme.colors.warning}
          />
          <Text style={styles.partyText}>
            {party === 'homeowner' ? 'Homeowner' : 'Contractor'}
          </Text>
        </View>

        <View style={styles.costCol}>
          <Text style={styles.costLabel}>Total Cost</Text>
          <Text style={styles.costValue}>{formatINR(calculatedTotal)}</Text>
        </View>
      </View>

      {showActions && (
        <View style={styles.actionsRow}>
          {status === 'requested' && onApprove && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => onApprove(material)}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
              <Text style={styles.btnTextLight}>Approve Order</Text>
            </TouchableOpacity>
          )}

          {status === 'approved' && onMarkDelivered && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deliverBtn]}
              onPress={() => onMarkDelivered(material)}
            >
              <Ionicons name="cube-outline" size={16} color="#fff" />
              <Text style={styles.btnTextLight}>Mark as Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
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
  infoCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  materialName: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  rateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  partyText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  costCol: {
    alignItems: 'flex-end',
  },
  costLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  costValue: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: theme.colors.success,
  },
  deliverBtn: {
    backgroundColor: theme.colors.info,
  },
  btnTextLight: {
    color: '#ffffff',
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
});

export default MaterialItem;
