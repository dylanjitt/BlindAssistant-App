import jsonServerInstance from "../api/jsonInstance";
import * as FileSystem from 'expo-file-system';


export const sendPhoto = async (uri,mode,setResponseText,setLoading) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const file = {
      uri: fileInfo.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    };

    const formData = new FormData();
    formData.append('file', file);

    const response = await jsonServerInstance.post(
      mode,
      formData,

    );
    console.log(response.data)
    setResponseText(response.data); // API response
  } catch (error) {
    console.error('Error sending photo:', error);
    setResponseText('Failed to analyze image.');
  } finally {
    setLoading(false);
  }
};