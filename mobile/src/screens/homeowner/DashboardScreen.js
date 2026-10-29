import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { ProjectService } from '../../api';
import { formatINR } from '../../utils/formatters';
import { theme } from '../../theme';

const PHASES = [
  { name: 'Foundation', status: 'completed' },
  { name: 'RCC Framing', status: 'completed' },
  { name: 'Brickwork & Walls', status: 'in_progress' },
  { name: 'Flooring & Electrical', status: 'pending' },
  { name: 'Painting & Handover', status: 'pending' },
];

export const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState(null);

  const fetchHomeownerData = async () => {
    try {
      const projects = await ProjectService.getAll();
      if (Array.isArray(projects) && projects.length > 0) {
        setProject(projects[0]);
      }
    } catch (err) {
      console.warn('Homeowner dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHomeownerData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeownerData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading Your Dream Home...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Header />
        <EmptyState
          icon="home-outline"
          title="No Project Assigned"
          message="Your builder has not yet assigned a construction project to your account."
        />
      </View>
    );
  }

  const budget = Number(project.budget) || 8500000;
  const progress = project.progress || 68;
  const spent = Number(project.spent) || Math.round(budget * (progress / 100));
  const remaining = Math.max(budget - spent, 0);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
      >
        {/* Project Hero Card */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() =>
            navigation.navigate('ProjectDetail', { projectId: project.id })
          }
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadgeRow}>
              <StatusBadge status={project.status || 'in_progress'} />
              <View style={styles.tagPill}>
                <Ionicons name="location" size={12} color="#ffffff" />
                <Text style={styles.tagPillText}>
                  {project.location || 'Bangalore'}
                </Text>
              </View>
            </View>

            <View style={styles.heroBottomContent}>
              <Text style={styles.heroTitle}>{project.name}</Text>
              <Text style={styles.heroSub}>
                Contractor: {project.contractor_name || 'Ramesh Patel'}
              </Text>

              <View style={styles.heroProgress}>
                <ProgressBar
                  progress={progress}
                  showLabel
                  color={theme.colors.accent}
                  trackColor="rgba(255, 255, 255, 0.3)"
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Budget Cards Row */}
        <View style={styles.budgetRow}>
          <View style={[styles.budgetCard, { borderTopColor: theme.colors.primary }]}>
            <Text style={styles.budgetCardLabel}>Total Budget</Text>
            <Text style={styles.budgetCardVal}>{formatINR(budget)}</Text>
            <Text style={styles.budgetCardSub}>Approved Plan</Text>
          </View>

          <View style={[styles.budgetCard, { borderTopColor: theme.colors.accent }]}>
            <Text style={styles.budgetCardLabel}>Amount Spent</Text>
            <Text style={[styles.budgetCardVal, { color: theme.colors.accentDark }]}>
              {formatINR(spent)}
            </Text>
            <Text style={styles.budgetCardSub}>Through Milestones</Text>
          </View>

          <View style={[styles.budgetCard, { borderTopColor: theme.colors.success }]}>
            <Text style={styles.budgetCardLabel}>Remaining</Text>
            <Text style={[styles.budgetCardVal, { color: theme.colors.success }]}>
              {formatINR(remaining)}
            </Text>
            <Text style={styles.budgetCardSub}>Balance Funds</Text>
          </View>
        </View>

        {/* Construction Phase Progress */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Construction Roadmap</Text>
            <Text style={styles.activePhaseTag}>Phase 3 of 5</Text>
          </View>

          <View style={styles.phasesList}>
            {PHASES.map((p, idx) => {
              const isDone = p.status === 'completed';
              const isCurrent = p.status === 'in_progress';

              return (
                <View key={idx} style={styles.phaseItem}>
                  <View style={styles.phaseIconCol}>
                    <View
                      style={[
                        styles.phaseDot,
                        isDone && styles.phaseDotDone,
                        isCurrent && styles.phaseDotCurrent,
                      ]}
                    >
                      <Ionicons
                        name={
                          isDone
                            ? 'checkmark'
                            : isCurrent
                            ? 'hammer'
                            : 'ellipse-outline'
                        }
                        size={12}
                        color={isDone || isCurrent ? '#ffffff' : theme.colors.textMuted}
                      />
                    </View>
                    {idx < PHASES.length - 1 && (
                      <View
                        style={[
                          styles.phaseLine,
                          isDone && styles.phaseLineDone,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.phaseDetailsCol}>
                    <Text
                      style={[
                        styles.phaseName,
                        isCurrent && styles.phaseNameCurrent,
                      ]}
                    >
                      {p.name}
                    </Text>
                    <Text style={styles.phaseStatusText}>
                      {isDone
                        ? 'Inspection Passed'
                        : isCurrent
                        ? 'Currently In Progress'
                        : 'Upcoming Milestone'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('PaymentsTab')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="card" size={20} color={theme.colors.success} />
            </View>
            <Text style={styles.quickTitle}>Milestone Payments</Text>
            <Text style={styles.quickSub}>Release funds safely</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('MessagesTab')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#fef3c7' }]}>
              <Ionicons
                name="chatbubbles"
                size={20}
                color={theme.colors.accentDark}
              />
            </View>
            <Text style={styles.quickTitle}>Chat with Builder</Text>
            <Text style={styles.quickSub}>Direct communication</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Site Photos */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Site Photos</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ProjectDetail', {
                  projectId: project.id,
                  initialTab: 'Photos',
                })
              }
            >
              <Text style={styles.viewMoreText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photosRow}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=400',
              }}
              style={styles.thumbnailPhoto}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
              }}
              style={styles.thumbnailPhoto}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400',
              }}
              style={styles.thumbnailPhoto}
            />
          </View>
        </View>
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
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  heroCard: {
    height: 220,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 27, 45, 0.65)',
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  tagPillText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  heroBottomContent: {
    width: '100%',
  },
  heroTitle: {
    fontSize: theme.fontSize.lg + 2,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  heroSub: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  heroProgress: {
    marginTop: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  budgetCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: 10,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  budgetCardLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  budgetCardVal: {
    fontSize: theme.fontSize.xs + 2,
    fontWeight: '800',
    color: theme.colors.primary,
    marginVertical: 4,
  },
  budgetCardSub: {
    fontSize: 9,
    color: theme.colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm + 2,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  activePhaseTag: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentDark,
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  phasesList: {
    paddingLeft: 4,
  },
  phaseItem: {
    flexDirection: 'row',
    minHeight: 46,
  },
  phaseIconCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  phaseDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseDotDone: {
    backgroundColor: theme.colors.success,
  },
  phaseDotCurrent: {
    backgroundColor: theme.colors.accent,
  },
  phaseLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
  phaseLineDone: {
    backgroundColor: theme.colors.success,
  },
  phaseDetailsCol: {
    flex: 1,
    paddingBottom: 12,
  },
  phaseName: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  phaseNameCurrent: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  phaseStatusText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  quickIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  quickSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  viewMoreText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbnailPhoto: {
    flex: 1,
    height: 80,
    borderRadius: theme.borderRadius.sm,
  },
});

export default DashboardScreen;
