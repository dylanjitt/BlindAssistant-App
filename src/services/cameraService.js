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
      // 'https://lemming-special-robin.ngrok-free.app/BolivianMoneyDetector?spanish=false',
      // 'http://192.168.100.14:8080/BolivianMoneyDetector?spanish=false',
      //'http://192.168.100.14:8080/ollamaVision?prompt=I%20need%20you%20to%20describe%20in%20huge%20detail%20the%20following%20image%2C%20describe%20what%27s%20on%20it%20like%20if%20you%20were%20to%20tell%20a%20blind%20person%2C%20If%20it%20has%20a%20person%2C%20describe%20looks%2C%20hair%2C%20skin%20tone%20and%20clothing%2C%20if%20it%20is%20an%20objects%20%28or%20various%20objects%29%20describe%20them%2C%20what%20they%20are%20or%20where%20are%20those%20from%2C%20their%20colors%2C%20and%20if%20on%20the%20image%20you%20find%20any%20form%20of%20text%2C%20read%20it%20in%20a%20separate%20paragraph%2C%20look%20for%20text%20specifically%20in%20spanish',
      formData,
      // {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // }
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