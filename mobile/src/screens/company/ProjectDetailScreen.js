import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import MaterialItem from '../../components/MaterialItem';
import PaymentItem from '../../components/PaymentItem';
import EmptyState from '../../components/EmptyState';
import { ProjectService, MaterialService, PaymentService } from '../../api';
import { formatINR, formatDate } from '../../utils/formatters';
import { theme } from '../../theme';

const DETAIL_TABS = ['Overview', 'Materials', 'Budget', 'Photos'];

export const ProjectDetailScreen = ({ route, navigation }) => {
  const projectId = route.params?.projectId || 1;

  const [activeTab, setActiveTab] = useState('Overview');
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [photos, setPhotos] = useState([
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600',
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [projectId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const [projData, matsData, paysData] = await Promise.all([
        ProjectService.getById(projectId),
        MaterialService.getByProject(projectId),
        PaymentService.getByProject(projectId),
      ]);
      setProject(projData);
      setMaterials(matsData);
      setPayments(paysData);
    } catch (err) {
      console.warn('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Needed',
          'Camera roll permission is required to upload site progress photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos((prev) => [result.assets[0].uri, ...prev]);
        Alert.alert('Photo Added', 'Site photo uploaded successfully.');
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message || 'Could not pick image.');
    }
  };

  const handleApproveMaterial = (mat) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === mat.id ? { ...m, status: 'approved' } : m))
    );
    Alert.alert('Order Approved', `Approved request for ${mat.name}.`);
  };

  const handleMarkDelivered = (mat) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === mat.id ? { ...m, status: 'delivered' } : m))
    );
    Alert.alert('Delivery Verified', `${mat.name} marked as delivered on site.`);
  };

  if (loading || !project) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading Project Details...</Text>
      </View>
    );
  }

  const budget = Number(project.budget) || 0;
  const spent = Number(project.spent) || Math.round(budget * ((project.progress || 50) / 100));
  const remaining = Math.max(budget - spent, 0);

  return (
    <View style={styles.container}>
      <Header
        title={project.name}
        subtitle="PROJECT DETAIL"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Segmented Detail Tabs */}
      <View style={styles.tabsContainer}>
        {DETAIL_TABS.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isSelected && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabItemText,
                  isSelected && styles.tabItemTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <View style={styles.tabContent}>
            {/* Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroTextCol}>
                  <Text style={styles.heroTitle}>{project.name}</Text>
                  {project.location ? (
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location"
                        size={14}
                        color={theme.colors.accent}
                      />
                      <Text style={styles.heroLocation}>{project.location}</Text>
                    </View>
                  ) : null}
                </View>
                <StatusBadge status={project.status || 'in_progress'} />
              </View>

              <View style={styles.divider} />

              <View style={styles.progressSection}>
                <ProgressBar
                  progress={project.progress || 60}
                  showLabel
                  color={theme.colors.accent}
                />
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaCell}>
                  <Text style={styles.cellLabel}>Total Budget</Text>
                  <Text style={styles.cellValuePrimary}>
                    {formatINR(project.budget)}
                  </Text>
                </View>
                <View style={styles.metaCell}>
                  <Text style={styles.cellLabel}>Current Phase</Text>
                  <Text style={styles.cellValue}>
                    {project.phase || 'Structural Work'}
                  </Text>
                </View>
                <View style={styles.metaCell}>
                  <Text style={styles.cellLabel}>Start Date</Text>
                  <Text style={styles.cellValue}>
                    {formatDate(project.start_date)}
                  </Text>
                </View>
                <View style={styles.metaCell}>
                  <Text style={styles.cellLabel}>Target Handover</Text>
                  <Text style={styles.cellValue}>
                    {formatDate(project.end_date)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stakeholders Card */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Assigned Stakeholders</Text>

              <View style={styles.stakeholderRow}>
                <View style={[styles.avatarCircle, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="home" size={20} color={theme.colors.info} />
                </View>
                <View style={styles.stakeholderInfo}>
                  <Text style={styles.stakeholderName}>
                    {project.homeowner_name || 'Sarah Sharma (Homeowner)'}
                  </Text>
                  <Text style={styles.stakeholderRole}>Client / Property Owner</Text>
                </View>
                <TouchableOpacity
                  style={styles.chatAction}
                  onPress={() => navigation.navigate('MessagesTab')}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={18}
                    color={theme.colors.accentDark}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.stakeholderRow}>
                <View style={[styles.avatarCircle, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="construct" size={20} color={theme.colors.warning} />
                </View>
                <View style={styles.stakeholderInfo}>
                  <Text style={styles.stakeholderName}>
                    {project.contractor_name || 'Ramesh Patel (Contractor)'}
                  </Text>
                  <Text style={styles.stakeholderRole}>Lead Site Contractor</Text>
                </View>
                <TouchableOpacity
                  style={styles.chatAction}
                  onPress={() => navigation.navigate('MessagesTab')}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={18}
                    color={theme.colors.accentDark}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Description Card */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Project Scope & Notes</Text>
              <Text style={styles.descriptionText}>
                {project.description ||
                  'Comprehensive residential construction adhering to eco-friendly building standards, premium RCC structure, Grade 53 cement, and earthquake-resistant detailing.'}
              </Text>
            </View>
          </View>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'Materials' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeaderRow}>
              <Text style={styles.cardSectionTitle}>
                Procurement & Site Materials
              </Text>
              <Text style={styles.countBadge}>{materials.length} items</Text>
            </View>

            {materials.length === 0 ? (
              <EmptyState
                icon="cube-outline"
                title="No Materials Logged"
                message="No procurement requests have been recorded for this site yet."
              />
            ) : (
              materials.map((mat) => (
                <MaterialItem
                  key={mat.id}
                  material={mat}
                  showActions
                  onApprove={handleApproveMaterial}
                  onMarkDelivered={handleMarkDelivered}
                />
              ))
            )}
          </View>
        )}

        {/* BUDGET TAB */}
        {activeTab === 'Budget' && (
          <View style={styles.tabContent}>
            {/* Financial Summary */}
            <View style={styles.budgetCardsGrid}>
              <View style={[styles.budgetBox, { borderColor: theme.colors.info }]}>
                <Text style={styles.budgetBoxLabel}>Total Contract</Text>
                <Text style={styles.budgetBoxVal}>{formatINR(budget)}</Text>
              </View>
              <View style={[styles.budgetBox, { borderColor: theme.colors.accent }]}>
                <Text style={styles.budgetBoxLabel}>Disbursed / Spent</Text>
                <Text style={[styles.budgetBoxVal, { color: theme.colors.accentDark }]}>
                  {formatINR(spent)}
                </Text>
              </View>
              <View style={[styles.budgetBox, { borderColor: theme.colors.success }]}>
                <Text style={styles.budgetBoxLabel}>Remaining</Text>
                <Text style={[styles.budgetBoxVal, { color: theme.colors.success }]}>
                  {formatINR(remaining)}
                </Text>
              </View>
            </View>

            <Text style={[styles.cardSectionTitle, { marginTop: theme.spacing.lg }]}>
              Milestone Payment Schedule
            </Text>

            {payments.length === 0 ? (
              <EmptyState
                icon="cash-outline"
                title="No Milestones Defined"
                message="Payment milestones have not been configured for this project."
              />
            ) : (
              payments.map((p) => <PaymentItem key={p.id} payment={p} />)
            )}
          </View>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'Photos' && (
          <View style={styles.tabContent}>
            <View style={styles.photoActionsRow}>
              <Text style={styles.cardSectionTitle}>Site Gallery & Logs</Text>
              <TouchableOpacity
                style={styles.addPhotoBtn}
                onPress={handlePickPhoto}
              >
                <Ionicons name="camera" size={16} color="#ffffff" />
                <Text style={styles.addPhotoText}>Upload Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.photoGrid}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri }} style={styles.photoImg} />
                  <View style={styles.photoDateOverlay}>
                    <Text style={styles.photoDateText}>Log #{index + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: theme.colors.accent,
  },
  tabItemText: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  tabContent: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTextCol: {
    flex: 1,
    marginRight: 8,
  },
  heroTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroLocation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.md,
  },
  progressSection: {
    marginBottom: theme.spacing.md,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaCell: {
    width: '47%',
  },
  cellLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  cellValuePrimary: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  cellValue: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  cardSectionTitle: {
    fontSize: theme.fontSize.sm + 2,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  stakeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stakeholderInfo: {
    flex: 1,
  },
  stakeholderName: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  stakeholderRole: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  chatAction: {
    padding: 8,
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.borderRadius.sm,
  },
  descriptionText: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  countBadge: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.accentDark,
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  budgetCardsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetBox: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderWidth: 1,
    ...theme.shadows.subtle,
  },
  budgetBoxLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  budgetBoxVal: {
    fontSize: theme.fontSize.xs + 2,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  photoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  addPhotoText: {
    color: '#ffffff',
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: '48%',
    height: 130,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoDateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 27, 45, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  photoDateText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default ProjectDetailScreen;
