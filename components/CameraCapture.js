import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Camera } from 'expo-camera';

const CameraCapture = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
    }
  };

    if (hasPermission === null) {
        return <View><Text>Requesting camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return <View><Text>No access to camera</Text></View>;
    }

    return (
    <View style={styles.container}>
      {photo ? (
        <>
          <Image source={{ uri: photo }} style={styles.image} />
          <TouchableOpacity onPress={() => setPhoto(null)} style={styles.button}>
            <Text style={styles.buttonText}>Retake Photo</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Camera style={styles.camera} ref={cameraRef} />
          <TouchableOpacity onPress={takePhoto} style={styles.button}>
            <Text style={styles.buttonText}>Capture Photo</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default CameraCapture;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  camera: { flex: 1 },
  image: { flex: 1, resizeMode: 'cover' },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 10,
  },
  buttonText: { color: 'white', fontSize: 16 },
});
