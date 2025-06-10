import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { sendPhoto } from '../services/cameraService';
import PhotoShutter from '../components/button';
import { setBackgroundColorAsync } from 'expo-system-ui';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

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
    requestPermission()
  }, []);

  useEffect(()=>{
    if(mode==='money'){
      setModeCamera(money)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      Speech.speak('Modo billetes', { language: 'es-ES' });

    }else if (mode==='minibus'){
      setModeCamera(minibus)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      Speech.speak('Modo minibus', { language: 'es-ES' });

    }else {
      setModeCamera(vision)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      Speech.speak('Modo visión', { language: 'es-ES' });

    }
    console.log('CURRENT MODE: ',mode)
  },[mode])

  useEffect(()=>{
    if(responseText!==""){
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      )
      Speech.speak(responseText, { language: 'es-ES' });
    }
  },[responseText])


  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.8, 
        skipProcessing: true,
        base64:false
      });
      
      setPhotoUri(photo.uri);
      
      setLoading(true);
      setTaken(true);
      
      await sendPhoto(photo.uri, modeCamera, setResponseText, setLoading);
      
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.camera} />
      ) : (
        <View>
           <View style={styles.topOverlay} />  
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}/>
        
        </View>
       
      )}
      <View style={styles.bottomPart}>

        <View style={{ flex: 1.5, width: "100%" }}>
          <ScrollView>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />
            ) : (
              <Text style={styles.resultText}>{responseText}</Text>
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
          loading={loading}
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
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.6)', // solid fade
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
