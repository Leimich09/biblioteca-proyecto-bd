import axiosClient from './axiosClient'

export const obtenerPrestamos = async () => {
  try {
    const response = await axiosClient.get('/prestamos')
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al cargar préstamos'
  }
}

export const crearPrestamo = async (idLibro, idLector) => {
  try {
    const response = await axiosClient.post('/prestamos', { idLibro, idLector })
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al registrar el préstamo'
  }
}

export const devolverPrestamo = async (idPrestamo) => {
  try {
    const response = await axiosClient.put('/prestamos/devolver', { idPrestamo })
    return response.data
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al procesar la devolución'
  }
}

// ===== Estadísticas para el dashboard =====

export const getLibrosMasPrestados = async () => {
  const response = await axiosClient.get('/prestamos/estadisticas/masPrestados')
  return response.data
}

export const getPrestamosAtrasados = async () => {
  const response = await axiosClient.get('/prestamos/estadisticas/atrasados')
  return response.data
}

export const getPromedioDevolucion = async () => {
  const response = await axiosClient.get('/prestamos/estadisticas/promedioDevolucion')
  return response.data
}

export const getTopLectores = async () => {
  const response = await axiosClient.get('/prestamos/estadisticas/topLectores')
  return response.data
}

export const getPrestamosPorMes = async () => {
  const response = await axiosClient.get('/prestamos/estadisticas/porMes')
  return response.data
}