import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let subscribers = [];

const onRefreshed = (token) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

const addSubscriber = (cb) => {
  subscribers.push(cb);
};

// 🔥 REQUEST
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      window.dispatchEvent(new Event('logout'));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      window.dispatchEvent(new Event('logout'));
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        addSubscriber((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = res.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;

      onRefreshed(accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return axiosInstance(originalRequest);

    } catch {
      window.dispatchEvent(new Event('logout'));
      return Promise.reject(error);

    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;