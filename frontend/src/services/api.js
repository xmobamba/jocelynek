import axios from 'axios';
import { ref } from 'vue';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  timeout: 15000
});

const token = ref(null);

client.interceptors.request.use((config) => {
  if (token.value) {
    config.headers.Authorization = `Bearer ${token.value}`;
  }
  return config;
});

export const useApi = () => client;

export const setToken = (value) => {
  token.value = value;
};
