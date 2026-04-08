// screens/TherapistDashboard.js
// Therapist-facing dashboard with two sections:
//   "Upcoming Bookings" — booked slots fetched from GET /availability/booked/{id}/
//   "My Availability"  — unbooked slots with per-slot delete + Add Slot modal
// therapistId is always passed as a route param (from LoginScreen or TherapistRegistration).

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} — ${
    d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function TherapistDashboard({ route, navigation }) {
  const therapistId = route?.params?.therapistId ?? null;

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'availability'
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Add Slot modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState('');  // YYYY-MM-DD
  const [newTime, setNewTime] = useState('');  // HH:MM
  const [adding, setAdding] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!therapistId) return;
    setLoadingBookings(true);
    try {
      const res = await axios.get(`${API_BASE}/availability/booked/${therapistId}/`);
      setBookedSlots(res.data);
    } catch {
      Alert.alert('Error', 'Could not load bookings.');
    } finally {
      setLoadingBookings(false);
    }
  }, [therapistId]);

  const fetchAvailability = useCallback(async () => {
    if (!therapistId) return;
    setLoadingAvailability(true);
    try {
      const res = await axios.get(`${API_BASE}/availability/${therapistId}/`);
      setAvailableSlots(res.data);
    } catch {
      Alert.alert('Error', 'Could not load availability.');
    } finally {
      setLoadingAvailability(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchBookings();
    fetchAvailability();
  }, [fetchBookings, fetchAvailability]);

  // Re-fetch when screen comes into focus
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      fetchBookings();
      fetchAvailability();
    });
    return unsub;
  }, [navigation, fetchBookings, fetchAvailability]);

  const handleConfirmBooking = async (bookingId) => {
    try {
      await axios.patch(`${API_BASE}/bookings/${bookingId}/confirm/`);
      // Update the slot in state so UI reflects immediately
      setBookedSlots((prev) =>
        prev.map((s) =>
          s.booking_id === bookingId ? { ...s, booking_status: 'confirmed' } : s
        )
      );
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not confirm booking.';
      Alert.alert('Error', msg);
    }
  };

  const handleDeclineBooking = (bookingId) => {
    Alert.alert(
      'Decline Booking',
      'Are you sure you want to decline this booking? The slot will become available again.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.patch(`${API_BASE}/bookings/${bookingId}/cancel/`);
              Alert.alert('Booking Declined', 'The booking has been declined.');
              // Remove the card — slot is now free
              setBookedSlots((prev) => prev.filter((s) => s.booking_id !== bookingId));
            } catch (err) {
              const msg = err.response?.data?.detail || 'Could not decline booking.';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  const handleDeleteSlot = (slotId) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to remove this availability slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/availability/${slotId}/`);
              setAvailableSlots((prev) => prev.filter((s) => s.id !== slotId));
            } catch (err) {
              const msg = err.response?.data?.detail || 'Could not delete slot.';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  const handleAddSlot = async () => {
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    const timeRe = /^\d{2}:\d{2}$/;
    if (!dateRe.test(newDate)) {
      Alert.alert('Invalid date', 'Please enter date as YYYY-MM-DD (e.g. 2026-05-01)');
      return;
    }
    if (!timeRe.test(newTime)) {
      Alert.alert('Invalid time', 'Please enter time as HH:MM (e.g. 14:00)');
      return;
    }

    const slotDatetime = `${newDate}T${newTime}:00`;
    setAdding(true);
    try {
      const res = await axios.post(`${API_BASE}/availability/`, {
        therapist_id: therapistId,
        slot_datetime: slotDatetime,
      });
      setAvailableSlots((prev) => [...prev, res.data]);
      setModalVisible(false);
      setNewDate('');
      setNewTime('');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not add slot.';
      Alert.alert('Error', msg);
    } finally {
      setAdding(false);
    }
  };

  if (!therapistId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No therapist ID provided. Please log in again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.outer}>

      {/* Session banner */}
      <View style={styles.bannerBar}>
        <Text style={styles.bannerText}>Therapist #{therapistId}</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
            Upcoming Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'availability' && styles.tabActive]}
          onPress={() => setActiveTab('availability')}
        >
          <Text style={[styles.tabText, activeTab === 'availability' && styles.tabTextActive]}>
            My Availability
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Upcoming Bookings tab ── */}
      {activeTab === 'bookings' && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          {loadingBookings ? (
            <ActivityIndicator size="large" color="#2E7D6B" style={styles.loader} />
          ) : bookedSlots.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyBody}>
                Patients who book one of your slots will appear here.
              </Text>
            </View>
          ) : (
            bookedSlots.map((slot) => (
              <View key={slot.slot_id} style={styles.bookingCard}>
                <View style={[
                  styles.cardDot,
                  slot.booking_status === 'confirmed' && { backgroundColor: '#2E7D6B' },
                  slot.booking_status === 'pending' && { backgroundColor: '#E67E22' },
                ]} />
                <View style={styles.cardBody}>
                  {slot.patient_name ? (
                    <Text style={styles.cardPatient}>{slot.patient_name}</Text>
                  ) : null}
                  <Text style={styles.cardDateTime}>{formatDateTime(slot.slot_datetime)}</Text>

                  {slot.booking_status === 'confirmed' ? (
                    <View style={styles.confirmedBadge}>
                      <Text style={styles.confirmedText}>Confirmed</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingActions}>
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => handleConfirmBooking(slot.booking_id)}
                      >
                        <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleDeclineBooking(slot.booking_id)}
                      >
                        <Text style={styles.declineBtnText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ── My Availability tab ── */}
      {activeTab === 'availability' && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          <TouchableOpacity
            style={styles.addSlotButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addSlotText}>+ Add Slot</Text>
          </TouchableOpacity>

          {loadingAvailability ? (
            <ActivityIndicator size="large" color="#2E7D6B" style={styles.loader} />
          ) : availableSlots.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🗓️</Text>
              <Text style={styles.emptyTitle}>No availability slots</Text>
              <Text style={styles.emptyBody}>
                Tap "Add Slot" above to let patients book sessions with you.
              </Text>
            </View>
          ) : (
            availableSlots.map((slot) => (
              <View key={slot.id} style={styles.slotRow}>
                <Text style={styles.slotDateTime}>{formatDateTime(slot.slot_datetime)}</Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteSlot(slot.id)}
                >
                  <Text style={styles.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ── Add Slot Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Availability Slot</Text>
            <Text style={styles.modalSubtitle}>Enter the date and time for the new slot.</Text>

            <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              value={newDate}
              onChangeText={setNewDate}
              placeholder="e.g. 2026-05-15"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              autoFocus
            />

            <Text style={styles.inputLabel}>Time (HH:MM)</Text>
            <TextInput
              style={styles.modalInput}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="e.g. 14:00"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            {adding ? (
              <ActivityIndicator size="large" color="#2E7D6B" style={{ marginTop: 16 }} />
            ) : (
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddSlot}>
                <Text style={styles.modalConfirmText}>Confirm Slot</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => {
                setModalVisible(false);
                setNewDate('');
                setNewTime('');
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#F0FBF8',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },

  // Session banner
  bannerBar: {
    backgroundColor: '#2E7D6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#2E7D6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  tabTextActive: {
    color: '#2E7D6B',
  },

  // Tab content
  tabContent: {
    padding: 20,
    paddingBottom: 48,
  },
  loader: {
    marginTop: 32,
  },

  // Empty state
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 19,
  },

  // Booking card
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D6B',
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardPatient: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginBottom: 2,
  },
  cardDateTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#2E7D6B',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#FEE8E8',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 12,
    color: '#C0392B',
    fontWeight: '700',
  },
  confirmedBadge: {
    backgroundColor: '#E6F5F1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  confirmedText: {
    fontSize: 11,
    color: '#2E7D6B',
    fontWeight: '700',
  },

  // Add Slot button
  addSlotButton: {
    backgroundColor: '#2E7D6B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  addSlotText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Slot row
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  slotDateTime: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: '#FEE8E8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteBtnText: {
    fontSize: 12,
    color: '#C0392B',
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#2E7D6B',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  modalConfirm: {
    backgroundColor: '#2E7D6B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
});
