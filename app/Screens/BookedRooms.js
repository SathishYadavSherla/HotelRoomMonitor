import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useLayoutEffect } from 'react';

const BookedRooms = ({ route, navigation }) => {
  const { rooms } = route.params;
  const { title } = route.params;
  useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Booked Rooms',
    });
  }, [navigation, title]);
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RoomDetails', { room: item })}
      style={styles.card}
    >

      <Text style={styles.title}>Room {item.number} ({item.type})</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      {title === 'Booked Rooms' && (<>
        <View style={styles.section}>
          <Text style={styles.label}>Member Name:</Text>
          <Text style={styles.value}>{item.memberName}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{item.memberPhone}</Text>
        </View>
      </>
      )}

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Booked Rooms</Text> */}
      {rooms.length === 0 ? (
        <Text style={styles.noData}>No {title} found.</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item, index) => item.number.toString() + index}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default BookedRooms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    color: '#2c3e50',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007bff',
    marginBottom: 10,
  },
  section: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginRight: 4,
  },
  value: {
    color: '#333',
    marginRight: 10,
  },
  noData: {
    alignSelf: 'center',
    fontSize: 16,
    color: '#888',
  },
  list: {
    paddingBottom: 20,
  },
});
