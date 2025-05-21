//AppNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screens/HomeScreen';  // Adjust path as needed
import RoomTypeScreen from '../Screens/RoomTypeScreen';  // Adjust path as needed
import RoomDetailsScreen from '../Screens/RoomDetailsScreen';  // Adjust path as needed
import AboutUsScreen from '../Screens/AboutUsScreen';  // Adjust path as needed
import ContactUsScreen from '../Screens/ContactUsScreen';  // Adjust path as needed
import BookedRooms from '../Screens/BookedRooms';  // Adjust path as needed
import CheckoutHistoryScreen from '../Screens/CheckoutHistoryScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// HomeStack containing RoomTypeScreen and RoomDetailsScreen
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }} 
    />
    <Stack.Screen
      name="RoomType"
      component={RoomTypeScreen}
      options={{ title: 'Room Type' }}  
    />
    <Stack.Screen
      name="RoomDetails"
      component={RoomDetailsScreen}
      options={{ title: 'Room Details' }}  
    />
    <Stack.Screen
      name="BookedRooms"
      component={BookedRooms}
      options={{ title: 'Booked Rooms' }}  
    />
    <Stack.Screen
      name="CheckoutHistory"
      component={CheckoutHistoryScreen}
      options={{ title: 'Checkout History' }}  
    />
    
  </Stack.Navigator>
);


// Drawer Navigator containing the main screens
const AppNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="Hotel Information">
      <Drawer.Screen
        name="Hotel Information"
        component={HomeStack}
        options={{ 
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#90746e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
         }}  // Hides header for the Home Stack
      />
      <Drawer.Screen name="About Us" component={AboutUsScreen} />
      <Drawer.Screen name="Contact Us" component={ContactUsScreen} />
    </Drawer.Navigator>
  );
};


export default AppNavigator;
