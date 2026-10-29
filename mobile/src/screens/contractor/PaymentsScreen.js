import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import PaymentItem from '../../components/PaymentItem';
import EmptyState from '../../components/EmptyState';
import { PaymentService } from '../../api';
import { formatINR } from '../../utils/formatters';
import { theme } from '../../theme';

export const PaymentsScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContractorPayments = async () => {
    try {
      const data = await PaymentService.getByProject(1);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Contractor payments fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContractorPayments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchContractorPayments();
  };

  const handleRequestPayout = () => {
    Alert.alert(
      'Request Milestone Disbursal',
      'Submit verification invoice for Phase 3: Brickwork & Plastering to builder accounts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Invoice',
          onPress: () => {
            Alert.alert(
              'Disbursal Claim Submitted',
              'Your milestone certificate has been forwarded for homeowner and builder authorization.'
            );
          },
        },
      ]
    );
  };

  const disbursedTotal = payments
    .filter((p) => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const pendingTotal = payments
    .filter((p) => p.status !== 'paid' && p.status !== 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <View style={styles.container}>
      <Header title="Contractor Payouts" subtitle="FIELD INVOICES" />

      {/* Summary Card */}
      <View style={styles.payoutCard}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardSub}>Contractor Milestone Ledger</Text>
            <Text style={styles.cardTitle}>Earnings & Escrow Claims</Text>
          </View>
          <TouchableOpacity
            style={styles.claimBtn}
            onPress={handleRequestPayout}
          >
            <Ionicons name="paper-plane" size={14} color="#ffffff" />
            <Text style={styles.claimBtnText}>Claim Disbursal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.earningsRow}>
          <View style={styles.earningBox}>
            <Text style={styles.earningLabel}>Received to Date</Text>
            <Text style={[styles.earningVal, { color: theme.colors.success }]}>
              {formatINR(disbursedTotal)}
            </Text>
          </View>
          <View style={styles.earningDivider} />
          <View style={styles.earningBox}>
            <Text style={styles.earningLabel}>Awaiting Verification</Text>
            <Text style={[styles.earningVal, { color: theme.colors.accentDark }]}>
              {formatINR(pendingTotal)}
            </Text>
          </View>
        </View>
      </View>

      {/* List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Contract Milestone Invoices</Text>
        <Text style={styles.listCount}>{payments.length} Stages</Text>
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
          renderItem={({ item }) => <PaymentItem payment={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="cash-outline"
              title="No Invoices"
              message="No milestone payouts currently available."
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
  payoutCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 2,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  claimBtnText: {
    color: '#ffffff',
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  earningBox: {
    flex: 1,
    alignItems: 'center',
  },
  earningDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.divider,
  },
  earningLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  earningVal: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    marginTop: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  listTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  listCount: {
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
