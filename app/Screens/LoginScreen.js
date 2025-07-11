//LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Keyboard,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StatusBar, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import dbService from '../Services/dbService';
import { useRoute } from '@react-navigation/native';
import ScreenWrapper from './ScreenWrapper';
import { useHotel } from './HotelContext';


const LoginScreen = ({ navigation }) => {
  const [hotelName, setHotelName] = useState('');
  const { hotelFullName, setHotelFullName } = useHotel(); // ✅ use hotel context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureTextNew, setSecureTextNew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [registerHotelName, setRegisterHotelName] = useState('');
  const [registerPlace, setRegisterPlace] = useState('');
  const [registerMobile, setRegisterMobile] = useState('');
  const [registerEmailID, setRegisterEmailID] = useState('');
  const [registerOwner, setRegisterOwner] = useState('');
  const [registerHotelNameError, setRegisterHotelNameError] = useState('');
  const [registerOwnerError, setRegisterOwnerError] = useState('');
  const [registerPlaceError, setRegisterPlaceError] = useState('');
  const [registerMobileError, setRegisterMobileError] = useState('');
  const [registerEmailIDError, setRegisterEmailIDError] = useState('');

  const route = useRoute();
  const fromChangePassword = route.params?.fromChangePassword ?? false;
  const hotelCodeParam = route.params?.hotelCode ?? '';

  useEffect(() => {
    if (fromChangePassword && hotelCodeParam) {
      setHotelName(hotelCodeParam);
    }
  }, [fromChangePassword, hotelCodeParam]);

  const handleLogin = async () => {
    if (!hotelName || !username || !password || (fromChangePassword && !newPassword)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      if (fromChangePassword) {
        const updateResponse = await dbService.updatePassword(hotelName, username, newPassword, password);
        if (updateResponse.success) {
          Alert.alert('Success', 'Password changed successfully');
          const loginResponse = await dbService.createSheetsAndSaveCredentials(hotelName, username, newPassword);
          if (loginResponse.success) {
            navigation.navigate('Home', { hotelName });
            setHotelName('');
            setUsername('');
            setPassword('');
            setNewPassword('');
          } else {
            Alert.alert('Error', 'Auto-login failed');
          }
        } else {
          Alert.alert('Error', updateResponse.message || 'Password update failed');
        }
      } else {
        const response = await dbService.createSheetsAndSaveCredentials(hotelName, username, password);
        setHotelFullName(response.hotelFullName);
        if (response.success) {
          navigation.navigate('Home', { hotelName, hotelFullName: response.hotelFullName })
          setHotelName('');
          setUsername('');
          setPassword('');
        } else {
          Alert.alert('Error', response.message || 'Something went wrong');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to contact server');
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const RegisterYourHotel = async () => {
    setRegisterHotelNameError('');
    setRegisterOwnerError('');
    setRegisterPlaceError('');
    setRegisterMobileError('');
    setRegisterEmailIDError('');

    let hasError = false;

    if (!registerHotelName) {
      setRegisterHotelNameError('Hotel name is required');
      hasError = true;
    }
    if (!registerOwner) {
      setRegisterOwnerError('Owner name is required');
      hasError = true;
    }
    if (!registerPlace) {
      setRegisterPlaceError('Address is required');
      hasError = true;
    }
    if (!registerMobile) {
      setRegisterMobileError('Mobile number is required');
      hasError = true;
    } else if (registerMobile.length !== 10) {
      setRegisterMobileError('Please enter a valid Mobile number');
      hasError = true;
    }
    if (!registerEmailID) {
      setRegisterEmailIDError('Email ID is required');
      hasError = true;
    } else if (!isValidEmail(registerEmailID)) {
      setRegisterEmailIDError('Please enter a valid email address');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const response = await dbService.registerHotel(
        registerHotelName,
        registerPlace,
        registerMobile,
        registerEmailID,
        registerOwner
      );

      if (response.success) {
        Alert.alert('Success', 'Hotel Registered Successfully!');
        setRegisterVisible(false);
        setRegisterHotelName('');
        setRegisterPlace('');
        setRegisterMobile('');
        setRegisterEmailID('');
        setRegisterOwner('');
      } else {
        Alert.alert('Error', response.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to contact server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require('../../app/Images/HRM.png')
          } style={styles.logo} />

          <Text style={styles.title}>
            {fromChangePassword ? 'Reset Your Password' : 'Login to Your Hotel'}
          </Text>

          <TextInput
            style={[styles.input, fromChangePassword && { backgroundColor: '#eee' }]}
            placeholder="Hotel Code"
            value={hotelName}
            onChangeText={setHotelName}
            editable={!fromChangePassword}
          />

          <TextInput
            style={styles.input}
            placeholder="User Name"
            value={username}
            onChangeText={setUsername}
          />

          {fromChangePassword ? (
            <>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Old Password"
                  value={password}
                  secureTextEntry={secureText}
                  onChangeText={setPassword}
                />
                {password.length > 0 && (
                  <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                    <Icon
                      name={secureText ? 'eye-off' : 'eye'}
                      size={20}
                      color="#666"
                      style={styles.eyeIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="New Password"
                  value={newPassword}
                  secureTextEntry={secureTextNew}
                  onChangeText={setNewPassword}
                />
                {newPassword.length > 0 && (
                  <TouchableOpacity onPress={() => setSecureTextNew(!secureTextNew)}>
                    <Icon
                      name={secureTextNew ? 'eye-off' : 'eye'}
                      size={20}
                      color="#666"
                      style={styles.eyeIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                secureTextEntry={secureText}
                onChangeText={setPassword}
              />
              {password.length > 0 && (
                <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                  <Icon
                    name={secureText ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              Keyboard.dismiss();
              handleLogin();
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {fromChangePassword ? 'Save' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          {!fromChangePassword && (
            <TouchableOpacity
              style={styles.buttonReg}
              onPress={() => setRegisterVisible(true)}
            >
              <Text style={styles.buttonText}>New User, Wants to Register ?</Text>
            </TouchableOpacity>
          )}

          <Modal animationType="fade" transparent={true} visible={registerVisible}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Register Hotel</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Hotel Name"
                  value={registerHotelName}
                  onChangeText={(text) => {
                    setRegisterHotelName(text);
                    if (text) setRegisterHotelNameError('');
                  }}
                />
                {registerHotelNameError ? (
                  <Text style={styles.errorText}>{registerHotelNameError}</Text>
                ) : null}

                <TextInput
                  style={styles.input}
                  placeholder="Owned By"
                  value={registerOwner}
                  onChangeText={(text) => {
                    setRegisterOwner(text);
                    if (text) setRegisterOwnerError('');
                  }}
                />
                {registerOwnerError ? (
                  <Text style={styles.errorText}>{registerOwnerError}</Text>
                ) : null}

                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={registerPlace}
                  onChangeText={(text) => {
                    setRegisterPlace(text);
                    if (text) setRegisterPlaceError('');
                  }}
                />
                {registerPlaceError ? (
                  <Text style={styles.errorText}>{registerPlaceError}</Text>
                ) : null}

                <TextInput
                  style={styles.input}
                  placeholder="Mobile Number"
                  value={registerMobile}
                  keyboardType="numeric"
                  maxLength={10}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setRegisterMobile(cleaned);
                    if (cleaned.length === 10) setRegisterMobileError('');
                  }}
                />
                {registerMobileError ? (
                  <Text style={styles.errorText}>{registerMobileError}</Text>
                ) : null}

                <TextInput
                  style={styles.input}
                  placeholder="EmailID"
                  value={registerEmailID}
                  onChangeText={(text) => {
                    setRegisterEmailID(text);
                    if (text) setRegisterEmailIDError('');
                  }}
                />
                {registerEmailIDError ? (
                  <Text style={styles.errorText}>{registerEmailIDError}</Text>
                ) : null}

                <TouchableOpacity style={styles.button} onPress={RegisterYourHotel}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { marginTop: 10 }]}
                  onPress={() => setRegisterVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default LoginScreen;



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Match your background
  }, logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    width: '100%',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#0066FF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonReg: {
    backgroundColor: '#00B894',
    padding: 15,
    marginTop: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    minHeight: 300,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'stretch',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#222',
  },
  errorText: {
    color: '#E53935',
    fontSize: 13,
    marginTop: -6,
    marginBottom: 10,
    marginLeft: 5,
  },
});
