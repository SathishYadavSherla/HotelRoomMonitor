import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Keyboard
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import dbService from '../Services/dbService';
import { ActivityIndicator } from 'react-native';
import { Alert } from 'react-native'; // make sure this is imported


const AddRoomModal = ({ addRoomVisible, setaddRoomVisible, hotelName, refreshRooms }) => {
  const [roomCount, setRoomCount] = useState(1);
  const [roomData, setRoomData] = useState([{ roomNumber: '', roomType: '' }]);
  const [errors, setErrors] = useState([{ roomNumber: '', roomType: '' }]);
  const [loading, setLoading] = useState(false); // instead of true


  useEffect(() => {
    if (!addRoomVisible) {
      setRoomData([{ roomNumber: '', roomType: '' }]);
      setErrors([{ roomNumber: '', roomType: '' }]);
      setRoomCount(1);
    }
  }, [addRoomVisible]);

  const increaseRooms = () => {
    setRoomCount(prev => prev + 1);
    setRoomData([...roomData, { roomNumber: '', roomType: '' }]);
    setErrors([...errors, { roomNumber: '', roomType: '' }]);
  };

  const decreaseRooms = () => {
    if (roomCount > 1) {
      setRoomCount(prev => prev - 1);
      setRoomData(roomData.slice(0, -1));
      setErrors(errors.slice(0, -1));
    }
  };

  const updateRoom = (index, key, value) => {
    const updatedRooms = [...roomData];
    updatedRooms[index][key] = value;
    setRoomData(updatedRooms);
  };


  const validateAndSave = async () => {
    Keyboard.dismiss();
    try {
      setLoading(true);
      const newErrors = roomData.map((room) => ({
        roomNumber: room.roomNumber ? '' : 'Room Number is required.',
        roomType: room.roomType ? '' : 'Room Type is required.',
      }));
      setErrors(newErrors);

      const hasError = newErrors.some(err => err.roomNumber || err.roomType);
      if (!hasError) {
        const result = await dbService.insertNewRoom(hotelName, roomData, 'Available');
        if (result.success) {
          const resetAndClose = () => {
            setRoomData([{ roomNumber: '', roomType: '' }]);
            setErrors([{ roomNumber: '', roomType: '' }]);
            setRoomCount(1);
            setaddRoomVisible(false);
            refreshRooms(); // <- ONLY refresh after alert is dismissed
          };

          if (result.skippedCount === 0) {
            Alert.alert(
              'Success',
              'Room(s) inserted successfully.',
              [{ text: 'OK', onPress: resetAndClose }],
              { cancelable: false }
            );
          } else {
            const skippedRooms = result.message.split(" already exist): ")[1] || '';
            Alert.alert(
              '',
              'Room Numbers ' + result.skippedRoomNumbers + 'are skipped to insert as they alreay exists',
              [{ text: 'OK', onPress: resetAndClose }],
              { cancelable: false }
            );
          }
        } else {
          Alert.alert('Error', 'Failed to insert rooms: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error in DB flow:', error);
    } finally {
      setLoading(false);
    }

  };

  const renderScrollContent = () => (
    <ScrollView
      contentContainerStyle={styles.modalContainer}
      keyboardShouldPersistTaps="handled"
    >
      {renderRoomInputs()}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#aaa', marginRight: 10 }]}
          onPress={() => setaddRoomVisible(false)}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={validateAndSave}
        >
          <Text style={styles.buttonText}>Add Room</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );



  const renderRoomInputs = () => (
    <>
      <View style={styles.counterRow}>
        <TouchableOpacity onPress={decreaseRooms}
          style={[
            styles.iconButton,
            roomCount === 1 && { backgroundColor: '#ccc' }
          ]}
          disabled={roomCount === 1}
        >
          <Text style={styles.iconText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.countText}>{roomCount}</Text>
        <TouchableOpacity onPress={increaseRooms} style={styles.iconButton}>
          <Text style={styles.iconText}>+</Text>
        </TouchableOpacity>

      </View>

      <Text style={styles.sectionLabel}>Room Number and Type</Text>

      {roomData.map((room, index) => (
        <View style={styles.rowContainer} key={index}>
          <View style={[styles.inputGroup, { marginRight: 10 }]}>
            <TextInput
              style={styles.input}
              placeholder="Room #"
              placeholderTextColor="#999"
              value={room.roomNumber}
              onChangeText={(text) => updateRoom(index, 'roomNumber', text)}
            />
            {errors[index]?.roomNumber && (
              <Text style={styles.error}>{errors[index].roomNumber}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={room.roomType}
                onValueChange={(value) => updateRoom(index, 'roomType', value)}
              >
                <Picker.Item label="Select type" value="" />
                <Picker.Item label="Deluxe" value="Deluxe" />
                <Picker.Item label="Suite" value="Suite" />
                <Picker.Item label="Standard" value="Standard" />
              </Picker>
            </View>
            {errors[index]?.roomType && (
              <Text style={styles.error}>{errors[index].roomType}</Text>
            )}
          </View>
        </View>
      ))}
    </>
  );

  return (
    <Modal animationType="fade" transparent={true} visible={addRoomVisible}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.innerWrapper}>
            {loading && (
              <View style={styles.loaderOverlay}>
                <View style={styles.loaderContainer}>
                  <Text style={{ color: 'white', marginBottom: 10 }}>Adding rooms...</Text>
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              </View>
            )}

            {roomCount > 10 ? (
              <View style={{ flex: 1 }}>
                <ScrollView
                  contentContainerStyle={styles.modalContainer}
                  keyboardShouldPersistTaps="handled"
                >
                  {renderRoomInputs()}
                </ScrollView>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#aaa', marginRight: 10 }]}
                    onPress={() => setaddRoomVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#007AFF' }]}
                    onPress={validateAndSave}
                  >
                    <Text style={styles.buttonText}>Add Room</Text>
                  </TouchableOpacity>

                </View>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={styles.modalContainer}
                keyboardShouldPersistTaps="handled"
              >
                {renderRoomInputs()}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#aaa', marginRight: 10 }]}
                    onPress={() => setaddRoomVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#007AFF' }]}
                    onPress={validateAndSave}
                  >
                    <Text style={styles.buttonText}>Add Room</Text>
                  </TouchableOpacity>

                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

};

const styles = StyleSheet.create({
  loaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  loaderContainer: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },

  overlay: {
    flex: 1,
    marginTop: 70,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
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
    padding: 20,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  countText: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  pickerWrapper: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default AddRoomModal;
