//_layout.tsx
import React from 'react';
import AppNavigator from '../app/navigation/AppNavigator';
import { HotelProvider } from '../app/Screens/HotelContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <HotelProvider>
      <AppNavigator />
    </HotelProvider>
  );
}
