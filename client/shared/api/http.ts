import axios from 'axios';

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'http://localhost:8080/api';

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});
