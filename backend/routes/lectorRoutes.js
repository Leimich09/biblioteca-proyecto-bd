import express from 'express'
import {
  obtenerLectores,
  crearLector,
  obtenerLectorPorId,
  actualizarLector,
  eliminarLector
} from '../controllers/lectorController.js'
import verificaToken from '../middleware/verificaToken.js'

const router = express.Router()

router.use(verificaToken)

router.get('/', obtenerLectores)
router.post('/', crearLector)
router.put('/', actualizarLector)
router.delete('/', eliminarLector)
router.get('/:id', obtenerLectorPorId)

export default router