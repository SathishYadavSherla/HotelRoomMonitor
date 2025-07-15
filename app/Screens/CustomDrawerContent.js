// CustomDrawerContent.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useHotel } from './HotelContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const CustomDrawerContent = (props) => {
    const { navigation } = props;

    const { hotelName } = useHotel();
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userSession');
            navigation.navigate('Hotel Information', {
                screen: 'LogIn',
            });
        } catch (err) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
            console.error('Logout error:', err);
        }
    };
    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />


            <TouchableOpacity
                style={{ padding: 16 }}
                onPress={() => {
                    navigation.navigate('Hotel Information', {
                        screen: 'LogIn',
                        params: {
                            fromChangePassword: true,
                            hotelCode: hotelName,
                        },
                    });
                }}
            >
                <Text>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{ padding: 16 }}
                onPress={handleLogout}
            >
                <Text>Logout</Text>
            </TouchableOpacity>

        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;
