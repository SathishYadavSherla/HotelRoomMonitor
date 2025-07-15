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
  ImageBackground,
  KeyboardAvoidingView,
  StatusBar, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import dbService from '../Services/dbService';
import { useRoute } from '@react-navigation/native';
import ScreenWrapper from './ScreenWrapper';
import { useHotel } from './HotelContext';
import AsyncStorage from '@react-native-async-storage/async-storage';



const LoginScreen = ({ navigation }) => {
  const [hotelName, setHotelName] = useState('');
  const { hotelFullName, setHotelFullName } = useHotel();
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
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);


  const route = useRoute();
  const fromChangePassword = route.params?.fromChangePassword ?? false;
  const hotelCodeParam = route.params?.hotelCode ?? '';

  useEffect(() => {
    if (fromChangePassword && hotelCodeParam) {
      setHotelName(hotelCodeParam);
    }
  }, [fromChangePassword, hotelCodeParam]);

  useEffect(() => {
    const checkUserSession = async () => {
      if (!fromChangePassword) {
        try {
          setLoginInProgress(true);
          const session = await AsyncStorage.getItem('userSession');
          if (session) {
            const { hotelName, username, password } = JSON.parse(session);
            const response = await dbService.createSheetsAndSaveCredentials(hotelName, username, password);
            if (response.success) {
              setHotelFullName(response.hotelFullName);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home', params: { hotelName, hotelFullName: response.hotelFullName } }],
              });
            }
          }
        } catch (err) {
          setLoading(false);
          console.error('Failed to restore session', err);
        } finally {
          setLoginInProgress(false);
        }
      }
    };
    checkUserSession();
  }, []);

  const handleLogin = async () => {
    if (!hotelName || !username || !password || (fromChangePassword && !newPassword)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoginInProgress(true);

    try {
      if (fromChangePassword) {
        const updateResponse = await dbService.updatePassword(hotelName, username, newPassword, password);
        if (updateResponse.success) {

          Alert.alert('Success', 'Password changed successfully', [
            {
              text: 'OK',
              onPress: async () => {
                const loginResponse = await dbService.createSheetsAndSaveCredentials(hotelName, username, newPassword);
                if (loginResponse.success) {
                  await AsyncStorage.setItem('userSession', JSON.stringify({
                    hotelName,
                    username,
                    password: newPassword,
                  }));
                  navigation.navigate('Home', { hotelName });
                  setHotelName('');
                  setUsername('');
                  setPassword('');
                  setNewPassword('');
                } else {
                  Alert.alert('Error', 'Auto-login failed');
                }
                setLoginInProgress(false);
              }
            }
          ]); return; // Exit early to avoid setting false twice
        } else {
          Alert.alert('Error', updateResponse.message || 'Password update failed');
        }
      } else {
        const response = await dbService.createSheetsAndSaveCredentials(hotelName, username, password);
        setHotelFullName(response.hotelFullName);
        if (response.success) {
          await AsyncStorage.setItem('userSession', JSON.stringify({
            hotelName,
            username,
            password,
          }));
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
      setLoginInProgress(false);
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

    setRegisterLoading(true);
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
      setRegisterLoading(false);
    } finally {
      setRegisterLoading(false);
    }
  };
  // if (loginInProgress) {
  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      ><ImageBackground
        source={require('../../app/Images/login_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
          <View style={styles.overlay}>
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
                  onPress={() => { Keyboard.dismiss(); setRegisterVisible(true) }}
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
                      editable={!registerLoading}
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
                      editable={!registerLoading}
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
                      editable={!registerLoading}
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
                      editable={!registerLoading}
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
                      editable={!registerLoading}
                    />
                    {registerEmailIDError ? (
                      <Text style={styles.errorText}>{registerEmailIDError}</Text>
                    ) : null}

                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        Keyboard.dismiss();
                        RegisterYourHotel();
                      }}
                      disabled={registerLoading}
                    >
                      <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { marginTop: 10 }]}
                      onPress={() => setRegisterVisible(false)}
                      disabled={registerLoading}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    {/* Optional overlay */}
                    {registerLoading && (
                      <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                      </View>
                    )}
                  </View>
                </View>
              </Modal>


            </ScrollView>
          </View>
        </ImageBackground>
        <Modal visible={loginInProgress} transparent animationType="fade">
          <View style={styles.fullScreenLoader}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Checking credentials...</Text>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ScreenWrapper>

  );
  // }
};

export default LoginScreen;



const styles = StyleSheet.create({
  fullScreenLoader: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 10
  }
  ,
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
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#FFFFFFDD',
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
    color: '#fff',
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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
