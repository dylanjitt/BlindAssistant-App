import axios from 'axios';

const API_URL = process.env.API_URL;

const jsonServerInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000, 
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default jsonServerInstance;