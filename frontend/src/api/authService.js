import axiosClient from './axiosClient'

export const login = async (correo, password) => {
  try {
    const response = await axiosClient.post('/auth/login', { correo, password })
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al iniciar sesión'
  }
}

export const registrar = async (nombre, correo, password) => {
  try {
    const response = await axiosClient.post('/auth/registrar', { nombre, correo, password })
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al registrar usuario'
  }
}