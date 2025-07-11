import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useHotel } from '../Screens/HotelContext';
const AboutUsScreen = () => {
  const { hotelFullName, hotelName } = useHotel();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{hotelFullName} - {hotelName}</Text>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: width - 40,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 5,
    color: '#555',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
});

export default AboutUsScreen;
