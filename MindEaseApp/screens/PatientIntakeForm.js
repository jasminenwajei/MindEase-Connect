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
} from 'react-native';
import axios from 'axios';

// Base URL of the FastAPI backend running locally
// On a real device on the same network, replace with your Mac's local IP
const API_BASE = 'http://192.168.1.149:8000';

export default function PatientIntakeForm({ route, navigation }) {
  // patientId may be passed from LoginScreen — used to identify the session
  const patientId = route.params?.patientId ?? null;

  // Form field state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [concerns, setConcerns] = useState('');
  const [therapyStyle, setTherapyStyle] = useState('');
  const [availability, setAvailability] = useState('');
  const [intakeText, setIntakeText] = useState('');

  // Loading state to show spinner during API call
  const [loading, setLoading] = useState(false);

  // Handles form submission — validates, posts to API, navigates to results
  const handleSubmit = async () => {

    // Basic validation — all fields are required for the matching algorithm
    if (!name || !email || !age || !concerns || !therapyStyle || !availability || !intakeText) {
      Alert.alert('Missing Information', 'Please fill in all fields before continuing.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: create the patient record
      const patientResponse = await axios.post(`${API_BASE}/patients/`, {
        name,
        email,
        age: parseInt(age),
        concerns,
        therapy_style: therapyStyle,
        preferred_language: 'English',
        availability,
        intake_text: intakeText,
      });

      const newPatientId = patientResponse.data.id;

      // Step 2: run the matching algorithm — pass results directly to MatchResults
      // so the screen doesn't need to re-fetch (timeout: 30s for the AI scorer)
      const matchResponse = await axios.get(`${API_BASE}/matches/${newPatientId}/`, {
        timeout: 30000,
      });

      navigation.navigate('MatchResults', {
        patientId: newPatientId,
        matches: matchResponse.data.matches,
      });

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

      {/* Therapy style preference */}
      <Text style={styles.label}>Preferred Therapy Style</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={therapyStyle}
        onChangeText={setTherapyStyle}
        placeholder="e.g. I am interested in CBT or mindfulness-based approaches"
        multiline
        numberOfLines={3}
      />

      {/* Availability */}
      <Text style={styles.label}>Availability</Text>
      <TextInput
        style={styles.input}
        value={availability}
        onChangeText={setAvailability}
        placeholder="e.g. Monday, Wednesday, Friday"
      />

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
});