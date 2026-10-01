import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '',
  withCredentials: true, // Browser automatically attaches httpOnly cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: redirect on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
