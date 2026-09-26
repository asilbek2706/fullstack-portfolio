import axios from 'axios';

const apiBaseUrl = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
    'https://api.asilbek-karomatov.dev/api';

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});
