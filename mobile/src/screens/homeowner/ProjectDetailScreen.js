import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import MaterialItem from '../../components/MaterialItem';
import EmptyState from '../../components/EmptyState';
import { ProjectService, MaterialService } from '../../api';
import { formatINR, formatDate } from '../../utils/formatters';
import { theme } from '../../theme';

const HOMEOWNER_TABS = ['Overview', 'Materials', 'Plans', 'Photos'];

export const ProjectDetailScreen = ({ route, navigation }) => {
  const projectId = route.params?.projectId || 1;
  const initialTab = route.params?.initialTab || 'Overview';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const [projData, matsData] = await Promise.all([
        ProjectService.getById(projectId),
        MaterialService.getByProject(projectId),
      ]);
      setProject(projData);
      setMaterials(matsData);
    } catch (err) {
      console.warn('Error loading homeowner project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !project) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading Project Details...</Text>
      </View>
    );
  }

  // Homeowner relevant materials
  const homeownerMaterials = materials.filter(
    (m) => m.party === 'homeowner' || m.party === 'client'
  );

  const budget = Number(project.budget) || 8500000;
  const progress = project.progress || 68;
  const spent = Number(project.spent) || Math.round(budget * (progress / 100));

  return (
    <View style={styles.container}>
      <Header
        title={project.name}
        subtitle="HOMEOWNER PORTAL"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Tabs Row */}
      <View style={styles.tabsContainer}>
        {HOMEOWNER_TABS.map((tab) => {
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
          <View>
            <View style={styles.card}>
              <View style={styles.titleRow}>
                <View style={styles.titleLeft}>
                  <Text style={styles.projTitle}>{project.name}</Text>
                  <Text style={styles.projLocation}>
                    <Ionicons name="location" size={13} color={theme.colors.accent} />{' '}
                    {project.location || 'Bangalore'}
                  </Text>
                </View>
                <StatusBadge status={project.status || 'in_progress'} />
              </View>

              <View style={styles.divider} />

              <Text style={styles.progressLabel}>Overall Completion</Text>
              <ProgressBar progress={progress} showLabel color={theme.colors.accent} />

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Approved Budget</Text>
                  <Text style={styles.statBoxVal}>{formatINR(budget)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Disbursed</Text>
                  <Text style={[styles.statBoxVal, { color: theme.colors.accentDark }]}>
                    {formatINR(spent)}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Contractor</Text>
                  <Text style={styles.statBoxValSmall}>
                    {project.contractor_name || 'Ramesh Patel'}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>Est. Handover</Text>
                  <Text style={styles.statBoxValSmall}>
                    {formatDate(project.end_date)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Site Specifications</Text>
              <Text style={styles.bodyText}>
                {project.description ||
                  'Your residential villa is built with top-tier structural integrity, certified river sand plastering, concealed CPVC plumbing, and custom electrical fixtures.'}
              </Text>
            </View>
          </View>
        )}

        {/* MATERIALS TAB (Homeowner-side) */}
        {activeTab === 'Materials' && (
          <View>
            <View style={styles.materialHeaderCard}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
              <View style={styles.materialHeaderTextCol}>
                <Text style={styles.matHeaderTitle}>Homeowner Materials</Text>
                <Text style={styles.matHeaderSub}>
                  Fixtures, fittings, and finishes billed directly under client scope.
                </Text>
              </View>
            </View>

            {homeownerMaterials.length === 0 ? (
              <EmptyState
                icon="cube-outline"
                title="No Client Materials"
                message="All current material procurement is managed under general contractor supply."
              />
            ) : (
              homeownerMaterials.map((mat) => (
                <MaterialItem key={mat.id} material={mat} />
              ))
            )}
          </View>
        )}

        {/* PLANS TAB */}
        {activeTab === 'Plans' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Architectural Blueprints & Plans</Text>
              <Text style={styles.bodyText}>
                Official structural drawings and municipal sanction approvals.
              </Text>

              <View style={styles.planItem}>
                <View style={[styles.planIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="document-text" size={22} color={theme.colors.info} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planTitle}>Floor_Plan_Approved_G2.pdf</Text>
                  <Text style={styles.planSize}>3.4 MB • Rev 2.1 (Architectural)</Text>
                </View>
                <Ionicons name="download-outline" size={22} color={theme.colors.accent} />
              </View>

              <View style={styles.planItem}>
                <View style={[styles.planIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="document-text" size={22} color={theme.colors.warning} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planTitle}>Electrical_Concealed_Layout.dwg</Text>
                  <Text style={styles.planSize}>5.1 MB • Engineering Blueprint</Text>
                </View>
                <Ionicons name="download-outline" size={22} color={theme.colors.accent} />
              </View>
            </View>
          </View>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'Photos' && (
          <View style={styles.photoGrid}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600',
              }}
              style={styles.gridImage}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
              }}
              style={styles.gridImage}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600',
              }}
              style={styles.gridImage}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600',
              }}
              style={styles.gridImage}
            />
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
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleLeft: {
    flex: 1,
    marginRight: 8,
  },
  projTitle: {
    fontSize: theme.fontSize.md + 2,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  projLocation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.md,
  },
  progressLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: theme.spacing.md,
  },
  statBox: {
    width: '47%',
    backgroundColor: theme.colors.inputBg,
    padding: 10,
    borderRadius: theme.borderRadius.sm,
  },
  statBoxLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  statBoxVal: {
    fontSize: theme.fontSize.sm + 2,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 2,
  },
  statBoxValSmall: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  materialHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  materialHeaderTextCol: {
    flex: 1,
  },
  matHeaderTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  matHeaderSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    marginTop: 10,
    gap: 12,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  planSize: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridImage: {
    width: '48%',
    height: 140,
    borderRadius: theme.borderRadius.sm,
  },
});

export default ProjectDetailScreen;
