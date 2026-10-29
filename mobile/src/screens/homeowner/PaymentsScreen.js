import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import PaymentItem from '../../components/PaymentItem';
import ProgressBar from '../../components/ProgressBar';
import EmptyState from '../../components/EmptyState';
import { PaymentService } from '../../api';
import { formatINR } from '../../utils/formatters';
import { theme } from '../../theme';

export const PaymentsScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    try {
      const data = await PaymentService.getByProject(1);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Payments fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handlePayMilestone = (item) => {
    Alert.alert(
      'Release Milestone Payment',
      `Authorize payment of ${formatINR(item.amount)} for "${item.stage}"? This will transfer funds to the verified contractor escrow.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Pay',
          onPress: () => {
            setPayments((prev) =>
              prev.map((p) =>
                p.id === item.id ? { ...p, status: 'paid' } : p
              )
            );
            Alert.alert(
              'Payment Released!',
              `Milestone of ${formatINR(item.amount)} successfully paid to contractor.`
            );
          },
        },
      ]
    );
  };

  const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const paidAmount = payments
    .filter((p) => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingAmount = Math.max(totalAmount - paidAmount, 0);
  const paidPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <View style={styles.container}>
      <Header title="Payment Escrow" subtitle="HOMEOWNER PORTAL" />

      {/* Financial Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryTitle}>Escrow Payment Progress</Text>
            <Text style={styles.summarySubtitle}>
              Total Contract: {formatINR(totalAmount)}
            </Text>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{paidPercent}% Paid</Text>
          </View>
        </View>

        <ProgressBar
          progress={paidPercent}
          color={theme.colors.success}
          height={8}
        />

        <View style={styles.amountsRow}>
          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>Total Disbursed</Text>
            <Text style={[styles.amountValue, { color: theme.colors.success }]}>
              {formatINR(paidAmount)}
            </Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>Pending Balance</Text>
            <Text style={[styles.amountValue, { color: theme.colors.warning }]}>
              {formatINR(pendingAmount)}
            </Text>
          </View>
        </View>
      </View>

      {/* Milestone Stages List */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderTitle}>Construction Milestone Stages</Text>
        <Text style={styles.countText}>{payments.length} Milestones</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Fetching payment milestones...</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.accent]}
              tintColor={theme.colors.accent}
            />
          }
          renderItem={({ item }) => (
            <PaymentItem
              payment={item}
              canApprove
              onPay={handlePayMilestone}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="card-outline"
              title="No Payment Stages"
              message="No milestone payments configured for this site yet."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  summarySubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  percentText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '800',
    color: theme.colors.success,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
  },
  amountDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.divider,
  },
  amountLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    marginTop: 2,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  listHeaderTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  countText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default PaymentsScreen;
