import axios from 'axios';
const API_URL = process.env.API_URL;
console.log("API_URL:", API_URL);
const jsonServerInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
});

export default jsonServerInstance;