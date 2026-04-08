// screens/PatientProfileScreen.js
// Displays a patient's profile: name, email, therapy preferences from the
// intake form, and a list of matched therapists with name, specialisation,
// and match percentage badge.

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

function matchBadgeColour(pct) {
  if (pct >= 80) return { bg: '#D4EDDA', text: '#1E7E34' };
  if (pct >= 60) return { bg: '#EDE9FF', text: '#6B4EFF' };
  return { bg: '#FFF3CD', text: '#856404' };
}

export default function PatientProfileScreen({ route, navigation }) {
  const { patientId } = route.params;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/patients/${patientId}/profile/`)
      .then((res) => setProfile(res.data))
      .catch(() => Alert.alert('Error', 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color="#6B4EFF" />
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

  const preferences = [
    { label: 'Therapy style', value: profile.therapy_style },
    { label: 'Concerns', value: profile.concerns },
    { label: 'Availability', value: profile.availability },
    { label: 'Preferred language', value: profile.preferred_language },
    { label: 'Age', value: profile.age != null ? String(profile.age) : null },
  ].filter((p) => p.value);

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

      {/* Therapy preferences */}
      <Text style={styles.sectionTitle}>Therapy Preferences</Text>
      <View style={styles.card}>
        {preferences.length === 0 ? (
          <Text style={styles.emptyNote}>No preferences recorded.</Text>
        ) : (
          preferences.map((pref) => (
            <View key={pref.label} style={styles.prefRow}>
              <Text style={styles.prefLabel}>{pref.label}</Text>
              <Text style={styles.prefValue}>{pref.value}</Text>
            </View>
          ))
        )}
      </View>

      {/* Matched therapists */}
      <Text style={styles.sectionTitle}>Your Matched Therapists</Text>
      {profile.matched_therapists.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyNote}>
            No matches yet. Complete the intake form to find therapists.
          </Text>
        </View>
      ) : (
        profile.matched_therapists.map((t) => {
          const colours = matchBadgeColour(t.match_percentage);
          return (
            <View key={t.therapist_id} style={styles.matchCard}>
              <View style={styles.matchCardLeft}>
                <Text style={styles.matchName}>{t.name}</Text>
                {t.specialisations ? (
                  <Text style={styles.matchSpec} numberOfLines={2}>
                    {t.specialisations}
                  </Text>
                ) : null}
              </View>
              <View style={[styles.matchBadge, { backgroundColor: colours.bg }]}>
                <Text style={[styles.matchBadgeText, { color: colours.text }]}>
                  {t.match_percentage}%
                </Text>
              </View>
            </View>
          );
        })
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
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
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
    color: '#6B4EFF',
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
    backgroundColor: '#EDE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4EFF',
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
  emptyNote: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Preference rows
  prefRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEF8',
  },
  prefLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B4EFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  prefValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Match cards
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  matchCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  matchName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
  },
  matchSpec: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  matchBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 56,
  },
  matchBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
