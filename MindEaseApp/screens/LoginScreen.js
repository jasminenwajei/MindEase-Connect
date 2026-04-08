// screens/LoginScreen.js
// Prototype entry screen for MindEase Connect.
// Two role cards. Tapping a card expands it to reveal Log In / Sign Up options.
// Only one card is expanded at a time.
// Log In shows a numeric ID input; Sign Up navigates to the registration screen.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  LayoutAnimation,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation }) {
  // Which role card is expanded: null | 'patient' | 'therapist'
  const [expandedRole, setExpandedRole] = useState(null);
  // Whether the Log In sub-panel is open within the expanded card
  const [showLogin, setShowLogin] = useState(false);
  const [userId, setUserId] = useState('');

  const animate = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const handleRoleToggle = (role) => {
    animate();
    if (expandedRole === role) {
      setExpandedRole(null);
      setShowLogin(false);
      setUserId('');
    } else {
      setExpandedRole(role);
      setShowLogin(false);
      setUserId('');
    }
  };

  const handleLogInPress = () => {
    animate();
    setShowLogin(true);
    setUserId('');
  };

  const handleBackToChoice = () => {
    animate();
    setShowLogin(false);
    setUserId('');
  };

  const handleSignUp = () => {
    if (expandedRole === 'patient') {
      navigation.navigate('PatientIntakeForm');
    } else {
      navigation.navigate('TherapistRegistration');
    }
  };

  const handleContinue = () => {
    const id = parseInt(userId, 10);
    if (!userId || isNaN(id) || id <= 0) {
      Alert.alert('Invalid ID', 'Please enter a valid numeric ID to continue.');
      return;
    }
    if (expandedRole === 'patient') {
      navigation.navigate('PatientDashboard', { patientId: id });
    } else {
      navigation.navigate('TherapistDashboard', { therapistId: id });
    }
  };

  const isPatient = expandedRole === 'patient';
  const accent = isPatient ? '#6B4EFF' : '#2E7D6B';
  const accentLight = isPatient ? '#EDE9FF' : '#E6F5F1';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Branding ── */}
          <View style={styles.logoBlock}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitials}>MC</Text>
            </View>
            <Text style={styles.appName}>MindEase Connect</Text>
            <Text style={styles.tagline}>
              AI-powered therapist matching for better mental health outcomes
            </Text>
          </View>

          <Text style={styles.prompt}>Welcome — who are you?</Text>

          {/* ── Patient card ── */}
          <View style={[
            styles.card,
            expandedRole === 'patient' && { borderColor: '#6B4EFF', borderWidth: 2 },
          ]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => handleRoleToggle('patient')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>🧠</Text>
              <View style={styles.cardHeaderText}>
                <Text style={[
                  styles.cardTitle,
                  expandedRole === 'patient' && { color: '#6B4EFF' },
                ]}>
                  I'm a Patient
                </Text>
                <Text style={styles.cardSubtitle}>Find a matched therapist</Text>
              </View>
              <Text style={[
                styles.chevron,
                expandedRole === 'patient' && { color: '#6B4EFF' },
              ]}>
                {expandedRole === 'patient' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedRole === 'patient' && (
              <ExpandedBody
                accentColor="#6B4EFF"
                showLogin={showLogin}
                userId={userId}
                onUserIdChange={setUserId}
                onLogInPress={handleLogInPress}
                onSignUpPress={handleSignUp}
                onContinue={handleContinue}
                onBack={handleBackToChoice}
                loginLabel="patient"
              />
            )}
          </View>

          {/* ── Therapist card ── */}
          <View style={[
            styles.card,
            expandedRole === 'therapist' && { borderColor: '#2E7D6B', borderWidth: 2 },
          ]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => handleRoleToggle('therapist')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>🩺</Text>
              <View style={styles.cardHeaderText}>
                <Text style={[
                  styles.cardTitle,
                  expandedRole === 'therapist' && { color: '#2E7D6B' },
                ]}>
                  I'm a Therapist
                </Text>
                <Text style={styles.cardSubtitle}>View your appointments</Text>
              </View>
              <Text style={[
                styles.chevron,
                expandedRole === 'therapist' && { color: '#2E7D6B' },
              ]}>
                {expandedRole === 'therapist' ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedRole === 'therapist' && (
              <ExpandedBody
                accentColor="#2E7D6B"
                showLogin={showLogin}
                userId={userId}
                onUserIdChange={setUserId}
                onLogInPress={handleLogInPress}
                onSignUpPress={handleSignUp}
                onContinue={handleContinue}
                onBack={handleBackToChoice}
                loginLabel="therapist"
              />
            )}
          </View>

          <Text style={styles.disclaimer}>
            Prototype system for research purposes only.{'\n'}
            Not a substitute for professional medical advice.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Expanded body (Log In / Sign Up choice, then Log In panel) ─────────────
function ExpandedBody({
  accentColor, showLogin,
  userId, onUserIdChange,
  onLogInPress, onSignUpPress,
  onContinue, onBack, loginLabel,
}) {
  return (
    <View style={styles.cardBody}>
      {!showLogin ? (
        // Choice: Log In or Sign Up
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: accentColor }]}
            onPress={onLogInPress}
          >
            <Text style={[styles.actionBtnText, { color: accentColor }]}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtnFilled, { backgroundColor: accentColor }]}
            onPress={onSignUpPress}
          >
            <Text style={styles.actionBtnTextFilled}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Log In panel: ID input + Continue
        <View>
          <Text style={styles.idLabel}>
            Enter your{' '}
            <Text style={{ fontWeight: '700', color: '#222' }}>{loginLabel}</Text> ID
          </Text>
          <TextInput
            style={[styles.idInput, { borderColor: accentColor }]}
            value={userId}
            onChangeText={onUserIdChange}
            placeholder="e.g. 1"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={onContinue}
          />
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: accentColor }]}
            onPress={onContinue}
          >
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={onBack}>
            <Text style={[styles.backLinkText, { color: accentColor }]}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Branding
  logoBlock: {
    alignItems: 'center',
    marginBottom: 32,
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
    shadowOpacity: 0.3,
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
  },
  tagline: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },

  prompt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 16,
  },

  // Role cards
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  chevron: {
    fontSize: 12,
    color: '#AAA',
    marginLeft: 8,
  },

  // Expanded content
  cardBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnFilled: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  actionBtnTextFilled: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // Log In sub-panel
  idLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  idInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  continueBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 8,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },

  disclaimer: {
    fontSize: 11,
    color: '#C0C0C0',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 20,
  },
});
