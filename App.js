import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View,Dimensions } from 'react-native';


const screenHeight = Dimensions.get('window').height;

export default function App() {
  const [facing, setFacing] = useState('back');
  const permissionResponse = useCameraPermissions();

  if (!permissionResponse) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </View>
    );
  }

  const [permission, requestPermission] = permissionResponse;

  if (!permission || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <StatusBar style='light'/>
      
        <CameraView style={styles.camera} facing={facing}>
        
        </CameraView>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor:'black'
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    aspectRatio:375/565,
    borderRadius:20,
    marginTop: screenHeight * 0.1, // 5% of screen height
    width:'100%'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
