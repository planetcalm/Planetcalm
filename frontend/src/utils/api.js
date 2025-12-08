import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

/**
 * Member API calls
 */
export const memberAPI = {
  // Get all members for map
  getAll: () => api.get('/members'),
  
  // Get member count
  getCount: () => api.get('/members/count'),
  
  // Get recent members
  getRecent: (limit = 10) => api.get(`/members/recent?limit=${limit}`),
  
  // Create new member (place pin)
  create: (data) => api.post('/members', data),
  
  // Get single member
  getById: (id) => api.get(`/members/${id}`),
};

/**
 * Subscriber API calls
 */
export const subscriberAPI = {
  // Subscribe to newsletter
  subscribe: (data) => api.post('/subscribers', data),
  
  // Get subscriber count
  getCount: () => api.get('/subscribers/count'),
  
  // Unsubscribe
  unsubscribe: (email) => api.post('/subscribers/unsubscribe', { email }),
};

/**
 * Health check
 */
export const healthCheck = () => 
  axios.get(`${API_URL}/health`).then(res => res.data);

export default api;
