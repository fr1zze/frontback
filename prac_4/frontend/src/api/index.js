import axios from 'axios'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'currentUser'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setAuthData(accessToken, refreshToken, user) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:3000/api',
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json'
  }
})

apiClient.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(promise => {
    if (error) promise.reject(error)
    else promise.resolve(token)
  })
  failedQueue = []
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const response = await axios.post('http://127.0.0.1:3000/api/auth/refresh', {
    refreshToken
  })

  const { accessToken, refreshToken: newRefreshToken, user } = response.data
  setAuthData(accessToken, newRefreshToken, user)
  return accessToken
}

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newAccessToken = await refreshAccessToken()
        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const api = {
  register: async user => (await apiClient.post('/auth/register', user)).data,
  login: async credentials => (await apiClient.post('/auth/login', credentials)).data,
  me: async () => (await apiClient.get('/auth/me')).data,

  getUsers: async () => (await apiClient.get('/users')).data,
  getUserById: async id => (await apiClient.get(`/users/${id}`)).data,
  updateUser: async (id, user) => (await apiClient.put(`/users/${id}`, user)).data,
  blockUser: async id => (await apiClient.delete(`/users/${id}`)).data,

  createProduct: async product => (await apiClient.post('/products', product)).data,
  getProducts: async () => (await apiClient.get('/products')).data,
  getProductById: async id => (await apiClient.get(`/products/${id}`)).data,
  updateProduct: async (id, product) => (await apiClient.put(`/products/${id}`, product)).data,
  deleteProduct: async id => (await apiClient.delete(`/products/${id}`)).data
}