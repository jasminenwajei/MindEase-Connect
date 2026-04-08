// screens/TherapistProfileScreen.js
// Displays a therapist's profile: name, email, specialisations and therapy
// approaches as badge tags, session price, and a summary card showing how
// many upcoming confirmed bookings they have.

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

  useEffect(() => {
    axios
      .get(`${API_BASE}/therapists/${therapistId}/profile/`)
      .then((res) => setProfile(res.data))
      .catch(() => Alert.alert('Error', 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, [therapistId]);

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

      {/* Session price */}
      {profile.session_price != null ? (
        <>
          <Text style={styles.sectionTitle}>Session Price</Text>
          <View style={styles.card}>
            <Text style={styles.priceText}>
              £{Number(profile.session_price).toFixed(2)} per session
            </Text>
          </View>
        </>
      ) : null}

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
