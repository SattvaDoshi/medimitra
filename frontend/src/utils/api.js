import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  }
};

// Pharmacy API calls
export const pharmacyAPI = {
  searchPharmacies: async (params) => {
    const response = await api.get('/pharmacy/search', { params });
    return response.data;
  },
  
  getPharmacy: async (id) => {
    const response = await api.get(`/pharmacy/${id}`);
    return response.data;
  },
  
  createPharmacy: async (pharmacyData) => {
    const response = await api.post('/pharmacy', pharmacyData);
    return response.data;
  },
  
  updatePharmacy: async (id, pharmacyData) => {
    const response = await api.put(`/pharmacy/${id}`, pharmacyData);
    return response.data;
  },
  
  deletePharmacy: async (id) => {
    const response = await api.delete(`/pharmacy/${id}`);
    return response.data;
  },
  
  getPharmacyInventory: async (id, params) => {
    const response = await api.get(`/pharmacy/${id}/inventory`, { params });
    return response.data;
  },
  
  getDashboard: async () => {
    const response = await api.get('/pharmacy/my/dashboard');
    return response.data;
  }
};

// Medicine API calls
export const medicineAPI = {
  searchMedicines: async (params) => {
    const response = await api.get('/medicine/search', { params });
    return response.data;
  },
  
  getMedicine: async (id) => {
    const response = await api.get(`/medicine/${id}`);
    return response.data;
  },
  
  addMedicine: async (medicineData) => {
    const response = await api.post('/medicine', medicineData);
    return response.data;
  },
  
  updateMedicine: async (id, medicineData) => {
    const response = await api.put(`/medicine/${id}`, medicineData);
    return response.data;
  },
  
  deleteMedicine: async (id) => {
    const response = await api.delete(`/medicine/${id}`);
    return response.data;
  },
  
  updateStock: async (id, stockData) => {
    const response = await api.patch(`/medicine/${id}/stock`, stockData);
    return response.data;
  },
  
  getPharmacyMedicines: async (pharmacyId, params) => {
    const response = await api.get(`/medicine/pharmacy/${pharmacyId}`, { params });
    return response.data;
  },
  
  getMyInventory: async (params) => {
    const response = await api.get('/medicine/my/inventory', { params });
    return response.data;
  }
};

// Transaction API calls
export const transactionAPI = {
  createTransaction: async (transactionData) => {
    const response = await api.post('/transaction', transactionData);
    return response.data;
  },
  
  completeTransaction: async (id) => {
    const response = await api.patch(`/transaction/${id}/complete`);
    return response.data;
  },
  
  getTransactions: async (params) => {
    const response = await api.get('/transaction', { params });
    return response.data;
  },
  
  getTransaction: async (id) => {
    const response = await api.get(`/transaction/${id}`);
    return response.data;
  },
  
  cancelTransaction: async (id) => {
    const response = await api.patch(`/transaction/${id}/cancel`);
    return response.data;
  },
  
  quickSale: async (saleData) => {
    const response = await api.post('/transaction/sale', saleData);
    return response.data;
  },
  
  getReports: async (params) => {
    const response = await api.get('/transaction/reports/summary', { params });
    return response.data;
  }
};

export default api;