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
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const dbRooms = await dbService.getRoomsByType(type);
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

const shouldShowCheckoutIcon = (room) => {
  if (room.status !== 'Booked' || !room.enddate) return false;

  const endDate = new Date(room.enddate);
  if (isNaN(endDate.getTime())) {
    console.warn('Invalid endDate format:', room.enddate);
    return false;
  }
  const now = new Date();
  const timeDiffMs = endDate - now;
  const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
  return timeDiffHours <= 3 && timeDiffHours > 0;
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
        data={Object.keys(groupedByFloor)}
        keyExtractor={(item) => item}
        renderItem={({ item: floor }) => (
          <View style={styles.floorGroup}>
            <Text style={styles.floorTitle}>{floor}</Text>
            {groupedByFloor[floor].map((room) => {
              
              const showCheckoutWarning = shouldShowCheckoutIcon(room);

              return (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.item, getStatusStyle(room.status)]}
                  onPress={() => navigation.navigate('RoomDetails', { room })}
                >
                  <View style={styles.roomRow}>
                    <Text style={styles.text}>
                      Room {room.number} - {room.status}
                    </Text>
                    {showCheckoutWarning && 
                    (
                      <Icon
                        name="clock-alert"
                        size={20}
                        color="#e67e22"
                        style={styles.warningIcon}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
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
  warningIcon: {
    marginLeft: 10,
  },
});

export default RoomTypeScreen;
