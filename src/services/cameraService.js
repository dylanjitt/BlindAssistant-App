import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import jsonServerInstance from '../api/jsonInstance';

const API_URL = process.env.API_URL;

export const sendPhoto = async (uri, mode, setResponseText, setLoading, shouldRotate = false) => {
  try {
    let finalUri = uri;
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          {resize:{ width: 960, height: 1280 }},

        ], 
        { 
          compress: 0.5, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );
      finalUri = manipulatedImage.uri;

    const fileInfo = await FileSystem.getInfoAsync(finalUri);

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