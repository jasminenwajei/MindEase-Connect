// screens/BookingScreen.js
// Allows a patient to book an appointment with a matched therapist.
// Posts a booking request to POST /bookings on the FastAPI backend.

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

export default function BookingScreen({ route, navigation }) {

  // Parameters passed from MatchResultsScreen
  const { patientId, therapistId, therapistName } = route.params;

  // Booking form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {

    // Validate required fields
    if (!date || !time) {
      Alert.alert('Missing Information', 'Please enter a preferred date and time.');
      return;
    }

    setLoading(true);

    try {
      // Post the booking request to the backend
      await axios.post(`${API_BASE}/bookings/`, {
        patient_id: patientId,
        therapist_id: therapistId,
        appointment_date: `${date} ${time}`,
        notes: notes || '',
        status: 'pending',
      });

      // Confirm success and return to the home screen
      Alert.alert(
        'Booking Requested',
        `Your appointment request with ${therapistName} has been submitted. They will confirm your session shortly.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );

    } catch (error) {
      const message = error.response?.data?.detail || 'Booking failed. Please try again.';
      Alert.alert('Booking Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Confirmation of which therapist is being booked */}
      <View style={styles.therapistBanner}>
        <Text style={styles.bannerLabel}>Booking with</Text>
        <Text style={styles.therapistName}>{therapistName}</Text>
      </View>

      <Text style={styles.heading}>Choose a Date and Time</Text>
      <Text style={styles.subheading}>
        Enter your preferred appointment details below.
        The therapist will confirm your booking.
      </Text>

      {/* Date input */}
      <Text style={styles.label}>Preferred Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="e.g. 2026-05-12"
      />

      {/* Time input */}
      <Text style={styles.label}>Preferred Time</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="e.g. 14:00"
      />

      {/* Optional notes */}
      <Text style={styles.label}>Additional Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any additional information for the therapist..."
        multiline
        numberOfLines={4}
      />

      {/* Submit booking */}
      {loading ? (
        <ActivityIndicator size="large" color="#6B4EFF" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleBooking}>
          <Text style={styles.buttonText}>Confirm Booking Request</Text>
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
  therapistBanner: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  bannerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
  },
  therapistName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 20,
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
  loader: {
    marginTop: 32,
  },
});