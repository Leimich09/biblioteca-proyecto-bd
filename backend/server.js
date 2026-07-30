import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import libroRoutes from './routes/libroRoutes.js'
import lectorRoutes from './routes/lectorRoutes.js'
import prestamoRoutes from './routes/prestamoRoutes.js'

dotenv.config()
const app = express()

connectDB()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ mensaje: 'Bienvenido a la API de Biblioteca' })
})

app.use('/api/auth', authRoutes)
app.use('/api/libros', libroRoutes)
app.use('/api/lectores', lectorRoutes)
app.use('/api/prestamos', prestamoRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})