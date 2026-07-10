import axios from 'axios';
import { APP_CONFIG } from '../constants/app';

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 10000,
});
