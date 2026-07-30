import axiosClient from './axiosClient'

export const obtenerLectores = async () => {
  try {
    const response = await axiosClient.get('/lectores')
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al cargar lectores'
  }
}

export const crearLector = async (data) => {
  try {
    const response = await axiosClient.post('/lectores', data)
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al crear el lector'
  }
}