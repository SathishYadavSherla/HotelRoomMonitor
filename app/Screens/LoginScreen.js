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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import dbService from '../Services/dbService';
import { useRoute } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const [hotelName, setHotelName] = useState('');
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
     
      const updateResponse = await dbService.updatePassword(hotelName, username, newPassword,password);

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
      // Regular login flow
      const response = await dbService.createSheetsAndSaveCredentials(hotelName, username, password);
      if (response.success) {
        navigation.navigate('Home', { hotelName });
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

  const RegisterYourHotel = async () => {
    if (!registerHotelName || !registerPlace || !registerMobile || !registerEmailID || !registerOwner) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

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
    <View style={styles.container}>
      <Text style={styles.title}>{fromChangePassword ? 'Reset Your Password' : 'Login to Your Hotel'}</Text>

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
          {/* Old Password */}
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

          {/* New Password */}
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
        // Regular Login Password
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

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{fromChangePassword ? 'Save' : 'Login'}</Text>
        )}
      </TouchableOpacity>
      {!fromChangePassword && (
        <TouchableOpacity style={styles.buttonReg} onPress={() => setRegisterVisible(true)}>
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
              onChangeText={setRegisterHotelName}
            />
            <TextInput
              style={styles.input}
              placeholder="Owned By"
              value={registerOwner}
              onChangeText={setRegisterOwner}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={registerPlace}
              onChangeText={setRegisterPlace}
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={registerMobile}
              onChangeText={setRegisterMobile}
            />
            <TextInput
              style={styles.input}
              placeholder="EmailID"
              value={registerEmailID}
              onChangeText={setRegisterEmailID}
            />

            <TouchableOpacity style={styles.button} onPress={RegisterYourHotel}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => setRegisterVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 15,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonReg: {
    backgroundColor: '#007bff',
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
});
