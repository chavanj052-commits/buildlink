import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import MaterialItem from '../../components/MaterialItem';
import EmptyState from '../../components/EmptyState';
import { MaterialService } from '../../api';
import { theme } from '../../theme';

const STATUS_FILTERS = ['all', 'requested', 'approved', 'delivered'];

export const MaterialsScreen = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [matName, setMatName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Bags');
  const [rate, setRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMaterials = async () => {
    try {
      const data = await MaterialService.getByProject(1);
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Contractor materials fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMaterials();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMaterials();
  };

  const handleCreateRequest = async () => {
    if (!matName.trim() || !quantity.trim()) {
      Alert.alert('Required Fields', 'Please specify material name and quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const newMat = await MaterialService.create(1, {
        name: matName.trim(),
        quantity: Number(quantity),
        unit: unit.trim() || 'Units',
        rate: rate ? Number(rate) : 0,
        party: 'contractor',
        status: 'requested',
      });

      setMaterials((prev) => [newMat, ...prev]);
      setModalVisible(false);
      setMatName('');
      setQuantity('');
      setRate('');
      Alert.alert('Request Sent', 'Material procurement request submitted to builder.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit material request.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    if (statusFilter === 'all') return true;
    return (m.status || '').toLowerCase() === statusFilter;
  });

  return (
    <View style={styles.container}>
      <Header title="Material Indents" subtitle="CONTRACTOR SUPPLY" />

      {/* Filter Tabs & Add Button Row */}
      <View style={styles.filterBar}>
        <View style={styles.filtersScroll}>
          {STATUS_FILTERS.map((f) => {
            const isSelected = statusFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setStatusFilter(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.requestBtnText}>Request</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Fetching materials...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMaterials}
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
          renderItem={({ item }) => <MaterialItem material={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="No Materials"
              message={`No material records found under "${statusFilter}".`}
              actionLabel="Request Material"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      )}

      {/* Request Material Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Site Material</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Material Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. UltraTech 53 Grade Cement"
                placeholderTextColor={theme.colors.textMuted}
                value={matName}
                onChangeText={setMatName}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 150"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Bags, Tons, Sq Ft"
                  placeholderTextColor={theme.colors.textMuted}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Est. Unit Rate (INR ₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 420"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={rate}
                onChangeText={setRate}
              />
            </View>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleCreateRequest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.modalSubmitText}>Submit Material Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  filtersScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  requestBtnText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: '#ffffff',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.md + 2,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 46,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  modalSubmitBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
});

export default MaterialsScreen;
