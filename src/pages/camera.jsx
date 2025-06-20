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
import { DeviceMotion } from 'expo-sensors';
import { Audio } from 'expo-av';
import { ResponseLayout } from '../components/responseLayout';
import { useCamera } from '../hooks/useCamera';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function Camera() {

  const {photoUri,getImageContainerStyle,getImageStyle,gyroOrientation,loading,responseText,facing,cameraRef,takePicture,taken,backToPhoto,listModes,setMode,mode}=useCamera()
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

        <View style={{ flex: 3, width: '100%' }}>
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

