import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { formatINR, formatDate } from '../utils/formatters';

export const ProjectCard = ({ project, onPress }) => {
  const {
    name,
    location,
    budget,
    progress = 60,
    status = 'in_progress',
    homeowner_name,
    contractor_name,
    start_date,
    end_date,
  } = project;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.projectName} numberOfLines={1}>
            {name}
          </Text>
          {location ? (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}
        </View>
        <StatusBadge status={status} size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Budget</Text>
          <Text style={styles.budgetValue}>{formatINR(budget)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Timeline</Text>
          <Text style={styles.metaValue}>
            {end_date ? formatDate(end_date) : 'Ongoing'}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar
          progress={progress}
          showLabel
          color={progress >= 100 ? theme.colors.success : theme.colors.accent}
        />
      </View>

      {(homeowner_name || contractor_name) && (
        <View style={styles.peopleRow}>
          {homeowner_name ? (
            <View style={styles.personTag}>
              <Ionicons
                name="person-outline"
                size={12}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.personText} numberOfLines={1}>
                Owner: {homeowner_name}
              </Text>
            </View>
          ) : null}
          {contractor_name ? (
            <View style={styles.personTag}>
              <Ionicons
                name="construct-outline"
                size={12}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.personText} numberOfLines={1}>
                Builder: {contractor_name}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.viewDetailsText}>View Project Details</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.accentDark}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  projectName: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm + 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: 2,
    fontWeight: '500',
  },
  budgetValue: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  metaValue: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    marginVertical: 4,
  },
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  personTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  personText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  viewDetailsText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.accentDark,
    marginRight: 4,
  },
});

export default ProjectCard;
