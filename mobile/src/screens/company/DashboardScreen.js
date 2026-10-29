import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import ProjectCard from '../../components/ProjectCard';
import EmptyState from '../../components/EmptyState';
import ProgressBar from '../../components/ProgressBar';
import { ProjectService, DashboardService } from '../../api';
import { formatINR } from '../../utils/formatters';
import { theme } from '../../theme';

export const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
  });

  const fetchData = async () => {
    try {
      const [projectsData, statsData] = await Promise.all([
        ProjectService.getAll(),
        DashboardService.getStats(),
      ]);

      const safeProjects = Array.isArray(projectsData) ? projectsData : [];
      setProjects(safeProjects);

      // Compute statistics dynamically if needed
      const activeCount = safeProjects.filter((p) => p.status !== 'completed').length;
      const completedCount = safeProjects.filter((p) => p.status === 'completed').length;
      const totalBudget = safeProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

      setStats({
        totalProjects: safeProjects.length || statsData.totalProjects || 0,
        activeProjects: activeCount || statsData.activeProjects || 0,
        completedProjects: completedCount || statsData.completedProjects || 0,
        totalBudget: totalBudget || statsData.totalBudget || 0,
      });
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const activeProjects = projects.filter((p) => p.status !== 'completed');
  const avgProgress = activeProjects.length
    ? Math.round(
        activeProjects.reduce((sum, p) => sum + (p.progress || 50), 0) /
          activeProjects.length
      )
    : 0;

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

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
        {/* Horizontal Stats Row */}
        <View style={styles.statsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScroll}
          >
            <StatCard
              icon="business"
              iconColor="#3b82f6"
              iconBgColor="#dbeafe"
              value={stats.totalProjects}
              label="Total Sites"
              subtitle="All Managed"
            />
            <StatCard
              icon="construct"
              iconColor="#e8a838"
              iconBgColor="#fef3c7"
              value={stats.activeProjects}
              label="Active Works"
              subtitle="Under construction"
            />
            <StatCard
              icon="checkmark-done-circle"
              iconColor="#22c55e"
              iconBgColor="#dcfce7"
              value={stats.completedProjects}
              label="Completed"
              subtitle="Delivered sites"
            />
            <StatCard
              icon="wallet"
              iconColor="#8b5cf6"
              iconBgColor="#ede9fe"
              value={formatINR(stats.totalBudget)}
              label="Total Value"
              subtitle="Combined pipeline"
            />
          </ScrollView>
        </View>

        {/* Global Progress Banner */}
        <View style={styles.overallProgressCard}>
          <View style={styles.progressHeaderRow}>
            <View>
              <Text style={styles.progressCardTitle}>Active Sites Progress</Text>
              <Text style={styles.progressCardSub}>
                Weighted average completion across {stats.activeProjects} active projects
              </Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>{avgProgress}%</Text>
            </View>
          </View>
          <ProgressBar progress={avgProgress} height={10} color={theme.colors.accent} />
        </View>

        {/* Recent Projects Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProjectsTab')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All ({projects.length})</Text>
          </TouchableOpacity>
        </View>

        {projects.length === 0 ? (
          <EmptyState
            icon="construct-outline"
            title="No Projects Found"
            message="You have not created any projects yet. Tap the '+' button below to get started."
            actionLabel="Create First Project"
            onAction={() => navigation.navigate('CreateProject')}
          />
        ) : (
          projects.slice(0, 4).map((item) => (
            <ProjectCard
              key={item.id}
              project={item}
              onPress={() =>
                navigation.navigate('ProjectDetail', { projectId: item.id })
              }
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateProject')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
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
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  statsSection: {
    marginTop: theme.spacing.md,
  },
  statsScroll: {
    paddingHorizontal: theme.spacing.md,
  },
  overallProgressCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressCardTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressCardSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
    maxWidth: 240,
  },
  progressPill: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  progressPillText: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md + 2,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  viewAllText: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.floating,
  },
});

export default DashboardScreen;
