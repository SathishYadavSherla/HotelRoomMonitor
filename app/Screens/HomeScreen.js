//HomeScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, ActivityIndicator } from 'react-native';
import dbService from '../Services/dbService'; // Make sure path is correct
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AddRoomModal from './AddRoomModal'; // adjust the path if needed
import { useHotel } from './HotelContext';
import ScreenWrapper from './ScreenWrapper';


const HomeScreen = ({ route, navigation }) => {
  const { hotelName } = route.params ?? {};
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [addRoomVisible, setaddRoomVisible] = useState(false);
  const { setHotelName } = useHotel();
  const { setHotelFullName } = useHotel();

  useEffect(() => {
    setHotelName(hotelName);
  }, []);
  useEffect(() => {
    const fullName = route.params?.hotelFullName;
    if (fullName) {
      setHotelFullName(fullName);
    }
  }, [route.params]);
  useFocusEffect(
    useCallback(() => {
      initializeAndFetch();
    }, [hotelName])
  );

  const initializeAndFetch = async () => {
    try {
      setLoading(true);
      const fetchedRooms = await dbService.getRooms(hotelName);
      if (Array.isArray(fetchedRooms)) {
        setRooms(fetchedRooms);
        const uniqueTypes = [...new Set(fetchedRooms.map(room => room.type))];
        setRoomTypes(uniqueTypes);
      } else {
        console.error('Fetched data is not an array:', fetchedRooms);
        setRooms([]);
        setRoomTypes([]);
      }
    } catch (err) {
      console.error('Error in DB flow:', err);
    } finally {
      setLoading(false);
    }
  };

  const backPressCount = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (backPressCount.current === 0) {
          backPressCount.current += 1;
          Toast.show({
            type: 'info',
            text1: 'Press again to exit',
            position: 'bottom',
            visibilityTime: 2000,
          });

          setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        backPressCount.current = 0;
      };
    }, [])
  );
  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await dbService.getHistoryRooms(hotelName);
      navigation.navigate('CheckoutHistory', { historyData: data });
    } catch (error) {
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
      console.log(bookedRooms);

      navigation.navigate('BookedRooms', {
        rooms: bookedRooms,
        title: 'Booked Rooms',
        hotelName: hotelName,
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
        hotelName: hotelName,
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
      {roomTypes.length > 0 && (
        <Text style={styles.header}>Rooms Available</Text>
      )}
      {roomTypes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data found</Text>
        </View>
      ) : (
        <FlatList
          data={roomTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('RoomType', { type: item, hotelName: hotelName })}
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
        <TouchableOpacity style={[styles.bookedButton]} onPress={() => setaddRoomVisible(true)}>
          <Text style={styles.bookedButtonText}>Add Rooms</Text>
        </TouchableOpacity>
      </View>
      <AddRoomModal
        addRoomVisible={addRoomVisible}
        setaddRoomVisible={setaddRoomVisible}
        hotelName={hotelName}
        refreshRooms={initializeAndFetch}
      />
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  item: {
    padding: 20,
    backgroundColor: '#eee',
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  text: { fontSize: 18, color: 'black' },
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
    backgroundColor: '#e78617d7',
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    marginTop: 80,
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  innerWrapper: {
    width: '90%',
    height: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalContainer: {
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    flex: 1,
    backgroundColor: '#4480c0ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  inputGroup: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 300,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },


});
