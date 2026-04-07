// screens/MatchResultsScreen.js
// Fetches and displays the ranked list of compatible therapists for a patient.
// Calls GET /matches/{patient_id} on the FastAPI backend.
// Each result card shows the therapist name, overall score, sub-scores,
// and the AI-generated explanation text.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';

// Backend base URL — must match the IP used in PatientIntakeForm
const API_BASE = 'http://192.168.1.149:8000';

export default function MatchResultsScreen({ route, navigation }) {

  // patient_id is passed as a navigation parameter from PatientIntakeForm
  const { patientId } = route.params;

  // State for the list of match results and loading indicator
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch matches from the backend when the screen mounts
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API_BASE}/matches/${patientId}`);
      setMatches(response.data.matches);
    } catch (error) {
      Alert.alert('Error', 'Could not load your matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Converts a score between 0 and 1 into a percentage string
  const formatScore = (score) => `${Math.round(score * 100)}%`;

  // Returns a colour based on the overall compatibility score
  const getScoreColour = (score) => {
    if (score >= 0.6) return '#2E7D6B';  // green — strong match
    if (score >= 0.35) return '#E67E22'; // orange — moderate match
    return '#C0392B';                     // red — weak match
  };

  // Renders a single therapist match card
  const renderMatch = ({ item, index }) => (
    <View style={styles.card}>

      {/* Rank badge and therapist name */}
      <View style={styles.cardHeader}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        <Text style={styles.therapistName}>{item.therapist_name}</Text>
      </View>

      {/* Overall compatibility score — displayed prominently */}
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Overall Match</Text>
        <Text style={[styles.scoreValue, { color: getScoreColour(item.overall_score) }]}>
          {formatScore(item.overall_score)}
        </Text>
      </View>

      {/* Sub-scores breakdown */}
      <View style={styles.subScores}>
        <View style={styles.subScoreItem}>
          <Text style={styles.subScoreLabel}>Text Similarity</Text>
          <Text style={styles.subScoreValue}>{formatScore(item.tfidf_score)}</Text>
        </View>
        <View style={styles.subScoreItem}>
          <Text style={styles.subScoreLabel}>Orientation</Text>
          <Text style={styles.subScoreValue}>{formatScore(item.orientation_score)}</Text>
        </View>
        <View style={styles.subScoreItem}>
          <Text style={styles.subScoreLabel}>Specialism</Text>
          <Text style={styles.subScoreValue}>{formatScore(item.specialism_score)}</Text>
        </View>
      </View>

      {/* AI-generated explanation text */}
      <Text style={styles.explanation}>{item.explanation}</Text>

      {/* Book appointment button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('Booking', {
          patientId,
          therapistId: item.therapist_id,
          therapistName: item.therapist_name,
        })}
      >
        <Text style={styles.bookButtonText}>Book with {item.therapist_name.split(' ')[1]}</Text>
      </TouchableOpacity>

    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text style={styles.loadingText}>Finding your best matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Compatible Therapists</Text>
      <Text style={styles.subheading}>
        Ranked by AI compatibility score based on your intake form.
      </Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.therapist_id.toString()}
        renderItem={renderMatch}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: '#6B4EFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subScores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  subScoreItem: {
    alignItems: 'center',
  },
  subScoreLabel: {
    fontSize: 11,
    color: '#777',
    marginBottom: 2,
  },
  subScoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  explanation: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  bookButton: {
    backgroundColor: '#6B4EFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
});