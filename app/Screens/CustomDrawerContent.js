// CustomDrawerContent.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useHotel } from './HotelContext';

const CustomDrawerContent = (props) => {
    const { navigation } = props;

    const { hotelName } = useHotel();

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />

            {/* <TouchableOpacity
                style={{ padding: 16 }}
                onPress={() => {
                    navigation.navigate('LogIn', {
                        fromChangePassword: true,
                        hotelCode: hotelName,
                    });
                }}
            >
                <Text>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{ padding: 16 }}
                onPress={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'LogIn' }],
                    });
                }}
            >
                <Text>Logout</Text>
            </TouchableOpacity> */}
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
                onPress={() => {
                    navigation.navigate('Hotel Information', {
                        screen: 'LogIn',
                    });
                }}
            >
                <Text>Logout</Text>
            </TouchableOpacity>

        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;
