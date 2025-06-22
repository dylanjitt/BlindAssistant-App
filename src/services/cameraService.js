import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import jsonServerInstance from '../api/jsonInstance';

const API_URL = process.env.API_URL;

export const sendPhoto = async (uri, mode, setResponseText, setLoading, shouldRotate = false) => {
  try {
    let finalUri = uri;
    
    // Rotate image if needed (when in portrait mode)
    //if (shouldRotate) {
      //console.log('Rotating image 90 degrees...');
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        
        [
          {resize:{ width: 960, height: 1280 }},
          //{ rotate: 0 }// Rotate 90 degrees clockwise
        ], 
        { 
          compress: 0.5, // Same compression as your camera settings
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      finalUri = manipulatedImage.uri;
      //console.log('Image rotated successfully');
    //}

    const fileInfo = await FileSystem.getInfoAsync(finalUri);

   
    // Create FormData more efficiently
    const formData = new FormData();
    formData.append('file', {
      uri: fileInfo.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    console.log('Sending request to:', `${API_URL}${mode}`);
    console.log('File size:', fileInfo.size);
    
    const response = await jsonServerInstance.post(mode, formData);
    console.log('Response received:', response.status);
    setResponseText(response.data.description);
    
  } catch (error) {
    console.error('Error al enviar foto:', error);
    if (error.code === 'ECONNABORTED') {
      setResponseText('Request timeout. Please try again.');
    } else if (error.response) {
      setResponseText(`Error de Servidor: ${error.response.status}`);
    } else if (error.request) {
      setResponseText('No se pudo conectar con el servidor, Intente nuevamente mas tarde');
    } else {
      setResponseText('No se pudo analizar la imagen, intente nuevamente');
    }
  } finally {
    setLoading(false);
  }
};