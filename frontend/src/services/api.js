import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userAPI = {
  login: (credentials) => api.post('/api/users/login', credentials),
  register: (userData) => api.post('/api/users/register', userData),
  getCurrentUser: () => api.get('/api/users/current'),
  getAllUsers: () => api.get('/api/users'),
  updateUserStatus: (userId, enabled) => api.put(`/api/users/${userId}/status?enabled=${enabled}`),
  checkUsername: (username) => api.get(`/api/users/check-username?username=${username}`),
  checkEmail: (email) => api.get(`/api/users/check-email?email=${email}`),
};

// 书籍相关API
export const bookAPI = {
  getAllBooks: () => api.get('/api/books'),
  getBookById: (id) => api.get(`/api/books/${id}`),
  createBook: (bookData) => api.post('/api/books', bookData),
  updateBook: (id, bookData) => api.put(`/api/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/api/books/${id}`),
  searchBooks: (keyword) => api.get(`/api/books/search?keyword=${keyword}`),
};

// 订单相关API
export const orderAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getUserOrders: () => api.get('/api/orders/user'),
  getAllOrders: () => api.get('/api/orders'),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
};

// 统计相关API
export const statisticsAPI = {
  getBookSales: (startDate, endDate) => api.get(`/api/statistics/book-sales?startDate=${startDate}&endDate=${endDate}`),
  getUserConsumption: (startDate, endDate) => api.get(`/api/statistics/user-consumption?startDate=${startDate}&endDate=${endDate}`),
  getUserStatistics: (startDate, endDate) => api.get(`/api/statistics/user?startDate=${startDate}&endDate=${endDate}`),
};

export default api; 