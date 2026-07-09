import axios from 'axios';
import { demoProducts } from '../data/catalog.js';

const apiBaseUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

setAuthTokenHeader();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function setAuthTokenHeader() {
  const token = localStorage.getItem('token');
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export async function apiRegister({ name, email, password }) {
  const res = await api.post('/api/auth/register', { name, email, password });
  return res.data;
}

export async function apiLogin({ email, password }) {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data;
}

export async function apiMe() {
  const res = await api.get('/api/auth/me');
  return res.data;
}

export async function apiProducts({ q, category, flash }) {
  // If no backend API is configured, return local demo products as a fallback.
  const useLocal = !apiBaseUrl;
  if (useLocal) {
    let products = demoProducts.slice();
    if (q) products = products.filter((p) => p.title.toLowerCase().includes(String(q).toLowerCase()));
    if (category) products = products.filter((p) => p.category === category);
    if (flash === 'true' || flash === true) products = products.filter((p) => p.isFlashSale);
    return { products };
  }

  try {
    const res = await api.get('/api/products', { params: { q, category, flash } });
    return res.data;
  } catch (err) {
    // network/backend error -> fallback to local demo products
    let products = demoProducts.slice();
    if (q) products = products.filter((p) => p.title.toLowerCase().includes(String(q).toLowerCase()));
    if (category) products = products.filter((p) => p.category === category);
    if (flash === 'true' || flash === true) products = products.filter((p) => p.isFlashSale);
    return { products };
  }
}

export async function apiProductById(productId) {
  const useLocal = !apiBaseUrl;
  if (useLocal) {
    const product = demoProducts.find((p) => p._id === productId) || demoProducts[0];
    return { product };
  }

  try {
    const res = await api.get(`/api/products/${productId}`);
    return res.data;
  } catch (err) {
    const product = demoProducts.find((p) => p._id === productId) || demoProducts[0];
    return { product };
  }
}

export async function apiReviews(productId) {
  const res = await api.get(`/api/reviews/product/${productId}`);
  return res.data;
}

export async function apiOrderById(orderId) {
  const res = await api.get(`/api/orders/${orderId}`);
  return res.data;
}

export async function apiAddReview(productId, { rating, comment }) {
  const res = await api.post(`/api/reviews/product/${productId}`, { rating, comment });
  return res.data;
}

export async function apiToggleWishlist(productId) {
  const res = await api.post(`/api/wishlist/toggle/${productId}`);
  return res.data;
}

export async function apiGetWishlist() {
  const res = await api.get('/api/wishlist');
  return res.data;
}

export async function apiCheckout({ cart, totals, shippingAddress, paymentProvider }) {
  const res = await api.post('/api/orders/checkout', {
    cart,
    totals,
    shippingAddress,
    paymentProvider
  });
  return res.data;
}

export async function apiOrdersMe() {
  const res = await api.get('/api/orders/me');
  return res.data;
}

export async function apiAdminOrders() {
  const res = await api.get('/api/admin/orders');
  return res.data;
}

export async function apiAdminDashboard() {
  const res = await api.get('/api/admin/dashboard');
  return res.data;
}

export async function apiAdminUpdateOrderStatus(orderId, status) {
  const res = await api.patch(`/api/admin/orders/${orderId}/status`, { status });
  return res.data;
}

export async function apiAdminCreateProduct(payload) {
  const res = await api.post('/api/admin/products', payload);
  return res.data;
}

export async function apiAdminUpdateProduct(productId, payload) {
  const res = await api.patch(`/api/admin/products/${productId}`, payload);
  return res.data;
}

export async function apiAdminDeleteProduct(productId) {
  const res = await api.delete(`/api/admin/products/${productId}`);
  return res.data;
}

