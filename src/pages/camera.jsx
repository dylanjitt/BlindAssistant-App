import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
// import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { sendPhoto } from '../services/cameraService';
const screenHeight = Dimensions.get('window').height;

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  
  const modeCamera="/BolivianMoneyDetector?spanish=false"
  const [mode,setMode]=useState('')
  const [listModes,setModes]=useState(['','',''])

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
      await sendPhoto(photo.uri,modeCamera,setResponseText,setLoading);
    } catch (error) {
      console.error('Error taking picture:', error);
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
      <View style={styles.bottomPart}>
        {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />
      ) : (
        <Text style={styles.resultText}>{responseText?.description}</Text>
      )}
      <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
        <Text style={styles.text}>📸 Capture</Text>
      </TouchableOpacity>
      </View>
      


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
    marginTop: screenHeight * 0.075,
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
  bottomPart:{
    flex:1
  }
});
