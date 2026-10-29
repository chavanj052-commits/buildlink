import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStatusMeta } from '../utils/formatters';
import { theme } from '../theme';

export const StatusBadge = ({ status, size = 'md' }) => {
  const meta = getStatusMeta(status);
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: meta.backgroundColor },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Ionicons
        name={meta.icon}
        size={isSmall ? 10 : 13}
        color={meta.color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          { color: meta.color },
          isSmall && styles.textSmall,
        ]}
      >
        {meta.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default StatusBadge;
