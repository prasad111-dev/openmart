import axios from 'axios'
import { useAuthStore } from '@/store'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (error: unknown) => void }> = []

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        const { token: newToken, refreshToken: newRefreshToken } = data.data
        useAuthStore.getState().setAuth(useAuthStore.getState().user!, newToken, newRefreshToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        processQueue(error, null)
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  // Login with email/password
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  // Register with email/password
  register: (name: string, email: string, password: string, phone?: string, role?: string) =>
    api.post('/auth/register', { name, email, password, phone, role }),
  
  // Admin login
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin-login', { email, password }),
  
  // Social login
  socialLogin: (provider: string, providerId: string, email?: string, name?: string, avatar?: string) =>
    api.post('/auth/social', { provider, providerId, email, name, avatar }),
  
  // Register user (admin only)
  registerUser: (data: { name: string; phone?: string; email?: string; role: string; password?: string }) =>
    api.post('/auth/admin/register-user', data),
  
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateMe: (data: { name: string; email?: string; phone?: string; avatar?: string }) =>
    api.put('/auth/me', data),
  // Phone OTP login
  sendOtp: (phone: string) =>
    api.post('/auth/otp/send', { phone }),
  verifyOtp: (phone: string, otp: string) =>
    api.post('/auth/otp/verify', { phone, otp }),
}

export const shopApi = {
  list: (params?: { pincode?: string; category?: string; search?: string }) =>
    api.get('/shops', { params }),
  get: (id: string) => api.get(`/shops/${id}`),
  create: (data: any) => api.post('/shops', data),
  update: (id: string, data: any) => api.put(`/shops/${id}`, data),
  getProducts: (id: string) => api.get(`/shops/${id}/products`),
  addProduct: (id: string, data: any) => api.post(`/shops/${id}/products`, data),
  updateProduct: (shopId: string, productId: string, data: any) =>
    api.put(`/shops/${shopId}/products/${productId}`, data),
  deleteProduct: (shopId: string, productId: string) =>
    api.delete(`/shops/${shopId}/products/${productId}`),
  getOrders: (id: string) => api.get(`/shops/${id}/orders`),
  getDeliveryBoys: (shopId: string) => api.get(`/shops/${shopId}/delivery-boys`),
  getCategories: () => api.get('/shops/categories'),
  toggleOpen: (id: string) => api.put(`/shops/${id}/toggle-open`),
}

export const adminApi = {
  getShops: (status?: string) => api.get(`/admin/shops${status ? `?status=${status}` : ''}`),
  createShop: (data: any) => api.post('/admin/shops', data),
  updateShop: (id: string, data: any) => api.put(`/admin/shops/${id}`, data),
  approveShop: (id: string) => api.put(`/admin/shops/${id}/approve`),
  rejectShop: (id: string) => api.put(`/admin/shops/${id}/reject`),
  toggleShop: (id: string) => api.put(`/admin/shops/${id}/toggle`),
  getUsers: () => api.get('/admin/users'),
  getDeliveryBoys: () => api.get('/admin/delivery-boys'),
  updateUserRole: (userId: string, role: string) => api.put(`/admin/users/${userId}/role`, { role }),
  blockUser: (userId: string) => api.put(`/admin/users/${userId}/block`),
  updateUserPassword: (userId: string, newPassword: string) => api.put(`/admin/users/${userId}/password`, { password: newPassword }),
  updateDeliveryBoy: (id: string, data: { name?: string; phone?: string; email?: string }) => api.put(`/admin/delivery-boys/${id}`, data),
  getStats: () => api.get('/admin/stats'),
  getOrders: (status?: string) => api.get(`/admin/orders${status ? `?status=${status}` : ''}`),
  getSellerSettlements: () => api.get('/admin/seller-settlements'),
  getSellerSettlement: (shopId: string) => api.get(`/admin/seller-settlements/${shopId}`),
  recordSellerPayment: (data: { shopId: string; amount: number; note?: string; paymentDate?: string }) => api.post('/admin/seller-payments', data),
  getPlatformSettings: () => api.get('/admin/settings'),
  updatePlatformSettings: (data: { platformFee?: number; deliveryCharge?: number; freeDeliveryThreshold?: number; minimumOrderAmount?: number }) => api.put('/admin/platform-settings', data),
}

export const orderApi = {
  list: () => api.get('/orders'),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id: string) => api.put(`/orders/${id}/cancel`),
  assignDelivery: (id: string, deliveryBoyId: string) => api.post(`/orders/${id}/assign-delivery`, { deliveryBoyId }),
  markDelivered: (id: string) => api.put(`/orders/${id}/deliver`),
}

export const productApi = {
  list: (params?: { search?: string; category?: string; shopId?: string; pincode?: string }) =>
    api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  categories: () => api.get('/products/categories'),
}

export const categoryApi = {
  list: (type?: string) => api.get('/categories', { params: { type } }),
  all: () => api.get('/categories/all'),
  create: (data: { name: string; description?: string; type: 'PRODUCT' | 'SHOP' }) =>
    api.post('/categories', data),
  update: (id: string, data: { name?: string; description?: string; isActive?: boolean }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

export const cartApi = {
  get: () => api.get('/cart'),
  add: (data: { shopId: string; productId: string; quantity: number; price: number }) =>
    api.post('/cart/add', data),
  update: (productId: string, quantity: number) =>
    api.put('/cart/update', { productId, quantity }),
  remove: (productId: string) => api.delete(`/cart/remove?productId=${productId}`),
  clear: () => api.delete('/cart/clear'),
}

export const addressApi = {
  list: () => api.get('/addresses'),
  create: (data: any) => api.post('/addresses', data),
  update: (id: string, data: any) => api.put(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
  setDefault: (id: string) => api.put(`/addresses/${id}/set-default`),
}

export const deliveryApi = {
  list: () => api.get('/delivery/assignments'),
  updateStatus: (id: string, status: string) =>
    api.put(`/delivery/${id}/update-status`, { status }),
  verifyOtp: (id: string, otp: string) =>
    api.post(`/delivery/${id}/verify-otp`, { otp }),
  updateLocation: (lat: number, lng: number) =>
    api.put('/delivery/location/update', { lat, lng }),
  getLocation: (deliveryId: string) =>
    api.get(`/delivery/${deliveryId}/location`),
  getOrderLocation: (orderId: string) =>
    api.get(`/delivery/order/${orderId}/location`),
}

export const reviewApi = {
  list: (params?: { shopId?: string; productId?: string; rating?: number; page?: number; limit?: number }) =>
    api.get('/reviews', { params }),
  get: (id: string) => api.get(`/reviews/${id}`),
  create: (data: { shopId?: string; productId?: string; orderId?: string; rating: number; comment?: string; images?: any }) =>
    api.post('/reviews', data),
  update: (id: string, data: { rating?: number; comment?: string }) =>
    api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  adminAll: (params?: { page?: number; limit?: number; shopId?: string; rating?: number }) =>
    api.get('/reviews/admin/all', { params }),
}

export default api