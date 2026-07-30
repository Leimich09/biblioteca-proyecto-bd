import express from 'express'
import {
  obtenerLibros,
  crearLibro,
  obtenerLibroPorId,
  actualizarLibro,
  eliminarLibro
} from '../controllers/libroController.js'
import verificaToken from '../middleware/verificaToken.js'

const router = express.Router()

router.use(verificaToken)

router.get('/', obtenerLibros)
router.post('/', crearLibro)
router.put('/', actualizarLibro)
router.delete('/', eliminarLibro)
router.get('/:id', obtenerLibroPorId)

export default router