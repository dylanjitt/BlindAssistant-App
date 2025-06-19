import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { sendPhoto } from '../services/cameraService';
import PhotoShutter from '../components/button';
import { setBackgroundColorAsync } from 'expo-system-ui';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Gyroscope } from 'expo-sensors';
import { DeviceMotion } from 'expo-sensors';
import * as ImageManipulator from 'expo-image-manipulator';
import { ResponseLayout } from '../components/responseLayout';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const facing = 'back';
  const cameraRef = useRef(null);
  const [taken, setTaken] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');

  const money = process.env.MONEY;
  const minibus = process.env.MINIBUS;
  const vision = process.env.VISION;

  const listModes = ['minibus', 'vision', 'money'];
  const [mode, setMode] = useState(listModes[2]);
  const [modeCamera, setModeCamera] = useState(vision);

  const [gyroOrientation, setGyroOrientation] = useState('PORTRAIT'); // for icon rotation
  const lastAnnouncedOrientation = useRef('PORTRAIT');

  

  // Lock UI orientation and ask camera permissions
  useEffect(() => {
    setBackgroundColorAsync('#000000');
    requestPermission();
    
  }, []);

  

  useEffect(() => {
    let isMounted = true;
    let speechTimeout;
  
    const updateOrientationState = async (orientationInfo) => {
      if (!isMounted) return;
      
      // Don't update orientation if photo is taken
      if (taken) return;
  
      const newOrientation =
        orientationInfo === ScreenOrientation.Orientation.PORTRAIT_UP ||
          orientationInfo === ScreenOrientation.Orientation.PORTRAIT_DOWN
          ? 'PORTRAIT'
          : 'LANDSCAPE';
  
      //setScreenOrientation(newOrientation);
  
      // Only announce if orientation changed and no speech is currently happening
      if (newOrientation !== lastAnnouncedOrientation.current && !Speech.isSpeaking()) {
        lastAnnouncedOrientation.current = newOrientation;
  
        // Cancel any pending speech
        if (speechTimeout) clearTimeout(speechTimeout);
  
        // Add slight delay to avoid speech collisions
        speechTimeout = setTimeout(() => {
          Speech.speak(
            newOrientation === 'PORTRAIT' ? 'Vertical' : 'Horizontal',
            { language: 'es-ES', rate: 0.9 }
          );
        }, 300);
      }
    };
  
    // Get initial orientation
    ScreenOrientation.getOrientationAsync()
      .then(updateOrientationState)
      .catch(console.error);
  
    // Subscribe to orientation changes
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      updateOrientationState(event.orientationInfo.orientation);
    });
  
    return () => {
      isMounted = false;
      if (speechTimeout) clearTimeout(speechTimeout);
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, [taken]); // Added 'taken' to dependency array
  
  useEffect(() => {
    let lastSpoken = 'PORTRAIT';
  
    // Listen for device motion (gives you quaternion & Euler)
    const subscription = DeviceMotion.addListener((motionEvent) => {
      // Don't update orientation if photo is taken
      if (taken) return;
      
      // motionEvent.rotation is an object { alpha, beta, gamma } in radians
      //   • alpha: rotation around Z axis (0…2π)
      const { alpha } = motionEvent.rotation;
  
      // Decide portrait vs. landscape by alpha (z‑axis heading)
      // Normalize alpha to [–π, π]
      const a = ((alpha + Math.PI) % (2 * Math.PI)) - Math.PI;
  
      // If device rotated more than ±45° around Z, treat as landscape
      const current = Math.abs(a) > Math.PI / 4 ? 'LANDSCAPE' : 'PORTRAIT';
      if (current !== lastSpoken) {
        lastSpoken = current;
        setGyroOrientation(current);
        console.log('new orientation:', current);
      }
    });
  
    // Polling interval in ms
    DeviceMotion.setUpdateInterval(500);
  
    return () => subscription.remove();
  }, [taken]); // Added 'taken' to dependency array


  useEffect(() => {
    if (mode === 'money') {
      setModeCamera(money);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Speech.speak('Modo billetes', { language: 'es-ES' });
    } else if (mode === 'minibus') {
      setModeCamera(minibus);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Speech.speak('Modo minibus', { language: 'es-ES' });
    } else {
      setModeCamera(vision);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Speech.speak('Modo visión', { language: 'es-ES' });
    }
    console.log('CURRENT MODE: ', mode);
  }, [mode]);

  useEffect(() => {
    if (responseText !== "") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Speech.speak(responseText, { language: 'es-ES' });
    }
  }, [responseText]);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
        base64: false,
        exif: true,


      });
      
      console.log('Photo dimensions:', photo.width, 'x', photo.height);

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
    setResponseText('');
    setTaken(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getImageContainerStyle = () => {
  
  return {
    width: '100%',
    aspectRatio: 3/4, 
    borderRadius: 20,
    marginTop: screenHeight * 0.075,
    overflow: 'hidden',
    alignSelf: 'center',
  };
};

const getImageStyle = () => {
  const isLandscape = gyroOrientation === 'LANDSCAPE';
  console.log('isLandscape:', isLandscape);
  return {
    width: '100%',
    height: '100%',
    aspectRatio:isLandscape?3/3:3/4,
    transform: isLandscape ? [{ rotate: '90deg' }] : []
  };
};



  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {photoUri ? (
        <View style={getImageContainerStyle()}>
          <Image
            source={{ uri: photoUri }}
            style={getImageStyle()}
            resizeMode="contain"
          />
          {gyroOrientation === 'LANDSCAPE' ? (
          <View style={styles.landscapeResponseOverlay}>
            <View style={styles.landscapeResponseContainer}>
              <ResponseLayout 
                loading={loading} 
                responseText={responseText} 
                styles={styles}
              />
            </View>
          </View>
        ) : null}
        </View>
      ) : (
        <View>
          <View style={styles.topOverlay} />
          <CameraView
            style={styles.cameraPortrait}
            facing={facing}
            ref={cameraRef}
          />
        </View>
      )}

      <View style={styles.bottomPart}>
        <View style={{ flex: 1.5, width: "100%" }}>
          {gyroOrientation==='PORTRAIT'?
          <ResponseLayout loading={loading} responseText={responseText} styles={styles}/>:<></>
          }

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
            orientation={gyroOrientation}
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
  cameraPortrait: {
    aspectRatio: 3 / 4,
    borderRadius: 20,
    marginTop: screenHeight * 0.075,
    width: '100%',
  },
  cameraLandscape: {
    aspectRatio: 4 / 3,
    height: '60%',
    borderRadius: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  },
   landscapeResponseOverlay: {
    position: 'absolute',
    top: 0,
    right: 330,
    bottom: 0,
    width: '20%', // Adjust this to control how much space the text takes
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  landscapeResponseContainer: {
    transform: [{ rotate: '90deg' }], // Rotate text 90 degrees
    width: '600%', // Make it wider since it's rotated
    height: '10%', // Adjust height as needed
    justifyContent: 'center',
    alignItems: 'center',
  }
});

