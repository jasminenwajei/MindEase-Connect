// App.js
// Entry point for MindEase Connect mobile application.
// Sets up the React Navigation stack so users can move between screens.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all screens
import HomeScreen from './screens/HomeScreen';
import PatientIntakeForm from './screens/PatientIntakeForm';
import MatchResultsScreen from './screens/MatchResultsScreen';
import BookingScreen from './screens/BookingScreen';
import TherapistRegistration from './screens/TherapistRegistration';

// Create the stack navigator instance
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#6B4EFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}