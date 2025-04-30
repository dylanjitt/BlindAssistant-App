import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const screenHeight = Dimensions.get('window').height;

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      setPhotoUri(photo.uri);
      setResponseText('Analyzing image...');
      setLoading(true);
      await sendPhoto(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const sendPhoto = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const file = {
        uri: fileInfo.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      };

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'http://192.168.100.14:8080/BolivianMoneyDetector?spanish=false',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResponseText(response.data); // API response
    } catch (error) {
      console.error('Error sending photo:', error);
      setResponseText('Failed to analyze image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.camera} />
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />
      ) : (
        <Text style={styles.resultText}>{responseText?.description}</Text>
      )}
      <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
        <Text style={styles.text}>📸 Capture</Text>
      </TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  message: {
    color: 'white',
    fontSize: 16,
    marginTop: 30,
  },
  camera: {
    aspectRatio: 375 / 565,
    borderRadius: 20,
    marginTop: screenHeight * 0.1,
    width: '100%',
  },
  captureButton: {
    backgroundColor: '#1e90ff',
    padding: 12,
    marginTop: 20,
    borderRadius: 10,
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});
