// screens/TherapistProfileScreen.js
// Displays a therapist's profile: name, email, specialisations and therapy
// approaches as badge tags, session price, and a summary card showing how
// many upcoming confirmed bookings they have.
// Session price is editable via a PATCH request.

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
} from 'react-native';
import axios from 'axios';

const API_BASE = 'http://192.168.1.149:8000';

function TagList({ value, colour }) {
  if (!value) return null;
  const tags = value
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return (
    <View style={styles.tagRow}>
      {tags.map((tag) => (
        <View key={tag} style={[styles.tag, { backgroundColor: colour.bg }]}>
          <Text style={[styles.tagText, { color: colour.text }]}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

export default function TherapistProfileScreen({ route, navigation }) {
  const { therapistId } = route.params;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Price edit state
  const [editingPrice, setEditingPrice] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  const loadProfile = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/therapists/${therapistId}/profile/`)
      .then((res) => setProfile(res.data))
      .catch(() => Alert.alert('Error', 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, [therapistId]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSavePrice = async () => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }
    setSavingPrice(true);
    try {
      await axios.patch(`${API_BASE}/therapists/${therapistId}/price/`, { session_price: price });
      setEditingPrice(false);
      loadProfile();
    } catch (error) {
      const message = error.response?.data?.detail || 'Could not save the price.';
      Alert.alert('Save Error', message);
    } finally {
      setSavingPrice(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color="#2E7D6B" />
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

      {/* Specialisations */}
      {profile.specialisations ? (
        <>
          <Text style={styles.sectionTitle}>Specialisations</Text>
          <View style={styles.card}>
            <TagList
              value={profile.specialisations}
              colour={{ bg: '#E6F5F1', text: '#2E7D6B' }}
            />
          </View>
        </>
      ) : null}

      {/* Therapy approaches */}
      {profile.therapy_style ? (
        <>
          <Text style={styles.sectionTitle}>Therapy Approaches</Text>
          <View style={styles.card}>
            <TagList
              value={profile.therapy_style}
              colour={{ bg: '#EDE9FF', text: '#6B4EFF' }}
            />
          </View>
        </>
      ) : null}

      {/* Session price — always shown, editable */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Session Price</Text>
        {!editingPrice && (
          <TouchableOpacity
            onPress={() => {
              setEditPrice(profile.session_price != null ? String(profile.session_price) : '');
              setEditingPrice(true);
            }}
          >
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.card}>
        {editingPrice ? (
          <>
            <View style={styles.priceInputRow}>
              <Text style={styles.poundSign}>£</Text>
              <TextInput
                style={styles.priceInput}
                value={editPrice}
                onChangeText={setEditPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
                autoFocus
              />
            </View>
            <View style={styles.saveRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingPrice(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, savingPrice && styles.saveBtnDisabled]}
                onPress={handleSavePrice}
                disabled={savingPrice}
              >
                {savingPrice
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.priceText}>
            {profile.session_price != null
              ? `£${Number(profile.session_price).toFixed(2)} per session`
              : 'Not set'}
          </Text>
        )}
      </View>

      {/* Upcoming bookings summary */}
      <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconBox}>
          <Text style={styles.summaryIcon}>📅</Text>
        </View>
        <View style={styles.summaryTextBox}>
          <Text style={styles.summaryCount}>
            {profile.upcoming_confirmed_bookings}
          </Text>
          <Text style={styles.summaryLabel}>
            confirmed {profile.upcoming_confirmed_bookings === 1 ? 'session' : 'sessions'} upcoming
          </Text>
        </View>
      </View>

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
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FBF8',
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
    color: '#2E7D6B',
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
    backgroundColor: '#E6F5F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D6B',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D6B',
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

  // Tag badges
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Session price
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D6B',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poundSign: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D6B',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F0FBF8',
    borderWidth: 1,
    borderColor: '#B2D8CF',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D6B',
  },
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
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
    backgroundColor: '#2E7D6B',
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

  // Upcoming bookings summary card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F5F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  summaryIcon: {
    fontSize: 22,
  },
  summaryTextBox: {
    flex: 1,
  },
  summaryCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D6B',
    lineHeight: 32,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
