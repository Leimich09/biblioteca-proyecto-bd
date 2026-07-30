import mongoose from 'mongoose'

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fecha_creacion: { type: Date, default: Date.now }
})

export default mongoose.model('Usuario', usuarioSchema)