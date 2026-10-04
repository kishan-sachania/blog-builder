import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: '',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<unknown> | null = null;

const redirectToLogin = () => {
  if (!window.location.pathname.startsWith('/auth/')) {
    window.location.href = '/auth/login';
  }
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthUrl = original?.url?.includes('/api/auth/');

    if (error.response?.status !== 401 || !original || original._retry || isAuthUrl) {
      return Promise.reject(error);
    }

    original._retry = true;

    refreshPromise ??= axios
      .post('/api/auth/refresh', {}, { withCredentials: true })
      .finally(() => { refreshPromise = null; });

    try {
      await refreshPromise;
      return apiClient(original);
    } catch (e) {
      redirectToLogin();
      return Promise.reject(e);
    }
  }
);

export default apiClient;