import mongoose from 'mongoose'

const lectorSchema = new mongoose.Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  correo: { type: String, required: true },
  carrera: { type: String },
  fecha_creacion: { type: Date, default: Date.now }
})

const Lector = mongoose.model('Lector', lectorSchema)
export default Lector