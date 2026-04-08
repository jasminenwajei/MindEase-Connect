// screens/LoginScreen.js
// Prototype entry screen for MindEase Connect.
// Two role cards. Tapping a card expands it to reveal Log In / Sign Up options.
// Log In collects email + 4-digit PIN and calls POST /auth/login/.

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
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const API_BASE = 'http://192.168.1.149:8000';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation }) {
  const [expandedRole, setExpandedRole] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const animate = () =>
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const handleRoleToggle = (role) => {
    animate();
    if (expandedRole === role) {
      setExpandedRole(null);
      setShowLogin(false);
      setEmail('');
      setPin('');
      setError('');
    } else {
      setExpandedRole(role);
      setShowLogin(false);
      setEmail('');
      setPin('');
      setError('');
    }
  };

  const handleLogInPress = () => {
    animate();
    setShowLogin(true);
    setEmail('');
    setPin('');
    setError('');
  };

  const handleBackToChoice = () => {
    animate();
    setShowLogin(false);
    setEmail('');
    setPin('');
    setError('');
  };

  const handleSignUp = () => {
    if (expandedRole === 'patient') {
      navigation.navigate('PatientIntakeForm');
    } else {
      navigation.navigate('TherapistRegistration');
    }
  };

  const handleLogIn = async () => {
    if (!email || !pin) {
      setError('Please enter your email and PIN.');
      return;
    }
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/auth/login/`, {
        email,
        pin,
        role: expandedRole,
      });

      const { user_id, role } = response.data;

      if (role === 'patient') {
        navigation.navigate('PatientDashboard', { patientId: user_id });
      } else {
        navigation.navigate('TherapistDashboard', { therapistId: user_id });
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 401) {
        setError('Incorrect email or PIN. Please try again.');
      } else {
        setError(detail || 'Could not connect to the server.');
      }
    } finally {
      setLoading(false);
    }
  };

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
                email={email}
                pin={pin}
                onEmailChange={setEmail}
                onPinChange={setPin}
                onLogInPress={handleLogInPress}
                onSignUpPress={handleSignUp}
                onLogIn={handleLogIn}
                onBack={handleBackToChoice}
                loading={loading}
                error={error}
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
                email={email}
                pin={pin}
                onEmailChange={setEmail}
                onPinChange={setPin}
                onLogInPress={handleLogInPress}
                onSignUpPress={handleSignUp}
                onLogIn={handleLogIn}
                onBack={handleBackToChoice}
                loading={loading}
                error={error}
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

// ── Expanded body ────────────────────────────────────────────────────────────
function ExpandedBody({
  accentColor, showLogin,
  email, pin, onEmailChange, onPinChange,
  onLogInPress, onSignUpPress,
  onLogIn, onBack,
  loading, error,
}) {
  return (
    <View style={styles.cardBody}>
      {!showLogin ? (
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
        <View>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={[styles.fieldInput, { borderColor: accentColor }]}
            value={email}
            onChangeText={onEmailChange}
            placeholder="e.g. alex@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>4-digit PIN</Text>
          <TextInput
            style={[styles.pinInput, { borderColor: accentColor }]}
            value={pin}
            onChangeText={(t) => onPinChange(t.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="••••"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            returnKeyType="done"
            onSubmitEditing={onLogIn}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator size="small" color={accentColor} style={{ marginVertical: 14 }} />
          ) : (
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: accentColor }]}
              onPress={onLogIn}
            >
              <Text style={styles.continueBtnText}>Log In →</Text>
            </TouchableOpacity>
          )}

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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  fieldInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  pinInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#FAFAFA',
    letterSpacing: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#D32F2F',
    marginTop: 8,
    textAlign: 'center',
  },
  continueBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
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
