import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dbService from '../Services/dbService';

const getFloor = (roomNumber) => {
  if (roomNumber.startsWith('1')) return '1st Floor';
  if (roomNumber.startsWith('2')) return '2nd Floor';
  if (roomNumber.startsWith('3')) return '3rd Floor';
  return 'Other';
};

const RoomTypeScreen = ({ route, navigation }) => {
  const { type } = route.params;
  const { hotelName } = route.params;
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [bookedRoomToMove, setBookedRoomToMove] = useState(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const dbRooms = await dbService.getRoomsByType(hotelName, type);
        setRooms(dbRooms);
      } catch (error) {
        console.error('Failed to load rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [type]);

  const filteredRooms = rooms.filter((room) => {
    const roomNumber = (room.number || '').toString().toLowerCase();
    const matchesSearch = roomNumber.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (room.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const groupedByFloor = filteredRooms.reduce((acc, room) => {
    const floor = getFloor(room.number?.toString() || '');
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const shouldShowMoveIcon = (room) => {
    if (room.status === 'Booked')
      return true;
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

      <Text style={styles.header}>{type} Rooms</Text>

      <TextInput
        placeholder="Search by room number"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.filterRow}>
        {['All', 'Available', 'Booked', 'Cleaning'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              status === statusFilter && styles.activeFilter,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={Object.keys(groupedByFloor).sort((a, b) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          return numA - numB;
        })}
        keyExtractor={(item) => item}
        renderItem={({ item: floor }) => (
          <View style={styles.floorGroup}>
            <Text style={styles.floorTitle}>{floor}</Text>
            {groupedByFloor[floor].map((room) => {

              const showMoveIcon = shouldShowMoveIcon(room);

              return (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.item, getStatusStyle(room.status)]}
                  onPress={() => navigation.navigate('RoomDetails', { room, hotelName })}
                >
                  <View style={styles.roomRow}>
                    <Text style={styles.text}>
                      Room {room.number} - {room.status}
                    </Text>

                    {showMoveIcon && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation?.();
                          const availableRoomsOfSameType = rooms.filter(
                            (r) => r.status === 'Available' && r.type === room.type
                          );

                          if (availableRoomsOfSameType.length > 0) {
                            setBookedRoomToMove(room);
                            setMoveModalVisible(true);
                          } else {
                            Alert.alert('No Available Rooms', `No available "${room.type}" rooms found to move the booking.`);
                          }
                        }}
                        style={{
                          width: 40,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: 'white', // light orange background
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 20,
                        }}
                      >
                        <Icon
                          name="swap-vertical"
                          size={25}
                          color="#e67e22"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>

              );
            })}
          </View>
        )}
      />
      <Modal
        visible={moveModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.item, { backgroundColor: '#fff', width: '80%', height: '80%' }]}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30, marginTop: 10 }}>
              Move booking from Room {bookedRoomToMove?.number}  ➡
            </Text>

            {rooms
              .filter(
                (r) => r.status === 'Available' && r.type === bookedRoomToMove?.type
              )
              .sort((a, b) => parseInt(a.number) - parseInt(b.number))
              .map((targetRoom) => (
                <TouchableOpacity
                  key={targetRoom.id}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderColor: '#ddd',
                    marginBottom: 10,
                  }}
                  onPress={() => {
                    const fromRoom = bookedRoomToMove.number;
                    const toRoom = targetRoom.number;
                    if (!toRoom) return;
                    setTimeout(() => {
                      Alert.alert(
                        'Confirm Move',
                        `Move booking from Room ${fromRoom} to Room ${toRoom}?`,
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'OK',
                            onPress: async () => {
                              setLoading(true);
                              try {
                                const result = await dbService.moveRoomBooking(hotelName, fromRoom, toRoom);
                                if (result?.success) {
                                  setBookedRoomToMove(null);
                                  setMoveModalVisible(false);
                                  Alert.alert("Success", result.message);
                                  const updatedRooms = await dbService.getRoomsByType(hotelName, type);
                                  setRooms(updatedRooms);
                                } else {
                                  Alert.alert("Error", result?.message || "Move failed");
                                }
                              } catch (error) {
                                Alert.alert('Error', 'Failed to move booking.');
                              } finally {
                                setLoading(false);
                              }
                            },
                          },
                        ]
                      );
                    }, 300);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>Room {targetRoom.number}</Text>
                </TouchableOpacity>
              ))}

            <TouchableOpacity
              onPress={() => setMoveModalVisible(false)}
              style={{
                marginTop: 300,
                alignSelf: 'center',
                backgroundColor: 'red',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3, // Android shadow
              }}
            >
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>

  );

};

const getStatusStyle = (status) => {
  if (status === 'Available') return { backgroundColor: '#d4edda' };
  if (status === 'Booked') return { backgroundColor: '#f8d7da' };
  if (status === 'Cleaning') return { backgroundColor: '#fff3cd' };
  return {};
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 10 },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#add8e6',
  },
  floorGroup: {
    marginBottom: 20,
  },
  floorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  item: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

});

export default RoomTypeScreen;
