import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import ProjectCard from '../../components/ProjectCard';
import EmptyState from '../../components/EmptyState';
import { ProjectService } from '../../api';
import { theme } from '../../theme';

const TABS = [
  { key: 'all', label: 'All Projects' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export const ProjectsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await ProjectService.getAll();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Projects fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const filteredProjects = projects.filter((item) => {
    // Tab filter
    if (activeTab === 'active' && item.status === 'completed') return false;
    if (activeTab === 'completed' && item.status !== 'completed') return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (item.name || '').toLowerCase().includes(q);
    const locMatch = (item.location || '').toLowerCase().includes(q);
    const ownerMatch = (item.homeowner_name || '').toLowerCase().includes(q);
    return nameMatch || locMatch || ownerMatch;
  });

  return (
    <View style={styles.container}>
      <Header title="Project Portfolio" subtitle="COMPANY" />

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by project, site, or client..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs Filter Bar */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  isSelected && styles.tabButtonTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Project Cards List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Fetching projects...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
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
            <ProjectCard
              project={item}
              onPress={() =>
                navigation.navigate('ProjectDetail', { projectId: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No Projects Match"
              message={
                searchQuery
                  ? `No construction projects found matching "${searchQuery}".`
                  : 'No projects in this category.'
              }
              actionLabel={searchQuery ? 'Clear Search' : 'New Project'}
              onAction={
                searchQuery
                  ? () => setSearchQuery('')
                  : () => navigation.navigate('CreateProject')
              }
            />
          }
        />
      )}

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
  searchBarContainer: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm + 2,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textSecondary,
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

export default ProjectsScreen;
