import mongoose from 'mongoose'

const libroSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  categoria: { type: String, required: true },
  editorial: { type: String, default: 'Desconocida' },
  anioPublicacion: { type: Number },
  isbn: { type: String },
  imagenUrl: { type: String },
  ejemplaresTotales: { type: Number, required: true, min: 0 },
  ejemplaresDisponibles: { type: Number, required: true, min: 0 },
  fecha_creacion: { type: Date, default: Date.now }
})

const Libro = mongoose.model('Libro', libroSchema)
export default Libro