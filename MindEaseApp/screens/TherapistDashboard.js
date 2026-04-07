// screens/TherapistDashboard.js
// Therapist-facing screen showing their upcoming booked appointments.
// Therapist selects their ID (1 or 2) from a picker and the screen fetches
// booked slots from GET /availability/booked/{therapist_id}/.

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

const THERAPIST_IDS = [1, 2];

function formatAppointment(isoString) {
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
  return `${day}, ${date} ${month} ${year}\n${hours}:${mins}`;
}

export default function TherapistDashboard({ route }) {
  // therapistId is passed from LoginScreen; falls back to the manual selector
  const routeTherapistId = route?.params?.therapistId ?? null;

  const [selectedId, setSelectedId] = useState(routeTherapistId);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Auto-fetch when arriving from the login screen
  useEffect(() => {
    if (routeTherapistId) {
      fetchAppointments(routeTherapistId);
    }
  }, []);

  const fetchAppointments = async (id) => {
    setSelectedId(id);
    setFetched(false);
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/availability/booked/${id}/`);
      setAppointments(res.data);
      setFetched(true);
    } catch {
      Alert.alert('Error', 'Could not load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.header}>
        <Text style={styles.heading}>Therapist Dashboard</Text>
        {routeTherapistId ? (
          <View style={styles.sessionBanner}>
            <Text style={styles.sessionBannerText}>
              Logged in as Therapist #{routeTherapistId}
            </Text>
          </View>
        ) : (
          <Text style={styles.subheading}>Select your therapist ID to view upcoming booked appointments.</Text>
        )}
      </View>

      {/* ID selector — only shown when no ID was passed via login */}
      {!routeTherapistId && (
        <>
          <Text style={styles.label}>Select Therapist ID</Text>
          <View style={styles.idRow}>
            {THERAPIST_IDS.map((id) => (
              <TouchableOpacity
                key={id}
                style={[styles.idButton, selectedId === id && styles.idButtonSelected]}
                onPress={() => fetchAppointments(id)}
              >
                <Text style={[styles.idButtonText, selectedId === id && styles.idButtonTextSelected]}>
                  Therapist {id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Loading spinner */}
      {loading && <ActivityIndicator size="large" color="#2E7D6B" style={styles.loader} />}

      {/* Appointments list */}
      {fetched && !loading && (
        <>
          <Text style={styles.sectionTitle}>
            {appointments.length > 0
              ? `${appointments.length} Booked Appointment${appointments.length > 1 ? 's' : ''}`
              : 'No booked appointments'}
          </Text>

          {appointments.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No patients have booked a session with Therapist {selectedId} yet.
              </Text>
            </View>
          ) : (
            appointments.map((slot) => (
              <View key={slot.id} style={styles.appointmentCard}>
                <View style={styles.cardDot} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardDateTime}>{formatAppointment(slot.slot_datetime)}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Confirmed</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </>
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
  header: {
    marginBottom: 28,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D6B',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  sessionBanner: {
    backgroundColor: '#E6F5F1',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  sessionBannerText: {
    fontSize: 13,
    color: '#2E7D6B',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  idRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  idButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#2E7D6B',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  idButtonSelected: {
    backgroundColor: '#2E7D6B',
  },
  idButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D6B',
  },
  idButtonTextSelected: {
    color: '#fff',
  },
  loader: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D6B',
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardDateTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    lineHeight: 22,
  },
  statusBadge: {
    marginTop: 6,
    backgroundColor: '#E6F5F1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#2E7D6B',
    fontWeight: '600',
  },
});
