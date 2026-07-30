import axios from 'axios'

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const axiosClient = axios.create({
  baseURL: API,
})

// Adjunta el token guardado en localStorage tras el login a cada petición
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosClient