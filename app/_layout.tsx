//_layout.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../app/navigation/AppNavigator';  // Adjust the path as needed
import { HotelProvider } from '../app/Screens/HotelContext';

export default function App() {
  return (
    <HotelProvider>
      <AppNavigator />
    </HotelProvider>
  );
}
