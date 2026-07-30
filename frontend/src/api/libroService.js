import axiosClient from './axiosClient'

export const obtenerLibros = async () => {
  try {
    const response = await axiosClient.get('/libros')
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al cargar libros'
  }
}

export const crearLibro = async (data) => {
  try {
    const response = await axiosClient.post('/libros', data)
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al crear el libro'
  }
}

export const eliminarLibro = async (id) => {
  try {
    const response = await axiosClient.delete('/libros', { params: { id } })
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al eliminar el libro'
  }
}