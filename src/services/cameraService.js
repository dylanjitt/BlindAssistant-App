import * as ImageManipulator from 'expo-image-manipulator';
import jsonServerInstance from '../api/jsonInstance';

const API_URL = process.env.API_URL;

export const sendPhoto = async (uri, mode, setResponseText, setLoading, shouldRotate = false) => {
  try {
    // Manipulate image: resize + compress
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        { resize: { width: 960, height: 1280 } },
        ...(shouldRotate ? [{ rotate: 90 }] : []), // optional rotation if needed
      ],
      {
        compress: 0.5, // 50% compression
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const finalUri = manipulatedImage.uri;

    // Create FormData directly with manipulated image
    const formData = new FormData();
    formData.append('file', {
      uri: finalUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    console.log('Sending request to:', `${API_URL}${mode}`);

    const response = await jsonServerInstance.post(mode, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

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
