// screens/MatchResultsScreen.js
// Displays the top 3 matched therapists ranked by AI compatibility score.
// Matches are pre-fetched by PatientIntakeForm and passed via route params.
// Falls back to fetching from the API if params are absent (e.g. direct navigation).

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

const API_BASE = 'http://192.168.1.149:8000';

function scoreColour(score) {
  if (score >= 0.6)  return '#2E7D6B';
  if (score >= 0.35) return '#E67E22';
  return '#C0392B';
}

export default function MatchResultsScreen({ route, navigation }) {
  const { patientId, matches: prefetchedMatches } = route.params;

  const [matches, setMatches] = useState(prefetchedMatches ?? []);
  const [loading, setLoading] = useState(!prefetchedMatches);

  useEffect(() => {
    if (!prefetchedMatches) fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/matches/${patientId}/`, { timeout: 30000 });
      setMatches(res.data.matches);
    } catch {
      Alert.alert('Error', 'Could not load your matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text style={styles.loadingText}>Finding your best matches…</Text>
      </View>
    );
  }

  // Show at most the top 3
  const top3 = matches.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Your Top Matches</Text>
      <Text style={styles.subheading}>
        Ranked by AI compatibility score based on your intake form.
      </Text>

      {top3.map((item, index) => {
        const pct = Math.round(item.overall_score * 100);
        const colour = scoreColour(item.overall_score);

        return (
          <View key={item.therapist_id} style={styles.card}>

            {/* Rank + name row */}
            <View style={styles.cardHeader}>
              <View style={[styles.rankBadge, { backgroundColor: colour }]}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.therapistName}>{item.therapist_name}</Text>
                {!!item.specialisations && (
                  <Text style={styles.specialisations} numberOfLines={2}>
                    {item.specialisations}
                  </Text>
                )}
              </View>
              {/* Prominent match percentage */}
              <View style={[styles.matchBadge, { borderColor: colour }]}>
                <Text style={[styles.matchPct, { color: colour }]}>{pct}%</Text>
                <Text style={[styles.matchLabel, { color: colour }]}>Match</Text>
              </View>
            </View>

            {/* Sub-scores strip */}
            <View style={styles.subScoreRow}>
              <SubScore label="Text" value={item.tfidf_score} />
              <SubScore label="Orientation" value={item.orientation_score} />
              <SubScore label="Specialism" value={item.specialism_score} />
            </View>

            {/* AI explanation */}
            <Text style={styles.explanation}>{item.explanation}</Text>

            {/* Book button */}
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: colour }]}
              onPress={() => navigation.navigate('Booking', {
                patientId,
                therapistId: item.therapist_id,
                therapistName: item.therapist_name,
                matchPercentage: pct,
              })}
            >
              <Text style={styles.bookBtnText}>
                Book with {item.therapist_name.split(' ').slice(-1)[0]}
              </Text>
            </TouchableOpacity>

          </View>
        );
      })}
    </ScrollView>
  );
}

function SubScore({ label, value }) {
  return (
    <View style={styles.subScoreItem}>
      <Text style={styles.subScoreValue}>{Math.round(value * 100)}%</Text>
      <Text style={styles.subScoreLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F3FF',
  },
  loadingText: { marginTop: 16, color: '#666', fontSize: 14 },

  heading: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subheading: { fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 18 },

  // Match card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  rankText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  nameBlock: { flex: 1 },
  therapistName: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 3 },
  specialisations: { fontSize: 12, color: '#777', lineHeight: 16 },

  // Match percentage badge
  matchBadge: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    marginLeft: 10,
    minWidth: 58,
  },
  matchPct: { fontSize: 18, fontWeight: 'bold', lineHeight: 22 },
  matchLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Sub-scores
  subScoreRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  subScoreItem: { alignItems: 'center' },
  subScoreValue: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 2 },
  subScoreLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.3 },

  explanation: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 14,
  },

  bookBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
