import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export const StatCard = ({
  icon = 'briefcase-outline',
  iconColor = theme.colors.accent,
  iconBgColor = theme.colors.accentLight,
  value,
  label,
  subtitle,
  onPress,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    minWidth: 140,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  textContainer: {
    justifyContent: 'center',
  },
  value: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

export default StatCard;
