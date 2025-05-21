import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';

const AboutUsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../Images/swagath3.jpg')} // Adjust path relative to this file
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title}>About Our Hotel</Text>
      <Text style={styles.description}>
        Welcome to our hotel! Nestled in the heart of the city, our luxurious rooms,
        exceptional service, and attention to detail ensure a memorable stay. Whether
        you're here for business or leisure, we strive to offer an unforgettable experience.
      </Text>

      <Text style={styles.subheading}>Our Mission</Text>
      <Text style={styles.description}>
        Our mission is to provide a home away from home with unmatched hospitality
        and comfort. We value every guest and work hard to exceed expectations.
      </Text>

      <Text style={styles.subheading}>Contact Info</Text>
      <Text style={styles.description}>
        📍 123 Main Street, YourCity, Country{'\n'}
        📞 +1 234 567 890{'\n'}
        📧 contact@yourhotel.com
      </Text>
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
