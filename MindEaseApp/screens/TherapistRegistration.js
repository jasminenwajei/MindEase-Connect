// screens/TherapistRegistration.js
// Registration form for therapists to create a profile in MindEase Connect.
// Posts therapist profile data to POST /therapists on the FastAPI backend.

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

const API_BASE = 'http://192.168.1.149:8000';

export default function TherapistRegistration({ navigation }) {

  // Form field state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [therapyStyle, setTherapyStyle] = useState('');
  const [specialisations, setSpecialisations] = useState('');
  const [availability, setAvailability] = useState('');
  const [sessionPrice, setSessionPrice] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    // Validate all required fields
    if (!name || !email || !pin || !qualifications || !therapyStyle || !specialisations || !availability || !sessionPrice || !bio) {
      Alert.alert('Missing Information', 'Please complete all fields before registering.');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);

    try {
      // Post the therapist profile to the backend
      const response = await axios.post(`${API_BASE}/therapists/`, {
        name,
        email,
        pin,
        qualifications,
        therapy_style: therapyStyle,
        specialisations,
        availability,
        session_price: parseFloat(sessionPrice),
        bio,
      });

      const therapistId = response.data.id;

      // Navigate directly to the therapist dashboard with the new ID
      Alert.alert(
        'Registration Successful',
        'Your therapist profile has been created. Patients matched to your profile will be able to book sessions with you.',
        [{ text: 'Go to Dashboard', onPress: () => navigation.navigate('TherapistDashboard', { therapistId }) }]
      );

    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      Alert.alert('Registration Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.heading}>Create Your Therapist Profile</Text>
      <Text style={styles.subheading}>
        Your profile will be used by the AI matching system to connect you
        with compatible patients.
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Dr. Sarah Mitchell"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="e.g. s.mitchell@practice.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

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

      <Text style={styles.label}>Qualifications</Text>
      <TextInput
        style={styles.input}
        value={qualifications}
        onChangeText={setQualifications}
        placeholder="e.g. DClinPsy, BABCP Accredited"
      />

      <Text style={styles.label}>Therapy Style / Approach</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={therapyStyle}
        onChangeText={setTherapyStyle}
        placeholder="e.g. I work primarily using cognitive behavioural therapy (CBT)..."
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Specialisations</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={specialisations}
        onChangeText={setSpecialisations}
        placeholder="e.g. Anxiety, depression, trauma, OCD"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Availability</Text>
      <TextInput
        style={styles.input}
        value={availability}
        onChangeText={setAvailability}
        placeholder="e.g. Monday, Tuesday, Thursday"
      />

      <Text style={styles.label}>Session Price (£)</Text>
      <TextInput
        style={styles.input}
        value={sessionPrice}
        onChangeText={setSessionPrice}
        placeholder="e.g. 70"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Professional Bio</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={bio}
        onChangeText={setBio}
        placeholder="Describe your background, approach, and experience..."
        multiline
        numberOfLines={6}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D6B" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Register Profile</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FBF8',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
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
    backgroundColor: '#2E7D6B',
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
  loader: {
    marginTop: 32,
  },
});