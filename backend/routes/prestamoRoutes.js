import express from 'express'
import {
  crearPrestamo,
  obtenerPrestamos,
  obtenerPrestamosPorLector,
  devolverPrestamo,
  librosMasPrestados,
  prestamosAtrasados,
  promedioDiasDevolucion,
  lectoresConMasPrestamos,
  prestamosPorMes
} from '../controllers/prestamoController.js'

const router = express.Router()

// CRUD básico
router.get('/', obtenerPrestamos)
router.post('/', crearPrestamo)
router.put('/devolver', devolverPrestamo)
router.get('/porLector', obtenerPrestamosPorLector)

// Consultas de agregación (dashboard / estadísticas)
router.get('/estadisticas/masPrestados', librosMasPrestados)
router.get('/estadisticas/atrasados', prestamosAtrasados)
router.get('/estadisticas/promedioDevolucion', promedioDiasDevolucion)
router.get('/estadisticas/topLectores', lectoresConMasPrestamos)
router.get('/estadisticas/porMes', prestamosPorMes)

export default router