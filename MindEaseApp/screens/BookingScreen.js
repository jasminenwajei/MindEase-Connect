// screens/BookingScreen.js
// Allows a patient to book an appointment with a matched therapist.
// Fetches available slots from GET /availability/{therapist_id}/ and displays
// them as tappable buttons. Posts the selected slot to POST /bookings/.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

const API_BASE = 'http://192.168.1.149:8000';

function formatSlot(isoString) {
  const d = new Date(isoString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${date} ${month} ${year} — ${hours}:${mins}`;
}

export default function BookingScreen({ route, navigation }) {
  const { patientId, therapistId, therapistName } = route.params;

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await axios.get(`${API_BASE}/availability/${therapistId}/`);
      setSlots(res.data);
    } catch {
      Alert.alert('Error', 'Could not load available slots. Please try again.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('No Slot Selected', 'Please tap an available time slot first.');
      return;
    }

    setBooking(true);
    try {
      await axios.post(`${API_BASE}/bookings/`, {
        patient_id: patientId,
        therapist_id: therapistId,
        appointment_datetime: selectedSlot.slot_datetime,
      });

      Alert.alert(
        'Booking Requested',
        `Your appointment with ${therapistName} on ${formatSlot(selectedSlot.slot_datetime)} has been submitted. They will confirm your session shortly.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      const message = error.response?.data?.detail || 'Booking failed. Please try again.';
      Alert.alert('Booking Error', message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.therapistBanner}>
        <Text style={styles.bannerLabel}>Booking with</Text>
        <Text style={styles.therapistName}>{therapistName}</Text>
      </View>

      <Text style={styles.heading}>Choose an Available Slot</Text>
      <Text style={styles.subheading}>
        Tap a time slot below to select it, then confirm your booking.
      </Text>

      {loadingSlots ? (
        <ActivityIndicator size="large" color="#6B4EFF" style={styles.loader} />
      ) : slots.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No available slots for this therapist right now. Please check back later.
          </Text>
        </View>
      ) : (
        slots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id;
          return (
            <TouchableOpacity
              key={slot.id}
              style={[styles.slotButton, isSelected && styles.slotSelected]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
                {formatSlot(slot.slot_datetime)}
              </Text>
            </TouchableOpacity>
          );
        })
      )}

      {!loadingSlots && (
        booking ? (
          <ActivityIndicator size="large" color="#6B4EFF" style={styles.loader} />
        ) : (
          <TouchableOpacity
            style={[styles.confirmButton, !selectedSlot && styles.confirmDisabled]}
            onPress={handleBooking}
            disabled={!selectedSlot}
          >
            <Text style={styles.confirmText}>Confirm Booking Request</Text>
          </TouchableOpacity>
        )
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
    marginBottom: 20,
    lineHeight: 20,
  },
  loader: {
    marginTop: 32,
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  slotButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  slotSelected: {
    borderColor: '#6B4EFF',
    backgroundColor: '#EDE9FF',
  },
  slotText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
  },
  slotTextSelected: {
    color: '#6B4EFF',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#6B4EFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  confirmDisabled: {
    backgroundColor: '#B5A8FF',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
