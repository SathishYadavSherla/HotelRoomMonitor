import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
    Button,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function App() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    We need your permission to show the camera
                </Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const takePhoto = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setCapturedPhoto(photo.uri);
            } catch (error) {
                console.error('Error taking picture:', error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={takePhoto}>
                        <Text style={styles.text}>Capture</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>

            {capturedPhoto && (
                <View style={styles.previewContainer}>
                    <Text style={styles.previewLabel}>Captured Image:</Text>
                    <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#00000088',
        padding: 10,
        borderRadius: 10,
    },
    button: {
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    previewContainer: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#eee',
    },
    previewLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    previewImage: {
        width: 200,
        height: 300,
        borderRadius: 10,
    },
});
