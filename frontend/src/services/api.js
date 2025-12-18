// API service for making HTTP requests

const API_URL = '/api';

// Get stored token
const getToken = () => localStorage.getItem('token');

// Make authenticated request
const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: (email, password) =>
    authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  login: (email, password) =>
    authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getMe: () => authFetch('/auth/me'),

  updatePhone: (phoneNumber) =>
    authFetch('/auth/phone', {
      method: 'PUT',
      body: JSON.stringify({ phoneNumber })
    })
};

// Phones API
export const phonesAPI = {
  getAll: () => authFetch('/phones'),

  add: (name, number) =>
    authFetch('/phones', {
      method: 'POST',
      body: JSON.stringify({ name, number })
    }),

  update: (id, name, number) =>
    authFetch(`/phones/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, number })
    }),

  delete: (id) =>
    authFetch(`/phones/${id}`, {
      method: 'DELETE'
    })
};
