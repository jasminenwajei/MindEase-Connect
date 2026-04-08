// screens/PatientProfileScreen.js
// Displays a patient's profile: name, email, therapy preferences from the
// intake form, and a list of matched therapists with name, specialisation,
// and match percentage badge.
// Therapy style, availability, and intake text are editable via a PATCH request.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import axios from 'axios';

const API_BASE = 'http://192.168.1.149:8000';

const THERAPY_STYLES = [
  'CBT (Cognitive Behavioural Therapy)',
  'Person-Centred',
  'Psychodynamic',
  'Mindfulness-Based',
  'DBT (Dialectical Behaviour Therapy)',
  'Integrative',
  'Open to Any',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function matchBadgeColour(pct) {
  if (pct >= 80) return { bg: '#D4EDDA', text: '#1E7E34' };
  if (pct >= 60) return { bg: '#EDE9FF', text: '#6B4EFF' };
  return { bg: '#FFF3CD', text: '#856404' };
}

function parseAvailability(avail) {
  if (!avail) return [];
  return avail.split(',').map((d) => d.trim()).filter((d) => DAYS.includes(d));
}

export default function PatientProfileScreen({ route, navigation }) {
  const { patientId } = route.params;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editTherapyStyle, setEditTherapyStyle] = useState('');
  const [editSelectedDays, setEditSelectedDays] = useState([]);
  const [editIntakeText, setEditIntakeText] = useState('');
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/patients/${patientId}/profile/`)
      .then((res) => setProfile(res.data))
      .catch(() => Alert.alert('Error', 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, [patientId]);

  // Load on mount
  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const startEditing = () => {
    setEditTherapyStyle(profile.therapy_style || '');
    setEditSelectedDays(parseAvailability(profile.availability));
    setEditIntakeText(profile.intake_text || '');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setShowStylePicker(false);
  };

  const toggleDay = (day) => {
    setEditSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_BASE}/patients/${patientId}/preferences/`, {
        therapy_style: editTherapyStyle,
        availability: editSelectedDays.join(','),
        intake_text: editIntakeText,
      });
      setEditing(false);
      loadProfile();
    } catch (error) {
      const message = error.response?.data?.detail || 'Could not save your preferences.';
      Alert.alert('Save Error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centred}>
        <Text style={styles.errorText}>Profile unavailable.</Text>
      </View>
    );
  }

  const staticPreferences = [
    { label: 'Concerns', value: profile.concerns },
    { label: 'Preferred language', value: profile.preferred_language },
    { label: 'Age', value: profile.age != null ? String(profile.age) : null },
  ].filter((p) => p.value);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      {/* Identity card */}
      <View style={styles.identityCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      {/* Therapy preferences */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Therapy Preferences</Text>
        {!editing && (
          <TouchableOpacity onPress={startEditing}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        {editing ? (
          <>
            {/* Therapy style dropdown */}
            <Text style={styles.editLabel}>Therapy Style</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStylePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={editTherapyStyle ? styles.pickerButtonText : styles.pickerPlaceholder}>
                {editTherapyStyle || 'Select a therapy style…'}
              </Text>
              <Text style={styles.pickerChevron}>▾</Text>
            </TouchableOpacity>

            {/* Day selector */}
            <Text style={styles.editLabel}>Availability</Text>
            <View style={styles.dayRow}>
              {DAYS.map((day) => {
                const selected = editSelectedDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, selected && styles.dayButtonSelected]}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayButtonText, selected && styles.dayButtonTextSelected]}>
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Intake text */}
            <Text style={styles.editLabel}>More about your situation</Text>
            <TextInput
              style={[styles.editInput, styles.editMultiline]}
              value={editIntakeText}
              onChangeText={setEditIntakeText}
              placeholder="Describe your situation and therapy goals..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {/* Save / Cancel */}
            <View style={styles.saveRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEditing}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Editable fields shown as static rows when not editing */}
            {profile.therapy_style ? (
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>Therapy style</Text>
                <Text style={styles.prefValue}>{profile.therapy_style}</Text>
              </View>
            ) : null}
            {profile.availability ? (
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>Availability</Text>
                <Text style={styles.prefValue}>{profile.availability}</Text>
              </View>
            ) : null}
            {profile.intake_text ? (
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>More about your situation</Text>
                <Text style={styles.prefValue}>{profile.intake_text}</Text>
              </View>
            ) : null}
            {/* Static (non-editable) preference rows */}
            {staticPreferences.map((pref) => (
              <View key={pref.label} style={styles.prefRow}>
                <Text style={styles.prefLabel}>{pref.label}</Text>
                <Text style={styles.prefValue}>{pref.value}</Text>
              </View>
            ))}
            {!profile.therapy_style && !profile.availability && !profile.intake_text && staticPreferences.length === 0 && (
              <Text style={styles.emptyNote}>No preferences recorded.</Text>
            )}
          </>
        )}
      </View>

      {/* Matched therapists */}
      <Text style={styles.sectionTitle}>Your Matched Therapists</Text>
      {profile.matched_therapists.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyNote}>
            No matches yet. Complete the intake form to find therapists.
          </Text>
        </View>
      ) : (
        profile.matched_therapists.map((t) => {
          const colours = matchBadgeColour(t.match_percentage);
          return (
            <View key={t.therapist_id} style={styles.matchCard}>
              <View style={styles.matchCardLeft}>
                <Text style={styles.matchName}>{t.name}</Text>
                {t.specialisations ? (
                  <Text style={styles.matchSpec} numberOfLines={2}>
                    {t.specialisations}
                  </Text>
                ) : null}
              </View>
              <View style={[styles.matchBadge, { backgroundColor: colours.bg }]}>
                <Text style={[styles.matchBadgeText, { color: colours.text }]}>
                  {t.match_percentage}%
                </Text>
              </View>
            </View>
          );
        })
      )}

      {/* Therapy style picker modal */}
      <Modal visible={showStylePicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStylePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Therapy Style</Text>
            {THERAPY_STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[styles.modalOption, editTherapyStyle === style && styles.modalOptionSelected]}
                onPress={() => { setEditTherapyStyle(style); setShowStylePicker(false); }}
              >
                <Text style={[styles.modalOptionText, editTherapyStyle === style && styles.modalOptionTextSelected]}>
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
  },

  backBtn: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4EFF',
  },

  // Identity card
  identityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4EFF',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#777',
  },

  // Section headings
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4EFF',
  },

  // Generic white card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyNote: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Preference rows (view mode)
  prefRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEF8',
  },
  prefLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B4EFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  prefValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Edit mode controls
  editLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B4EFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
  },
  pickerButton: {
    backgroundColor: '#F8F7FF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  pickerChevron: {
    fontSize: 16,
    color: '#6B4EFF',
    marginLeft: 8,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 44,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#6B4EFF',
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  editInput: {
    backgroundColor: '#F8F7FF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  editMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveBtn: {
    backgroundColor: '#6B4EFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 70,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // Match cards
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  matchCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  matchName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
  },
  matchSpec: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  matchBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 56,
  },
  matchBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // Therapy style modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEF8',
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#EDE9FF',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#6B4EFF',
    fontWeight: '600',
  },
});
