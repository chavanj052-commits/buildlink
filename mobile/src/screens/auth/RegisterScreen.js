import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

const ROLES = [
  { id: 'company', label: 'Company / Builder', icon: 'business' },
  { id: 'homeowner', label: 'Homeowner', icon: 'home' },
  { id: 'contractor', label: 'Contractor', icon: 'construct' },
];

export const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('company');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await register(name.trim(), email.trim(), password, role);
    setLoading(false);

    if (res.success) {
      Alert.alert(
        'Account Created!',
        'Your registration was successful. Please log in with your credentials.',
        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      setErrorMessage(res.error || 'Registration failed. Try again.');
      Alert.alert('Registration Error', res.error || 'Failed to create account.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: Math.max(insets.top + 10, 30), paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Join BuildLink</Text>
          <Text style={styles.subtitle}>
            Connect builders, contractors, and owners seamlessly.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Role Picker */}
          <Text style={styles.inputLabel}>Select Your Role</Text>
          <View style={styles.rolePickerRow}>
            {ROLES.map((r) => {
              const isSelected = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.roleOption,
                    isSelected && styles.roleOptionSelected,
                  ]}
                  onPress={() => setRole(r.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={r.icon}
                    size={20}
                    color={isSelected ? '#ffffff' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleOptionText,
                      isSelected && styles.roleOptionTextSelected,
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="you@domain.com"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: '#ffffff',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.card,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
    flex: 1,
  },
  rolePickerRow: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    gap: 12,
  },
  roleOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleOptionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  roleOptionTextSelected: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  submitBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadows.floating,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
});

export default RegisterScreen;
