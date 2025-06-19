// cameraService.js - Optimized version
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import jsonServerInstance from '../api/jsonInstance';
const API_URL = process.env.API_URL;

export const sendPhoto = async (uri, mode, setResponseText, setLoading) => {
  try {

    const fileInfo = await FileSystem.getInfoAsync(uri);
    
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
    console.error('Error sending photo:', error);
    if (error.code === 'ECONNABORTED') {
      setResponseText('Request timeout. Please try again.');
    } else if (error.response) {
      setResponseText(`Server error: ${error.response.status}`);
    } else if (error.request) {
      setResponseText('Network error. Check your connection.');
    } else {
      setResponseText('Failed to analyze image.');
    }
  } finally {
    setLoading(false);
  }
};