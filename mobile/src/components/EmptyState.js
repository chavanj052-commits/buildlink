import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export const EmptyState = ({
  icon = 'folder-open-outline',
  title = 'No Items Found',
  message = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={42} color={theme.colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginVertical: theme.spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md + 1,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  actionText: {
    color: '#ffffff',
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
  },
});

export default EmptyState;
