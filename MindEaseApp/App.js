// App.js
// Entry point for MindEase Connect mobile application.
// Sets up the React Navigation stack so users can move between screens.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PatientIntakeForm from './screens/PatientIntakeForm';
import MatchResultsScreen from './screens/MatchResultsScreen';
import BookingScreen from './screens/BookingScreen';
import TherapistRegistration from './screens/TherapistRegistration';
import TherapistDashboard from './screens/TherapistDashboard';

// Create the stack navigator instance
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#6B4EFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* Login is the entry point — no header on this screen */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'MindEase Connect' }}
        />
        <Stack.Screen
          name="PatientIntakeForm"
          component={PatientIntakeForm}
          options={{ title: 'Patient Intake Form' }}
        />
        <Stack.Screen
          name="MatchResults"
          component={MatchResultsScreen}
          options={{ title: 'Your Matches' }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ title: 'Book Appointment' }}
        />
        <Stack.Screen
          name="TherapistRegistration"
          component={TherapistRegistration}
          options={{ title: 'Therapist Registration' }}
        />
        <Stack.Screen
          name="TherapistDashboard"
          component={TherapistDashboard}
          options={{ title: 'Therapist Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
