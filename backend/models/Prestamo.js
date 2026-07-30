import mongoose from 'mongoose'

const prestamoSchema = new mongoose.Schema({
  idLibro: { type: mongoose.Schema.Types.ObjectId, ref: 'Libro', required: true },
  idLector: { type: mongoose.Schema.Types.ObjectId, ref: 'Lector', required: true },
  fechaPrestamo: { type: Date, required: true, default: Date.now },
  fechaDevolucionEsperada: { type: Date, required: true },
  fechaDevolucionReal: { type: Date, default: null },
  estado: {
    type: String,
    enum: ['prestado', 'devuelto', 'atrasado'],
    default: 'prestado'
  },
  fecha_creacion: { type: Date, default: Date.now }
})

const Prestamo = mongoose.model('Prestamo', prestamoSchema)
export default Prestamo