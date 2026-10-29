import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export const Header = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const displayName = title || (user ? `Hello, ${user.name.split(' ')[0]}!` : 'BuildLink');
  const roleLabel = subtitle || (user ? user.role.toUpperCase() : 'PORTAL');

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.contentRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.card} />
          </TouchableOpacity>
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </Text>
          </View>
        )}

        <View style={styles.titleArea}>
          <Text style={styles.titleText} numberOfLines={1}>
            {displayName}
          </Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        <View style={styles.rightArea}>
          {rightAction || (
            <View style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.colors.card}
              />
              <View style={styles.notificationDot} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    fontSize: theme.fontSize.md,
    fontWeight: '800',
    color: '#ffffff',
  },
  titleArea: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: '#ffffff',
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232, 168, 56, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 0.5,
  },
  rightArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
});

export default Header;
