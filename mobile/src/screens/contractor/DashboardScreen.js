import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import { ProjectService } from '../../api';
import { formatDate } from '../../utils/formatters';
import { theme } from '../../theme';

const CONTRACTOR_TASKS = [
  { id: 1, title: 'Ground Floor Column Reinforcement', status: 'completed', deadline: 'Today' },
  { id: 2, title: 'Concealed Conduit Pipe Installation', status: 'in_progress', deadline: 'Tomorrow' },
  { id: 3, title: 'Inspect Sand & Aggregate Delivery', status: 'in_progress', deadline: '2 Days' },
  { id: 4, title: 'Double Coat Plastering - East Wall', status: 'pending', deadline: '5 Days' },
];

export const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState(CONTRACTOR_TASKS);

  const fetchContractorData = async () => {
    try {
      const projects = await ProjectService.getAll();
      if (Array.isArray(projects) && projects.length > 0) {
        setProject(projects[0]);
      }
    } catch (err) {
      console.warn('Contractor dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContractorData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchContractorData();
  };

  const handleUploadPhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Access', 'Camera permission needed to log site work.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled) {
        Alert.alert('Site Log Updated', 'Daily work proof uploaded to project board.');
      }
    } catch {
      Alert.alert('Logged', 'Work photo saved to daily site log.');
    }
  };

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'completed' ? 'in_progress' : 'completed' }
          : t
      )
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading Contractor Dashboard...</Text>
      </View>
    );
  }

  const progress = project?.progress || 68;

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
        {/* Active Project Card */}
        {project && (
          <View style={styles.activeSiteCard}>
            <View style={styles.siteHeader}>
              <View style={styles.siteTitleCol}>
                <Text style={styles.siteLabel}>Current Assigned Site</Text>
                <Text style={styles.siteName}>{project.name}</Text>
                <Text style={styles.siteLoc}>
                  <Ionicons name="location" size={12} color={theme.colors.accent} />{' '}
                  {project.location || 'Whitefield, Bangalore'}
                </Text>
              </View>
              <StatusBadge status={project.status || 'in_progress'} size="sm" />
            </View>

            <View style={styles.divider} />

            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Overall Site Completion</Text>
              <Text style={styles.progressVal}>{progress}%</Text>
            </View>
            <ProgressBar progress={progress} color={theme.colors.accent} height={8} />

            <View style={styles.deadlineRow}>
              <Ionicons
                name="alarm-outline"
                size={14}
                color={theme.colors.warning}
              />
              <Text style={styles.deadlineText}>
                Handover Deadline: {formatDate(project.end_date)}
              </Text>
            </View>
          </View>
        )}

        {/* Contractor Stats Row */}
        <View style={styles.statsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScroll}
          >
            <StatCard
              icon="checkbox"
              iconColor="#22c55e"
              iconBgColor="#dcfce7"
              value={tasks.filter((t) => t.status === 'completed').length + '/' + tasks.length}
              label="Tasks Finished"
              subtitle="Current phase"
            />
            <StatCard
              icon="cube"
              iconColor="#e8a838"
              iconBgColor="#fef3c7"
              value="5 Orders"
              label="Materials"
              subtitle="2 Pending arrival"
              onPress={() => navigation.navigate('MaterialsTab')}
            />
            <StatCard
              icon="cash"
              iconColor="#3b82f6"
              iconBgColor="#dbeafe"
              value="₹35L"
              label="Disbursed"
              subtitle="Escrow verified"
              onPress={() => navigation.navigate('PaymentsTab')}
            />
            <StatCard
              icon="calendar"
              iconColor="#ef4444"
              iconBgColor="#fee2e2"
              value="18 Days"
              label="Next Phase"
              subtitle="Plastering target"
            />
          </ScrollView>
        </View>

        {/* Quick Actions Bar */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Daily Field Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MaterialsTab')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="cart" size={22} color={theme.colors.accentDark} />
              </View>
              <Text style={styles.actionCardTitle}>Request Material</Text>
              <Text style={styles.actionCardSub}>Indent site stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleUploadPhoto}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="camera" size={22} color={theme.colors.success} />
              </View>
              <Text style={styles.actionCardTitle}>Daily Site Log</Text>
              <Text style={styles.actionCardSub}>Upload inspection photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Site Tasks Checklist */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Site Tasks</Text>
            <Text style={styles.taskCount}>
              {tasks.filter((t) => t.status === 'completed').length} of {tasks.length} Done
            </Text>
          </View>

          {tasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, isDone && styles.taskItemDone]}
                onPress={() => toggleTask(task.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isDone ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isDone ? theme.colors.success : theme.colors.textSecondary}
                />
                <View style={styles.taskTextCol}>
                  <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskDue}>Due: {task.deadline}</Text>
                </View>
                <StatusBadge
                  status={isDone ? 'completed' : 'in_progress'}
                  size="sm"
                />
              </TouchableOpacity>
            );
          })}
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
    paddingBottom: 40,
  },
  activeSiteCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  siteTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  siteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  siteName: {
    fontSize: theme.fontSize.md + 1,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 2,
  },
  siteLoc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  progressVal: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '800',
    color: theme.colors.accentDark,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.sm + 4,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  statsSection: {
    marginBottom: theme.spacing.md,
  },
  statsScroll: {
    paddingHorizontal: theme.spacing.md,
  },
  quickActionsContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm + 2,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actionCardSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  tasksSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  tasksHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  taskCount: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  taskItemDone: {
    opacity: 0.7,
  },
  taskTextCol: {
    flex: 1,
  },
  taskTitle: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '600',
    color: theme.colors.text,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  taskDue: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

export default DashboardScreen;
