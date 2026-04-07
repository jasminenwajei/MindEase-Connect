// screens/LoginScreen.js
// Prototype login screen for MindEase Connect.
// No real authentication — collects a role selection and numeric user ID,
// then routes patients to the intake form and therapists to the dashboard.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState(null);   // 'patient' | 'therapist' | null
  const [userId, setUserId] = useState('');

  // Slide-in animation for the ID panel
  const slideAnim = useRef(new Animated.Value(0)).current;

  const selectRole = (selected) => {
    setRole(selected);
    setUserId('');
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start();
  };

  const handleContinue = () => {
    const id = parseInt(userId, 10);
    if (!userId || isNaN(id) || id <= 0) {
      Alert.alert('Invalid ID', 'Please enter a valid numeric ID to continue.');
      return;
    }

    if (role === 'patient') {
      navigation.navigate('PatientIntakeForm', { patientId: id });
    } else {
      navigation.navigate('TherapistDashboard', { therapistId: id });
    }
  };

  const idPanelStyle = {
    opacity: slideAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>

          {/* ── Logo / branding ── */}
          <View style={styles.logoBlock}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitials}>MC</Text>
            </View>
            <Text style={styles.appName}>MindEase Connect</Text>
            <Text style={styles.tagline}>
              AI-powered therapist matching for better mental health outcomes
            </Text>
          </View>

          {/* ── Role buttons ── */}
          <Text style={styles.prompt}>Who are you?</Text>

          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'patient' && styles.roleButtonActivePatient,
              ]}
              onPress={() => selectRole('patient')}
              activeOpacity={0.8}
            >
              <Text style={styles.roleIcon}>🧠</Text>
              <Text style={[styles.roleLabel, role === 'patient' && styles.roleLabelActive]}>
                I'm a Patient
              </Text>
              <Text style={[styles.roleSubtext, role === 'patient' && styles.roleSubtextActive]}>
                Find a matched therapist
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'therapist' && styles.roleButtonActiveTherapist,
              ]}
              onPress={() => selectRole('therapist')}
              activeOpacity={0.8}
            >
              <Text style={styles.roleIcon}>🩺</Text>
              <Text style={[styles.roleLabel, role === 'therapist' && styles.roleLabelActive]}>
                I'm a Therapist
              </Text>
              <Text style={[styles.roleSubtext, role === 'therapist' && styles.roleSubtextActive]}>
                View your appointments
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── ID input panel (slides in after role chosen) ── */}
          {role !== null && (
            <Animated.View style={[styles.idPanel, idPanelStyle]}>
              <Text style={styles.idLabel}>
                Enter your{' '}
                <Text style={styles.idLabelBold}>
                  {role === 'patient' ? 'patient' : 'therapist'}
                </Text>{' '}
                ID
              </Text>
              <TextInput
                style={[
                  styles.idInput,
                  role === 'therapist' && styles.idInputTherapist,
                ]}
                value={userId}
                onChangeText={setUserId}
                placeholder="e.g. 1"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  role === 'therapist' && styles.continueButtonTherapist,
                ]}
                onPress={handleContinue}
                activeOpacity={0.85}
              >
                <Text style={styles.continueText}>Continue →</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ── Footer disclaimer ── */}
          <Text style={styles.disclaimer}>
            Prototype system for research purposes only.{'\n'}
            Not a substitute for professional medical advice.
          </Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 24,
  },

  // Logo block
  logoBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6B4EFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logoInitials: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6B4EFF',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },

  // Role selection
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 14,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleButtonActivePatient: {
    borderColor: '#6B4EFF',
    backgroundColor: '#EDE9FF',
  },
  roleButtonActiveTherapist: {
    borderColor: '#2E7D6B',
    backgroundColor: '#E6F5F1',
  },
  roleIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  roleLabelActive: {
    color: '#333',
  },
  roleSubtext: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  roleSubtextActive: {
    color: '#666',
  },

  // ID input panel
  idPanel: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  idLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  idLabelBold: {
    fontWeight: '700',
    color: '#333',
  },
  idInput: {
    borderWidth: 2,
    borderColor: '#6B4EFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  idInputTherapist: {
    borderColor: '#2E7D6B',
  },
  continueButton: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonTherapist: {
    backgroundColor: '#2E7D6B',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },

  // Footer
  disclaimer: {
    fontSize: 11,
    color: '#BBB',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 8,
  },
});
