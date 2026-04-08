// screens/PatientIntakeForm.js
// Collects patient information and therapy preferences.
// On submission, posts the data to the FastAPI backend and navigates
// to the match results screen with the returned patient_id.

import React, { useState } from 'react';
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

export default function PatientIntakeForm({ route, navigation }) {
  // patientId may be passed from LoginScreen — used to identify the session
  const patientId = route.params?.patientId ?? null;

  // Form field state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [age, setAge] = useState('');
  const [concerns, setConcerns] = useState('');
  const [therapyStyle, setTherapyStyle] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [intakeText, setIntakeText] = useState('');

  // UI state
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Handles form submission — validates, posts to API, navigates to results
  const handleSubmit = async () => {
    const availability = selectedDays.join(',');

    // Basic validation — all fields are required for the matching algorithm
    if (!name || !email || !pin || !age || !concerns || !therapyStyle || !availability || !intakeText) {
      Alert.alert('Missing Information', 'Please fill in all fields before continuing.');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: create the patient record
      const patientResponse = await axios.post(`${API_BASE}/patients/`, {
        name,
        email,
        pin,
        age: parseInt(age),
        concerns,
        therapy_style: therapyStyle,
        preferred_language: 'English',
        availability,
        intake_text: intakeText,
      });

      const newPatientId = patientResponse.data.id;

      // Step 2: run the matching algorithm in the background
      await axios.get(`${API_BASE}/matches/${newPatientId}/`, { timeout: 30000 });

      navigation.navigate('MatchResults', { patientId: newPatientId });

    } catch (error) {
      const message = error.response?.data?.detail || 'Could not connect to the server. Please check your connection.';
      Alert.alert('Submission Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Session banner — shown when arriving from the login screen */}
      {patientId !== null && (
        <View style={styles.sessionBanner}>
          <Text style={styles.sessionBannerText}>
            Logged in as Patient #{patientId}
          </Text>
        </View>
      )}

      <Text style={styles.heading}>Tell us about yourself</Text>
      <Text style={styles.subheading}>
        This information is used to find your most compatible therapist.
      </Text>

      {/* Name field */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Alex Johnson"
        autoCapitalize="words"
      />

      {/* Email field */}
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="e.g. alex@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* PIN field */}
      <Text style={styles.label}>Create a 4-digit PIN</Text>
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={(t) => setPin(t.replace(/[^0-9]/g, '').slice(0, 4))}
        placeholder="e.g. 1234"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
      />

      {/* Age field */}
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="e.g. 28"
        keyboardType="numeric"
      />

      {/* Concerns field */}
      <Text style={styles.label}>What brings you to therapy?</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={concerns}
        onChangeText={setConcerns}
        placeholder="e.g. anxiety, depression, relationship difficulties"
        multiline
        numberOfLines={3}
      />

      {/* Therapy style dropdown */}
      <Text style={styles.label}>Preferred Therapy Style</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowStylePicker(true)}
        activeOpacity={0.7}
      >
        <Text style={therapyStyle ? styles.pickerButtonText : styles.pickerPlaceholder}>
          {therapyStyle || 'Select a therapy style…'}
        </Text>
        <Text style={styles.pickerChevron}>▾</Text>
      </TouchableOpacity>

      {/* Day selector */}
      <Text style={styles.label}>Availability</Text>
      <View style={styles.dayRow}>
        {DAYS.map((day) => {
          const selected = selectedDays.includes(day);
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

      {/* Long-form intake text */}
      <Text style={styles.label}>Tell us more about your situation</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={intakeText}
        onChangeText={setIntakeText}
        placeholder="Describe your current situation, how long you have been experiencing difficulties, what you hope to achieve through therapy..."
        multiline
        numberOfLines={6}
      />

      {/* Submit button */}
      {loading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color="#6B4EFF" />
          <Text style={styles.loadingLabel}>Finding your matches…</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Find My Matches</Text>
        </TouchableOpacity>
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
                style={[styles.modalOption, therapyStyle === style && styles.modalOptionSelected]}
                onPress={() => { setTherapyStyle(style); setShowStylePicker(false); }}
              >
                <Text style={[styles.modalOptionText, therapyStyle === style && styles.modalOptionTextSelected]}>
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
  sessionBanner: {
    backgroundColor: '#EDE9FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  sessionBannerText: {
    fontSize: 13,
    color: '#6B4EFF',
    fontWeight: '600',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Therapy style dropdown button
  pickerButton: {
    backgroundColor: '#fff',
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

  // Day selector
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

  // Submit button
  button: {
    backgroundColor: '#6B4EFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingBlock: {
    marginTop: 32,
    alignItems: 'center',
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
