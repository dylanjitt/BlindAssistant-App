import axios from 'axios';
import { API_URL } from 'react-native-dotenv';

const jsonServerInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000, 
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default jsonServerInstance;