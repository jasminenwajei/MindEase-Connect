// screens/HomeScreen.js
// Landing screen for MindEase Connect.
// Allows the user to choose whether they are a patient or a therapist.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>

      {/* App title and tagline */}
      <View style={styles.header}>
        <Text style={styles.title}>MindEase Connect</Text>
        <Text style={styles.subtitle}>
          AI-powered therapist matching for better mental health outcomes
        </Text>
      </View>

      {/* Role selection prompt */}
      <Text style={styles.prompt}>I am a...</Text>

      {/* Patient button — navigates to the patient intake form */}
      <TouchableOpacity
        style={[styles.button, styles.patientButton]}
        onPress={() => navigation.navigate('PatientIntakeForm')}
      >
        <Text style={styles.buttonText}>Patient</Text>
        <Text style={styles.buttonSubtext}>
          Find a therapist matched to your needs
        </Text>
      </TouchableOpacity>

      {/* Therapist button — navigates to the therapist registration form */}
      <TouchableOpacity
        style={[styles.button, styles.therapistButton]}
        onPress={() => navigation.navigate('TherapistRegistration')}
      >
        <Text style={styles.buttonText}>Therapist</Text>
        <Text style={styles.buttonSubtext}>
          Register your profile and receive matched clients
        </Text>
      </TouchableOpacity>

      {/* Therapist dashboard — view booked appointments */}
      <TouchableOpacity
        style={[styles.button, styles.dashboardButton]}
        onPress={() => navigation.navigate('TherapistDashboard')}
      >
        <Text style={styles.buttonText}>Therapist Dashboard</Text>
        <Text style={styles.buttonSubtext}>
          View your upcoming booked appointments
        </Text>
      </TouchableOpacity>

      {/* Disclaimer clarifying prototype status */}
      <Text style={styles.disclaimer}>
        This is a prototype system for research purposes only.
        It is not a substitute for professional medical advice.
      </Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4EFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  patientButton: {
    backgroundColor: '#6B4EFF',
  },
  therapistButton: {
    backgroundColor: '#2E7D6B',
  },
  dashboardButton: {
    backgroundColor: '#1A5C4E',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 16,
  },
});