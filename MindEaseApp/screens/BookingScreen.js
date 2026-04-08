// screens/BookingScreen.js
// Fetches available slots and lets a patient book with a therapist.
// Accepts therapistId, therapistName, and optionally matchPercentage as route params.
// After a successful booking, replaces the slot picker with an inline confirmation
// view (no navigation away) that has a "Back to My Appointments" button.

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
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} — ${
    d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function BookingScreen({ route, navigation }) {
  const { patientId, therapistId, therapistName, matchPercentage } = route.params;

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [booking, setBooking] = useState(false);
  // When confirmed is set, we switch to the inline confirmation view
  const [confirmed, setConfirmed] = useState(null); // null | { slotDatetime }

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
      // Show inline confirmation instead of navigating away
      setConfirmed({ slotDatetime: selectedSlot.slot_datetime });
    } catch (error) {
      const message = error.response?.data?.detail || 'Booking failed. Please try again.';
      Alert.alert('Booking Error', message);
    } finally {
      setBooking(false);
    }
  };

  // ── Inline confirmation screen ───────────────────────────────────────────
  if (confirmed) {
    return (
      <View style={styles.confirmContainer}>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmIcon}>✓</Text>
          <Text style={styles.confirmTitle}>Appointment Requested!</Text>
          <Text style={styles.confirmTherapist}>{therapistName}</Text>
          <Text style={styles.confirmDateTime}>{formatSlot(confirmed.slotDatetime)}</Text>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>Status: Pending</Text>
          </View>
          <Text style={styles.confirmNote}>
            Your booking is awaiting confirmation from your therapist.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('PatientDashboard', { patientId })}
        >
          <Text style={styles.backBtnText}>Back to My Appointments</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Slot picker ──────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Therapist banner with optional match percentage */}
      <View style={styles.therapistBanner}>
        <Text style={styles.bannerLabel}>Booking with</Text>
        <Text style={styles.bannerName}>{therapistName}</Text>
        {matchPercentage != null && (
          <View style={styles.matchPill}>
            <Text style={styles.matchPillText}>{matchPercentage}% Match</Text>
          </View>
        )}
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
  // ── Slot picker styles ───────────────────────────────────────────────────
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  content: { padding: 24, paddingBottom: 48 },

  therapistBanner: {
    backgroundColor: '#6B4EFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    alignItems: 'center',
  },
  bannerLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 4 },
  bannerName: { color: '#fff', fontSize: 19, fontWeight: 'bold', marginBottom: 8 },
  matchPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  matchPillText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  heading: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subheading: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  loader: { marginTop: 32 },

  emptyBox: {
    backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center', marginTop: 12,
  },
  emptyText: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  slotButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  slotSelected: { borderColor: '#6B4EFF', backgroundColor: '#EDE9FF' },
  slotText: { fontSize: 15, color: '#444', textAlign: 'center' },
  slotTextSelected: { color: '#6B4EFF', fontWeight: 'bold' },

  confirmButton: {
    backgroundColor: '#6B4EFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  confirmDisabled: { backgroundColor: '#B5A8FF' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // ── Inline confirmation view ─────────────────────────────────────────────
  confirmContainer: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    padding: 28,
    justifyContent: 'center',
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  confirmIcon: {
    fontSize: 52,
    color: '#6B4EFF',
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 60,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmTherapist: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6B4EFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmDateTime: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
  },
  pendingBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E67E22',
  },
  confirmNote: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 19,
  },
  backBtn: {
    backgroundColor: '#6B4EFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
