// screens/PatientDashboard.js
// Shows a patient's booked appointments.
// Each card displays therapist name, formatted date/time, status badge,
// match percentage (if available), a "Book Again" shortcut, and a Cancel button.
// Also fetches previous match results in the background so Book Again can
// pass the stored match percentage directly to BookingScreen.

import React, { useState, useEffect, useCallback } from 'react';
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

function formatDateTime(isoString) {
  const d = new Date(isoString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} at ${
    d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function statusColour(status) {
  switch (status) {
    case 'confirmed': return '#2E7D6B';
    case 'cancelled':  return '#C0392B';
    default:           return '#E67E22'; // pending
  }
}

export default function PatientDashboard({ route, navigation }) {
  const { patientId } = route.params;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  // matchMap: { [therapistId]: { matchPercentage, therapistName } }
  // populated after a background fetch of /matches/{patientId}/
  const [matchMap, setMatchMap] = useState({});

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/bookings/patient/${patientId}/`);
      setBookings(res.data);
    } catch {
      Alert.alert('Error', 'Could not load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Fetch previously computed match scores in the background.
  // Uses the stored CompatibilityScore data (already in the DB) so this is fast.
  const fetchMatches = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/matches/${patientId}/`, { timeout: 30000 });
      const map = {};
      for (const m of res.data.matches) {
        map[m.therapist_id] = {
          matchPercentage: Math.round(m.overall_score * 100),
          therapistName: m.therapist_name,
        };
      }
      setMatchMap(map);
    } catch {
      // Silent — match data is supplementary; dashboard still works without it
    }
  }, [patientId]);

  useEffect(() => {
    fetchBookings();
    fetchMatches();
  }, [fetchBookings, fetchMatches]);

  // Re-fetch on focus so a new booking or cancellation is reflected immediately
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchBookings);
    return unsub;
  }, [navigation, fetchBookings]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleCancel = (bookingId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? The slot will become available again.',
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.patch(`${API_BASE}/bookings/${bookingId}/cancel/`);
              // Refetch so the cancelled card appears with red badge but no buttons
              await fetchBookings();
            } catch (err) {
              const msg = err.response?.data?.detail || 'Could not cancel the appointment.';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  const handleBookAgain = (booking) => {
    // Use match percentage from the booking response (pre-joined from DB),
    // falling back to the background-fetched matchMap if needed.
    const pct =
      booking.match_percentage ??
      matchMap[booking.therapist_id]?.matchPercentage ??
      null;

    navigation.navigate('Booking', {
      patientId,
      therapistId: booking.therapist_id,
      therapistName: booking.therapist_name,
      matchPercentage: pct,
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const hasBookings = bookings.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.sessionPill}>
            <Text style={styles.sessionPillText}>Patient #{patientId}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('PatientProfile', { patientId })}
          >
            <Text style={styles.profileBtnText}>View Profile</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heading}>My Appointments</Text>
        <Text style={styles.subheading}>Your upcoming and past therapy sessions.</Text>
      </View>

      {/* Booking list */}
      {loading ? (
        <ActivityIndicator size="large" color="#6B4EFF" style={styles.loader} />
      ) : !hasBookings ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptyBody}>
            Find a therapist below to book your first session.
          </Text>
        </View>
      ) : (
        bookings.map((booking) => {
          const matchPct =
            booking.match_percentage ??
            matchMap[booking.therapist_id]?.matchPercentage ??
            null;

          return (
            <View key={booking.id} style={styles.card}>

              {/* Top row: therapist name + status badge */}
              <View style={styles.cardTop}>
                <Text style={styles.therapistName} numberOfLines={1}>
                  {booking.therapist_name}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: statusColour(booking.status) + '22' },
                ]}>
                  <Text style={[styles.statusText, { color: statusColour(booking.status) }]}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Date / time */}
              <Text style={styles.dateTime}>{formatDateTime(booking.appointment_datetime)}</Text>

              {/* Match percentage pill — shown only when available */}
              {matchPct !== null && (
                <View style={styles.matchPill}>
                  <Text style={styles.matchPillText}>{matchPct}% Match</Text>
                </View>
              )}

              {/* Action buttons — hidden for cancelled bookings */}
              {booking.status !== 'cancelled' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.bookAgainBtn}
                    onPress={() => handleBookAgain(booking)}
                  >
                    <Text style={styles.bookAgainText}>Book Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(booking.id)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          );
        })
      )}

      {/* CTA — label changes based on whether the patient already has bookings */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('MatchResults', { patientId })}
      >
        <Text style={styles.ctaText}>
          {hasBookings ? 'Find Another Therapist' : 'Find a Therapist'}
        </Text>
      </TouchableOpacity>

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

  // Header
  header: { marginBottom: 24 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionPill: {
    backgroundColor: '#EDE9FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sessionPillText: { fontSize: 12, fontWeight: '700', color: '#6B4EFF' },
  profileBtn: {
    backgroundColor: '#6B4EFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  profileBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#666', lineHeight: 20 },
  loader: { marginTop: 40 },

  // Empty state
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20 },

  // Booking card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  therapistName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  dateTime: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 8 },

  // Match percentage
  matchPill: {
    backgroundColor: '#EDE9FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  matchPillText: { fontSize: 12, fontWeight: '700', color: '#6B4EFF' },

  // Card action buttons
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  bookAgainBtn: {
    flex: 1,
    backgroundColor: '#6B4EFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  bookAgainText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FEE8E8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: { color: '#C0392B', fontSize: 13, fontWeight: '700' },

  // CTA
  ctaButton: {
    backgroundColor: '#6B4EFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
