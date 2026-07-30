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

// Si el backend responde 401 (token inválido o expirado), cierra la sesión
// automáticamente y recarga la página para regresar al login limpio.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('nombre')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default axiosClient