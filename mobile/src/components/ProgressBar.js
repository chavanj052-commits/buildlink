import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export const ProgressBar = ({
  progress = 0,
  height = 8,
  showLabel = false,
  color = theme.colors.accent,
  trackColor = theme.colors.divider,
}) => {
  // Normalize progress to percentage 0 - 100
  const normalized = Math.min(Math.max(progress > 1 ? progress : progress * 100, 0), 100);

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Progress</Text>
          <Text style={[styles.percentageText, { color }]}>
            {Math.round(normalized)}%
          </Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${normalized}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: theme.spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  labelText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  percentageText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
  },
  track: {
    width: '100%',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: theme.borderRadius.full,
  },
});

export default ProgressBar;
