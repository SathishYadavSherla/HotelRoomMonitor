//HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList,Modal,ActivityIndicator } from 'react-native';
import dbService from '../Services/dbService'; // Make sure path is correct

const HomeScreen = ({ navigation }) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading
  const [rooms, setRooms] = useState([]);
  
  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        const fetchedRooms = await dbService.getRooms();
        setRooms(fetchedRooms); 
        const uniqueTypes = [...new Set(fetchedRooms.map(room => room.type))];
        setRoomTypes(uniqueTypes);
      } catch (err) {
        console.error('Error in DBb fdlow:', err);
      }finally {
        setLoading(false); 
      }
    };
    initializeAndFetch();
  }, []);

  const loadHistory = async () => {
    try{
    setLoading(true);
    const data = await dbService.getHistoryRooms(); 
    console.log('Fetched history:', data);
    navigation.navigate('CheckoutHistory', { historyData: data });
    }catch (error) {
      console.error('Failed to fetch booked rooms:', error);
    } finally {
      setLoading(false);
    }
  };
const fetchBookedRooms = async () => {
  try {
    setLoading(true);

    const bookedRooms = rooms
      .filter(room => room.status === 'Booked')
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); 

    navigation.navigate('BookedRooms', {
      rooms: bookedRooms,
      title: 'Booked Rooms',
    });
  } catch (error) {
    console.error('Error fetching booked rooms:', error);
  } finally {
    setLoading(false);
  }
};



  const fetchCleaningRooms = async () => {
  try {
    setLoading(true);
    const bookedRooms = rooms.filter(room => room.status === 'Cleaning');
    navigation.navigate('BookedRooms', {
  rooms: bookedRooms,
  title: 'Rooms Under Cleaning',
});
  } catch (error) {
    console.error('Failed to fetch booked rooms:', error);
  } finally {
    setLoading(false);
  }
};

  

  return (
    <View style={styles.container}>
            <Modal
              visible={loading}
              transparent={true}
              animationType="none"
              statusBarTranslucent={true}
            >
              <View style={styles.modalOverlay}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            </Modal>
      <Text style={styles.header}>Rooms Available</Text>
      {roomTypes.length === 0 ? (
        <Text>No data found</Text>
      ) : (
        <FlatList
          data={roomTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('RoomType', { type: item })}
            >
              <Text style={styles.text}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

    <View style={styles.bottomButtons}>
      <TouchableOpacity style={styles.bookedButton} onPress={fetchBookedRooms}>
        <Text style={styles.bookedButtonText}>Booked Rooms</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bookedButton} onPress={fetchCleaningRooms}>
        <Text style={styles.bookedButtonText}>Rooms Under Cleaning</Text>
      </TouchableOpacity>
            <TouchableOpacity style={styles.bookedButton} onPress={loadHistory}>
        <Text style={styles.bookedButtonText}>View Checkout History</Text>
      </TouchableOpacity>
    </View>

    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    fontSize: 24,
    marginBottom: 20,
    alignSelf: 'center',
  },
  item: {
    padding: 20,
    backgroundColor: '#eee',
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  text: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
 bottomButtons: {
  position: 'absolute',
  bottom: 20,
  left: 20,
  right: 20,
  gap: 10, 
},

bookedButton: {
  backgroundColor: '#007bff',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  marginBottom: 10, 
},

bookedButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

});
