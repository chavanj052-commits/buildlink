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

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login, quickSwitchRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await login(email.trim(), password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid email or password.');
      Alert.alert('Login Failed', res.error || 'Could not log in to BuildLink server.');
    }
  };

  const handleDemoLogin = (role) => {
    quickSwitchRole(role);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: Math.max(insets.top + 20, 40), paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="construct" size={36} color="#ffffff" />
          </View>
          <Text style={styles.brandTitle}>BuildLink</Text>
          <Text style={styles.brandTagline}>
            Smart Construction & Project Management
          </Text>
        </View>

        {/* Card Container */}
        <View style={styles.card}>
          <Text style={styles.loginTitle}>Welcome Back</Text>
          <Text style={styles.loginSubtitle}>Sign in to access your projects</Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email input */}
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
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password input */}
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
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instant Demo Switcher */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Instant Demo Access</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleDemoLogin('company')}
            >
              <Ionicons name="business-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.demoBtnText}>Company</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleDemoLogin('homeowner')}
            >
              <Ionicons name="home-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.demoBtnText}>Homeowner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleDemoLogin('contractor')}
            >
              <Ionicons name="hammer-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.demoBtnText}>Contractor</Text>
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.floating,
  },
  brandTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.accent,
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.card,
  },
  loginTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  loginSubtitle: {
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
  eyeBtn: {
    padding: 6,
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
  registerLink: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.accentDark,
  },
  demoSection: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});

export default LoginScreen;
