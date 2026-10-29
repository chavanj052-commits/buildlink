import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { ProjectService } from '../../api';
import { theme } from '../../theme';

export const CreateProjectScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState('2026-12-31');
  const [description, setDescription] = useState('');

  const [people, setPeople] = useState([]);
  const [selectedHomeownerId, setSelectedHomeownerId] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState('');

  const [loadingPeople, setLoadingPeople] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const data = await ProjectService.getPeople();
      setPeople(Array.isArray(data) ? data : []);
      const homeowners = data.filter((p) => p.role === 'homeowner');
      const contractors = data.filter((p) => p.role === 'contractor');
      if (homeowners.length > 0) setSelectedHomeownerId(String(homeowners[0].id));
      if (contractors.length > 0) setSelectedContractorId(String(contractors[0].id));
    } catch (err) {
      console.warn('Could not load people:', err);
    } finally {
      setLoadingPeople(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMessage('Project Name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await ProjectService.create({
        name: name.trim(),
        location: location.trim() || null,
        budget: budget ? Number(budget) : null,
        start_date: startDate || null,
        end_date: endDate || null,
        homeowner_id: selectedHomeownerId ? Number(selectedHomeownerId) : null,
        contractor_id: selectedContractorId ? Number(selectedContractorId) : null,
        description: description.trim() || null,
      });

      Alert.alert(
        'Project Created!',
        `"${name}" has been scheduled and added to the company roster.`,
        [{ text: 'View Projects', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not create project';
      setErrorMessage(msg);
      Alert.alert('Creation Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const homeowners = people.filter((p) => p.role === 'homeowner');
  const contractors = people.filter((p) => p.role === 'contractor');

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="New Project"
        subtitle="COMPANY INITIATIVE"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.formTitle}>Initialize Construction Project</Text>
          <Text style={styles.formSubtitle}>
            Configure site specifications, milestones, and assigned stakeholders.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Project Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="business-outline"
                size={18}
                color={theme.colors.textSecondary}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Skyline Luxury Villa"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Site Location / Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="location-outline"
                size={18}
                color={theme.colors.textSecondary}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Whitefield, Bangalore"
                placeholderTextColor={theme.colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Budget */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Contract Budget (INR ₹)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={theme.colors.textSecondary}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. 8500000"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
              />
            </View>
          </View>

          {/* Dates Row */}
          <View style={styles.datesRow}>
            <View style={[styles.inputGroup, styles.dateCol]}>
              <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={theme.colors.textSecondary}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="2026-03-01"
                  placeholderTextColor={theme.colors.textMuted}
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.dateCol]}>
              <Text style={styles.label}>Target Completion</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={theme.colors.textSecondary}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="2026-12-31"
                  placeholderTextColor={theme.colors.textMuted}
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>
          </View>

          {/* Homeowner Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assigned Homeowner (Client)</Text>
            {loadingPeople ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <View style={styles.chipsContainer}>
                {homeowners.map((h) => {
                  const isSelected = selectedHomeownerId === String(h.id);
                  return (
                    <TouchableOpacity
                      key={h.id}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedHomeownerId(String(h.id))}
                    >
                      <Ionicons
                        name="person"
                        size={14}
                        color={isSelected ? '#fff' : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {h.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Contractor Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assigned Contractor / Builder</Text>
            {loadingPeople ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <View style={styles.chipsContainer}>
                {contractors.map((c) => {
                  const isSelected = selectedContractorId === String(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedContractorId(String(c.id))}
                    >
                      <Ionicons
                        name="construct"
                        size={14}
                        color={isSelected ? '#fff' : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scope of Construction / Notes</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Architectural specs, materials preferences, structural phases..."
                placeholderTextColor={theme.colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCreate}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Initialize Project</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  formTitle: {
    fontSize: theme.fontSize.md + 2,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  formSubtitle: {
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
  label: {
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
    height: 46,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCol: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  textAreaWrapper: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  textArea: {
    height: '100%',
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
  },
});

export default CreateProjectScreen;
