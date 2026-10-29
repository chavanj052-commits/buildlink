import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { getBaseUrl, setCustomBaseUrl, resetBaseUrl, ENV_CONFIG } from '../../config';
import { theme } from '../../theme';

export const ProfileScreen = () => {
  const { user, logout, quickSwitchRole } = useAuth();
  const [apiUrl, setApiUrl] = useState('');
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    const url = await getBaseUrl();
    setApiUrl(url);
    setCustomInput(url);
  };

  const handleApplyUrl = async (url) => {
    await setCustomBaseUrl(url);
    setApiUrl(url);
    Alert.alert('API Updated', `Active API Base URL set to:\n${url}`);
  };

  const handleResetUrl = async () => {
    await resetBaseUrl();
    await loadCurrentUrl();
    Alert.alert('Reset Complete', 'Reverted back to default base URL.');
  };

  return (
    <View style={styles.container}>
      <Header title="Account & Settings" subtitle="PREFERENCES" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'BuildLink User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@buildlink.com'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'USER'}</Text>
          </View>
        </View>

        {/* Demo Role Switcher Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Perspective Switcher</Text>
          <Text style={styles.cardSub}>
            Preview BuildLink as Company Builder, Homeowner, or Contractor:
          </Text>

          <View style={styles.roleButtonsRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                user?.role === 'company' && styles.roleBtnActive,
              ]}
              onPress={() => quickSwitchRole('company')}
            >
              <Ionicons
                name="business"
                size={18}
                color={user?.role === 'company' ? '#fff' : theme.colors.primary}
              />
              <Text
                style={[
                  styles.roleBtnText,
                  user?.role === 'company' && styles.roleBtnTextActive,
                ]}
              >
                Company
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                user?.role === 'homeowner' && styles.roleBtnActive,
              ]}
              onPress={() => quickSwitchRole('homeowner')}
            >
              <Ionicons
                name="home"
                size={18}
                color={user?.role === 'homeowner' ? '#fff' : theme.colors.primary}
              />
              <Text
                style={[
                  styles.roleBtnText,
                  user?.role === 'homeowner' && styles.roleBtnTextActive,
                ]}
              >
                Homeowner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                user?.role === 'contractor' && styles.roleBtnActive,
              ]}
              onPress={() => quickSwitchRole('contractor')}
            >
              <Ionicons
                name="construct"
                size={18}
                color={user?.role === 'contractor' ? '#fff' : theme.colors.primary}
              />
              <Text
                style={[
                  styles.roleBtnText,
                  user?.role === 'contractor' && styles.roleBtnTextActive,
                ]}
              >
                Contractor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backend API Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backend API Connection</Text>
          <Text style={styles.cardSub}>
            Active URL: <Text style={styles.activeUrl}>{apiUrl}</Text>
          </Text>

          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleApplyUrl('http://10.0.2.2:5000/api')}
            >
              <Text style={styles.presetText}>Android (10.0.2.2)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleApplyUrl('http://localhost:5000/api')}
            >
              <Text style={styles.presetText}>Localhost / iOS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.customUrlInputRow}>
            <TextInput
              style={styles.customInput}
              placeholder="http://192.168.1.50:5000/api"
              placeholderTextColor={theme.colors.textMuted}
              value={customInput}
              onChangeText={setCustomInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.saveUrlBtn}
              onPress={() => handleApplyUrl(customInput)}
            >
              <Text style={styles.saveUrlText}>Save</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={handleResetUrl}>
            <Text style={styles.resetBtnText}>Restore Default API Endpoint</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>BuildLink Mobile v1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SDK</Text>
            <Text style={styles.infoValue}>Expo SDK 52 (React Native)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Currency System</Text>
            <Text style={styles.infoValue}>INR (Indian Rupee ₹)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ffffff" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarLetter: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: '#ffffff',
  },
  userName: {
    fontSize: theme.fontSize.md + 2,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  userEmail: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.accentDark,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  cardTitle: {
    fontSize: theme.fontSize.sm + 1,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  roleBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  roleBtnTextActive: {
    color: '#ffffff',
  },
  activeUrl: {
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  presetChip: {
    flex: 1,
    backgroundColor: theme.colors.inputBg,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  customUrlInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 42,
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.text,
  },
  saveUrlBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveUrlText: {
    color: '#ffffff',
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
  },
  resetBtn: {
    marginTop: 10,
    alignSelf: 'center',
  },
  resetBtnText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textDecorationLine: 'underline',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.danger,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
    gap: 8,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
});

export default ProfileScreen;
