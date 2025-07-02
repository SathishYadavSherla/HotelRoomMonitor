// RoomDetailsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import dbService from '../Services/dbService'; // Make sure path is correct
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { showAlertWithNavigationReset } from './alertUtils';
import { Picker } from '@react-native-picker/picker';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
// import * as MediaLibrary from 'expo-media-library';
// import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';




const RoomDetailsScreen = ({ route }) => {
  const { room } = route.params;
  const { hotelName } = route.params;
  const navigation = useNavigation();
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantAdults, setTenantAdults] = useState('');
  const [tenantKids, setTenantKids] = useState('');
  const [tenantPurpose, setTenantPurpose] = useState('');
  const [tenantStartDate, setTenantStartDate] = useState(null);
  const [tenantEndDate, setTenantEndDate] = useState(null);
  const [roomNumber, setRoomNumber] = useState();
  const [roomType, setRoomType] = useState();
  const [roomStatus, setRoomStatus] = useState();
  const [price, setPrice] = useState('');
  const [modeOfPayment, setmodeOfPayment] = useState('');
  const [memberDetails, setMemberDetails] = useState();
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('12');
  const showDurationOptions = false;
  const [loading, setLoading] = useState(true);

  const today = new Date();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAdults, setEditAdults] = useState('');
  const [editKids, setEditKids] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editPaymentMode, setEditPaymentMode] = useState('');

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    // if (selectedDate && selectedDate >= today) {
    setStartDate(selectedDate);
    // } else if (selectedDate) {
    //   alert("Start date cannot be in the past");
    // }
  };


  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  useEffect(() => {

    if (memberDetails) {
      setEditName(memberDetails.name || '');
      setEditPhone(memberDetails.phone?.toString() || '');
      setEditAddress(tenantAddress || '');
      setEditAdults(tenantAdults?.toString() || '');
      setEditKids(tenantKids?.toString() || '');
      setEditPurpose(tenantPurpose || '');
      setEditStartDate(startDate ? formatDate(startDate) : '');
      setEditEndDate(endDate ? formatDate(endDate) : '');
      setEditPrice(price?.toString() || '');
      setEditPaymentMode(modeOfPayment || '');
    }
  }, [memberDetails, tenantAddress, tenantAdults, tenantKids, tenantPurpose, startDate, endDate, price, modeOfPayment]);


  useEffect(() => {
    (async () => {
      try {
        // const { status, canAskAgain, granted } = await Camera.requestCameraPermissionsAsync();
        // //console.log('Camera Permission Response:', { status, canAskAgain, granted });
        // setHasPermission(status === 'granted');
      } catch (error) {
        //console.error('Error requesting camera permission:', error);
      }
    })();

    if (room?.id) {
      loadRoom();
    }
  }, [room]);


  const loadRoom = async () => {
    try {
      const result = await dbService.getRoomsByID(hotelName, room.id);

      if (!result || result.length === 0) {
        Alert.alert('Room not found', `No details found for  room ID: ${room.id}`);
        return;
      }
      const latestRoom = result[0];
      setRoomStatus(latestRoom.status || '');
      setRoomNumber(latestRoom.number || '');
      setRoomType(latestRoom.type || '');
      setMemberDetails({
        name: latestRoom.memberName || '',
        phone: latestRoom.memberPhone || '',
      });
      setTenantAddress(latestRoom.memberAddress);
      setTenantAdults(latestRoom.adultsCount);
      setTenantKids(latestRoom.kidsCount);
      setTenantPurpose(latestRoom.visitPurpose);
      setTenantStartDate(latestRoom.startDate);
      setTenantEndDate(latestRoom.endDate);
      setStartDate(latestRoom.startDate);
      setEndDate(latestRoom.endDate);
      setPrice(latestRoom.price);
      setmodeOfPayment(latestRoom.modeOfPayment);
    } catch (error) {
      console.error('Failed to load room:', error);
      Alert.alert('Error', 'An error occurred while loading room details.');
    } finally {
      setLoading(false); // Set loading to false once data is loaded
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    if (!tenantName || !tenantPhone) {
      setLoading(false);
      Alert.alert('Please fill in all fields');
      return;
    }
    await dbService.addMemberToRoom(hotelName, room.id, roomNumber, roomType, 'Booking', tenantName, tenantPhone, tenantAddress, tenantAdults, tenantKids, tenantPurpose, startDate, endDate, price, modeOfPayment);
    setLoading(false);
    showAlertWithNavigationReset(
      navigation,
      'Booking Submitted',
      'Room has been booked successfully.',
      'Home',
      { hotelName }
    );

  };


  const checkOut = async () => {
    setLoading(true);
    await dbService.addMemberToRoom(hotelName, room.id, roomNumber, roomType, 'CheckOut', tenantName, tenantPhone, tenantAddress, tenantAdults, tenantKids, tenantPurpose, startDate, endDate, price, modeOfPayment);
    setLoading(false);
    showAlertWithNavigationReset(navigation, 'Chekout Done', 'Check out is done successfully.', 'Hotel Information', 'Home', { hotelName });
  }

  const chnageToAvailable = async () => {
    setLoading(true);
    await dbService.addMemberToRoom(hotelName, room.id, roomNumber, roomType, 'Available', '', '', '', '', '', '', '', '', '', '', '');
    setLoading(false);
    showAlertWithNavigationReset(navigation, 'Available', 'This room will be available from now.', 'Hotel Information', 'Home', { hotelName });
  }


  const formatDate = (date) => {
    if (!date) return '';

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return '';

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return parsedDate.toLocaleDateString('en-US', options);
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Optional tuning
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
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

        <Text style={styles.header}>Room {roomNumber} Details</Text>
        <Text>Type: {roomType}</Text>
        <Text>Status: {roomStatus}</Text>

        {roomStatus === 'Booked' && memberDetails && (
          <View style={styles.memberContainer}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 10, right: 10 }}
              onPress={() => setEditModalVisible(true)}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'blue' }}>Edit</Text>
            </TouchableOpacity>
            <Modal
              visible={isEditModalVisible}
              animationType="slide"
              transparent={true}
            >
              <View style={{
                flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center', alignItems: 'center'
              }}>
                <View style={{
                  backgroundColor: 'white', padding: 20,
                  borderRadius: 10, width: '90%'
                }}>
                  <ScrollView>
                    <TextInput placeholder="Name" value={editName} onChangeText={setEditName} style={styles.input} />
                    <TextInput placeholder="Phone" value={editPhone} onChangeText={setEditPhone} style={styles.input} keyboardType="phone-pad" />
                    <TextInput placeholder="Address" value={editAddress} onChangeText={setEditAddress} style={styles.input} />
                    <TextInput placeholder="# Adults" value={editAdults} onChangeText={setEditAdults} style={styles.input} keyboardType="numeric" />
                    <TextInput placeholder="# Kids" value={editKids} onChangeText={setEditKids} style={styles.input} keyboardType="numeric" />
                    <TextInput placeholder="Purpose" value={editPurpose} onChangeText={setEditPurpose} style={styles.input} />
                    <TextInput placeholder="Start Date" value={editStartDate} onChangeText={setEditStartDate} style={styles.input} />
                    <TextInput placeholder="End Date" value={editEndDate} onChangeText={setEditEndDate} style={styles.input} />
                    <TextInput placeholder="Price" value={editPrice} onChangeText={setEditPrice} style={styles.input} keyboardType="numeric" />
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={editPaymentMode}
                        onValueChange={(itemValue) => {
                          if (itemValue !== "") {
                            setmodeOfPayment(itemValue);
                          }
                        }}
                        dropdownIconColor="gray"
                        style={styles.picker} // Apply internal picker style
                      >
                        <Picker.Item label="Select Payment Method" value="" color="#888" />
                        <Picker.Item label="UPI" value="UPI" />
                        <Picker.Item label="Cash" value="Cash" />
                        <Picker.Item label="Credit Card" value="Credit Card" />
                        <Picker.Item label="Debit Card" value="Debit Card" />
                      </Picker>
                    </View>
                  </ScrollView>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
                    <Button title="Save" onPress={async () => {
                      await dbService.addMemberToRoom(hotelName, room.id, room.number, room.type, room.status, editName, editPhone, editAddress, editAdults, editKids, editPurpose, editStartDate, editEndDate, editPrice, editPaymentMode);             // await dbService.updateMemberDetailsOnly(
                      setTenantName(editName);
                      setTenantPhone(editPhone);
                      setTenantAddress(editAddress);
                      setTenantAdults(editAdults);
                      setTenantKids(editKids);
                      setTenantPurpose(editPurpose);
                      setStartDate(editStartDate);
                      setEndDate(editEndDate);
                      setPrice(editPrice);
                      setmodeOfPayment(editPaymentMode);

                      setEditModalVisible(false);
                    }} />

                  </View>
                </View>
              </View>
            </Modal>

            <Text style={styles.subHeader}>Member Details:</Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}>Customer Name: </Text>
              {memberDetails.name}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}>Customer Phone: </Text>
              {memberDetails.phone}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}>Address: </Text>
              {tenantAddress}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}># of Adults: </Text>
              {tenantAdults}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}># of Kids: </Text>
              {tenantKids}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}>Visit Purpose: </Text>
              {tenantPurpose}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}>Start Date: </Text>
              {formatDate(tenantStartDate)}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}>End Date: </Text>
              {formatDate(tenantEndDate)}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}>Price: </Text>
              {room.price}
            </Text>

            <Text>
              <Text style={{ fontWeight: 'bold' }}>Mode of Payment: </Text>
              {room.modeOfPayment}
            </Text>

            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <Button title="Check Out" onPress={checkOut} />
            </View>
          </View>
        )}


        {roomStatus === 'Available' && (
          <View style={styles.formContainer}>
            <Text style={styles.subHeader}>Enter Customer Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={tenantName}
              onChangeText={(text) => {
                // Allow only letters and spaces
                const filteredText = text.replace(/[^A-Za-z\s]/g, '');
                setTenantName(filteredText);
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={tenantPhone}
              onChangeText={(text) => {
                // Allow only numbers, and restrict length to 10 digits
                const filteredText = text.replace(/[^0-9]/g, '').slice(0, 10);
                setTenantPhone(filteredText);
              }}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={tenantAddress}
              onChangeText={setTenantAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="No.Of Adults"
              value={tenantAdults}
              keyboardType="phone-pad"
              onChangeText={setTenantAdults}
            />
            <TextInput
              style={styles.input}
              placeholder="No.Of Kids"
              value={tenantKids}
              keyboardType="phone-pad"
              onChangeText={setTenantKids}
            />
            <TextInput
              style={styles.input}
              placeholder="Visit Purpose"
              value={tenantPurpose}
              onChangeText={setTenantPurpose}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={modeOfPayment}
                onValueChange={(itemValue) => {
                  if (itemValue !== "") {
                    setmodeOfPayment(itemValue);
                  }
                }}
                dropdownIconColor="gray"
                style={styles.picker} // Apply internal picker style
              >
                <Picker.Item label="Select Payment Method" value="" color="#888" />
                <Picker.Item label="UPI" value="UPI" />
                <Picker.Item label="Cash" value="Cash" />
                <Picker.Item label="Credit Card" value="Credit Card" />
                <Picker.Item label="Debit Card" value="Debit Card" />
              </Picker>
            </View>


            <View>
              {/* Start Date Field */}
              <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
                <Text style={{ color: startDate ? "black" : "#aaa" }}>
                  {startDate ? formatDate(startDate) : "Select Start Date"}
                </Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate || new Date()} // fallback if null
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={onStartDateChange}
                />
              )}

              {/* End Date Field */}
              <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
                <Text style={{ color: endDate ? "black" : "#aaa" }}>
                  {endDate ? formatDate(endDate) : "Select End Date"}
                </Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate || new Date()} // fallback if null
                  mode="date"
                  display="default"
                  minimumDate={startDate || new Date()}
                  onChange={onEndDateChange}
                />
              )}


            </View>

            {/* <View style={styles.containerr}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View> */}


            {/* Radio Buttons for Duration */}
            {showDurationOptions && (<View style={{ flexDirection: 'row', marginTop: 30, alignItems: 'center', justifyContent: 'center', visibility: false }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                onPress={() => setSelectedDuration('12')}
              >
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#000',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedDuration === '12' && (
                    <View style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                      backgroundColor: '#000',
                    }} />
                  )}
                </View>
                <Text style={{ marginLeft: 8 }}>12 hours</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => setSelectedDuration('24')}
              >
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#000',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedDuration === '24' && (
                    <View style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                      backgroundColor: '#000',
                    }} />
                  )}
                </View>
                <Text style={{ marginLeft: 8 }}>24 hours</Text>
              </TouchableOpacity>
            </View>
            )}

            {/* 
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.imagePreview} />
          )} */}

            <View style={{ marginTop: 50, alignItems: 'center' }}>
              <Button title="Book Room" onPress={handleBooking} />
            </View>
          </View>
        )}

        {roomStatus === 'Cleaning' && (
          <View style={styles.formContainer}>
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Button title="Change the Status to Available" onPress={chnageToAvailable} />
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );

};

export default RoomDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 10 },
  subHeader: { fontSize: 18, marginTop: 20, marginBottom: 10 },
  memberContainer: { marginTop: 10, padding: 10, backgroundColor: '#eee' },
  formContainer: { marginTop: 20 },
  input: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  // cameraContainer: {
  //   height: 300,
  //   marginTop: 20,
  //   overflow: 'hidden',
  //   borderRadius: 10,
  // },
  // camera: {
  //   flex: 1,
  // },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  buttonText: { color: 'white', fontSize: 16 },
  checkOut: { marginTop: 20, },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: 'center',
    height: 44, // Matches typical TextInput height
  },

  picker: {
    height: 100,
    width: '100%',
  },
  containerr: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  // camera: {
  //   flex: 1,
  // },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },

});
