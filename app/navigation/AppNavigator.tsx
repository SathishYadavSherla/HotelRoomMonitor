import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute, RouteProp, ParamListBase } from '@react-navigation/native';
import { TouchableOpacity, Text } from 'react-native';

import HomeScreen from '../Screens/HomeScreen';
import RoomTypeScreen from '../Screens/RoomTypeScreen';
import RoomDetailsScreen from '../Screens/RoomDetailsScreen';
import AboutUsScreen from '../Screens/AboutUsScreen';
import ContactUsScreen from '../Screens/ContactUsScreen';
import BookedRooms from '../Screens/BookedRooms';
import CheckoutHistoryScreen from '../Screens/CheckoutHistoryScreen';
import LoginScreen from '../Screens/LoginScreen';
import CustomDrawerContent from '../Screens/CustomDrawerContent';
import Camera from '../Screens/Camera';
import { useHotel } from '../Screens/HotelContext';


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();


// Home stack with nested screens
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="LogIn" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="RoomType" component={RoomTypeScreen} options={{ title: 'Room Type' }} />
    <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} options={{ title: 'Room Details' }} />
    <Stack.Screen name="BookedRooms" component={BookedRooms} options={{ title: 'Booked Rooms' }} />
    <Stack.Screen name="Camera" component={Camera} options={{ title: 'Camera' }} />
    <Stack.Screen name="CheckoutHistory" component={CheckoutHistoryScreen} options={{ title: 'Checkout History' }} />
  </Stack.Navigator>
);



// Main drawer navigation
const AppNavigator = () => {

  const { hotelFullName } = useHotel();
  // Function to control header visibility
  const getDrawerOptions = (route: RouteProp<ParamListBase, string>): DrawerNavigationOptions => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'LogIn';

    const showHeader = routeName === 'Home';

    return {
      headerShown: showHeader,
      headerTitle: hotelFullName ? `${hotelFullName} - Hotel Information` : 'Hotel Information',
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: '#90746e' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    };
  };

  return (
    <Drawer.Navigator initialRouteName="Hotel Information"
      drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Hotel Information"
        component={HomeStack}
        options={({ route }) => getDrawerOptions(route)}
      />
      <Drawer.Screen name="About Us" component={AboutUsScreen} />
      <Drawer.Screen name="Contact Us" component={ContactUsScreen} />
      {/* <Drawer.Screen name="Logout" component={LoginScreen} />
      <Drawer.Screen name="Change Password" component={ContactUsScreen} /> */}
    </Drawer.Navigator>
  );
};

export default AppNavigator;
