import { useRef, useState, useEffect } from 'react';
import { Dimensions} from 'react-native';
import {  useCameraPermissions } from 'expo-camera';
import { sendPhoto } from '../services/cameraService';
import { setBackgroundColorAsync } from 'expo-system-ui';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { DeviceMotion } from 'expo-sensors';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export const useCamera= () => {
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

  const soundRef = useRef(new Audio.Sound());

  useEffect(() => {
    setBackgroundColorAsync('#000000');
    requestPermission();
    //soundRef.current.loadAsync(require('../../assets/loading.wav'));
    
  }, []);
  useEffect(() => {
    (async () => {
      try {
        await soundRef.current.loadAsync(require('../../assets/loading.wav'));
        // set to play only once
        await soundRef.current.setIsLoopingAsync(false);
      } catch (e) {
        console.warn('Could not load sound', e);
      }
    })();
    // on unmount, unload
    return () => {
      soundRef.current.unloadAsync();
    };
  }, []);

  // //orientation useEffect
  // useEffect(() => {
  //   let isMounted = true;
  //   let speechTimeout;
  
  //   const updateOrientationState = async (orientationInfo) => {
  //     if (!isMounted) return;
      
  //     // Don't update orientation if photo is taken
  //     if (taken) return;
  
  //     const newOrientation =
  //       orientationInfo === ScreenOrientation.Orientation.PORTRAIT_UP ||
  //         orientationInfo === ScreenOrientation.Orientation.PORTRAIT_DOWN
  //         ? 'PORTRAIT'
  //         : 'LANDSCAPE';
  
  //     // Only announce if orientation changed and no speech is currently happening
  //     if (newOrientation !== lastAnnouncedOrientation.current && !Speech.isSpeaking()) {
  //       lastAnnouncedOrientation.current = newOrientation;
  
  //       // Cancel any pending speech
  //       if (speechTimeout) clearTimeout(speechTimeout);
  
  //       // Add slight delay to avoid speech collisions
  //       speechTimeout = setTimeout(() => {
  //         Speech.speak(
  //           newOrientation === 'PORTRAIT' ? 'Vertical' : 'Horizontal',
  //           { language: 'es-ES', rate: 0.9 }
  //         );
  //       }, 300);
  //     }
  //   };
  
  //   // Get initial orientation
  //   ScreenOrientation.getOrientationAsync()
  //     .then(updateOrientationState)
  //     .catch(console.error);
  
  //   // Subscribe to orientation changes
  //   const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
  //     updateOrientationState(event.orientationInfo.orientation);
  //   });
  
  //   return () => {
  //     isMounted = false;
  //     if (speechTimeout) clearTimeout(speechTimeout);
  //     ScreenOrientation.removeOrientationChangeListener(subscription);
  //   };
  // }, [taken]); // Added 'taken' to dependency array
  
  // // //orientation gyroscpe listener useEffect
  // useEffect(() => {
  //   let lastSpoken = 'PORTRAIT';
  
  //   // Listen for device motion (gives you quaternion & Euler)
  //   const subscription = DeviceMotion.addListener((motionEvent) => {
  //     // Don't update orientation if photo is taken
  //     if (taken) return;
      
  //     // motionEvent.rotation is an object { alpha, beta, gamma } in radians
  //     //   • alpha: rotation around Z axis (0…2π)
  //     const { alpha } = motionEvent.rotation;
  
  //     // Decide portrait vs. landscape by alpha (z‑axis heading)
  //     // Normalize alpha to [–π, π]
  //     const a = ((alpha + Math.PI) % (2 * Math.PI)) - Math.PI;
  
  //     // If device rotated more than ±45° around Z, treat as landscape
  //     const current = Math.abs(a) > Math.PI / 4 ? 'LANDSCAPE' : 'PORTRAIT';
  //     if (current !== lastSpoken) {
  //       lastSpoken = current;
  //       setGyroOrientation(current);
  //       console.log('new orientation:', current);
  //     }
  //   });
  //   // Polling interval in ms
  //   DeviceMotion.setUpdateInterval(500);
  
  //   return () => subscription.remove();
  // }, [taken]); 

  useEffect(() => {
    if (loading) {
      (async () => {
        try {
          // rewind to start
          await soundRef.current.setPositionAsync(0);
          // play it
          await soundRef.current.playAsync();
        } catch (e) {
          console.warn('Failed to play sound', e);
        }
      })();
    } else {
      (async () => {
        try {
          // stop early if still playing
          await soundRef.current.stopAsync();
        } catch {}
      })();
    }
  }, [loading]);


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
        quality: 0.5,
        skipProcessing: true,
        base64: false,
        exif: false,
        scale:0.3,
      });
      
      //console.log('Photo dimensions:', photo.width, 'x', photo.height);
      console.log('Current orientation when taking photo:', gyroOrientation);

    //   // Get available picture sizes to find an optimal one
    // const availableSizes = await cameraRef.current.getAvailablePictureSizesAsync();
    // console.log('Available picture sizes:', availableSizes);
    
    // // Find a size that's close to 1080p (1920x1080) but not too large
    // // Look for sizes around 1080-2000 pixels on the smaller dimension
    // const optimalSize = availableSizes.find(size => {
    //   const [width, height] = size.split('x').map(Number);
    //   const smallerDimension = Math.min(width, height);
    //   return smallerDimension >= 960 && smallerDimension <= 1080;
    // }) || availableSizes[Math.floor(availableSizes.length / 2)]; // Fallback to middle size
    
    // console.log('Selected picture size:', optimalSize);
    
    // // Optimized camera settings for faster processing
    // const photo = await cameraRef.current.takePictureAsync({
    //   quality: 0.6, 
    //   skipProcessing: false, 
    //   base64: false,
    //   exif: false,
    //   scale: 0.8, 
    //   pictureSize: optimalSize, 
    // });
    
    // console.log('Photo captured - dimensions:', photo.width, 'x', photo.height);
    // console.log('Current orientation when taking photo:', gyroOrientation);

      setPhotoUri(photo.uri);
      setLoading(true);
      setTaken(true);

      // Determine if we need to rotate the image
      // Rotate when in PORTRAIT mode since camera captures in landscape by default
      const shouldRotate = gyroOrientation === 'PORTRAIT';
      console.log('Should rotate image:', shouldRotate);

      await sendPhoto(photo.uri, modeCamera, setResponseText, setLoading, shouldRotate);

    } catch (error) {
      console.error('Error taking picture:', error);
      setResponseText('Failed to take picture.');
      setLoading(false);
    } finally{
      setLoading(false)
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

return{photoUri,permission,getImageContainerStyle,getImageStyle,gyroOrientation,loading,responseText,facing,cameraRef,takePicture,taken,backToPhoto,listModes,setMode,mode}
}