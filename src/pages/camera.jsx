import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { sendPhoto } from '../services/cameraService';
import PhotoShutter from '../components/button';
import { setBackgroundColorAsync } from 'expo-system-ui';
import * as Speech from 'expo-speech';


const screenHeight = Dimensions.get('window').height;

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const facing='back';
  const cameraRef = useRef(null);
  const [taken,setTaken]=useState(false)

  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');

  const money  = process.env.MONEY
  const minibus  = process.env.MINIBUS
  const vision = process.env.VISION
  
  const listModes=[ 'minibus', 'vision','money']
  const [mode, setMode] = useState(listModes[2])
  
  const [modeCamera,setModeCamera]=useState(vision)

  

  useEffect(() => {
    setBackgroundColorAsync('#000000'); 
    
  }, []);

  useEffect(()=>{
    if(mode==='money'){
      setModeCamera(money)
      Speech.speak('Modo billetes', { language: 'es-ES' });

    }else if (mode==='minibus'){
      setModeCamera(minibus)
      Speech.speak('Modo minibus', { language: 'es-ES' });

    }else {
      setModeCamera(vision)
      Speech.speak('Modo visión', { language: 'es-ES' });

    }
    console.log('CURRENT MODE: ',mode)
  },[mode])

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
      console.log('Taking picture...');
      
      // Reduce image quality for faster upload
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.8, 
        skipProcessing: true,
        base64:false
      });
      
      setPhotoUri(photo.uri);
      setResponseText('Analyzing image...');
      setLoading(true);
      setTaken(true);
      
      console.log('Current mode:', mode);
      console.log('Mode camera value:', modeCamera);
      console.log('Photo URI:', photo.uri);
      
      // Send photo immediately after state updates
      await sendPhoto(photo.uri, modeCamera, setResponseText, setLoading);
      Speech.speak(responseText?.description)
    } catch (error) {
      console.error('Error taking picture:', error);
      setResponseText('Failed to take picture.');
      setLoading(false);
    }
  }; 

  const backToPhoto = () => {
    setPhotoUri(null);
    setResponseText('')
    setTaken(false)
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.camera} />
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}
      <View style={styles.bottomPart}>

        <View style={{ flex: 1.5, width: "100%" }}>
          <ScrollView>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />
            ) : (
              <Text style={styles.resultText}>{responseText?.description}</Text>
            )}
          </ScrollView>

        </View>
        <View style={{ flex: 2.5, width: '100%' }}>
          <PhotoShutter 
          takePhoto={takePicture} 
          taken={taken} 
          backToPhoto={backToPhoto} 
          listModes={listModes} 
          setMode={setMode} 
          mode={mode}
          />
        </View>

      </View>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
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
  bottomPart: {
    flex: 1,
    width: "100%"
  }
});
