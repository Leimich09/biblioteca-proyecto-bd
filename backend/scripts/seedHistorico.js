// Script de siembra de datos HISTÓRICOS: lectores ficticios + préstamos
// repartidos en los últimos 6 meses, para que las gráficas del dashboard
// tengan datos variados en vez de solo lo de hoy.
//
// Se ejecuta UNA SOLA VEZ, manualmente. No forma parte de la app en producción.
//
// IMPORTANTE: este script BORRA los lectores y préstamos existentes,
// y reinicia los ejemplares disponibles de cada libro a su total original,
// para partir de un estado limpio y consistente.
//
// Uso: node scripts/seedHistorico.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Libro from '../models/Libro.js'
import Lector from '../models/Lector.js'
import Prestamo from '../models/Prestamo.js'

dotenv.config()

const DIAS_PRESTAMO = 7

const carreras = [
  'Ingeniería en Sistemas',
  'Administración de Empresas',
  'Medicina',
  'Derecho',
  'Arquitectura',
  'Psicología',
  'Contabilidad y Auditoría',
  'Ingeniería Civil'
]

const lectoresFicticios = [
  { nombres: 'María José', apellidos: 'Andrade Solís' },
  { nombres: 'Andrés Felipe', apellidos: 'Cedeño Ruiz' },
  { nombres: 'Camila Sofía', apellidos: 'Zambrano Vera' },
  { nombres: 'Luis Alberto', apellidos: 'Mendoza Ponce' },
  { nombres: 'Valentina Nicole', apellidos: 'Chávez Loor' },
  { nombres: 'Kevin Josué', apellidos: 'Bravo Intriago' },
  { nombres: 'Génesis Paola', apellidos: 'Delgado Macías' },
  { nombres: 'Steven Alexander', apellidos: 'Palma García' },
  { nombres: 'Doménica Isabel', apellidos: 'Vélez Moreira' },
  { nombres: 'Jonathan David', apellidos: 'Alcívar Pico' },
  { nombres: 'Ariana Belén', apellidos: 'Rezabala Cantos' },
  { nombres: 'Bryan Alexis', apellidos: 'Quiñónez Palma' }
]

function fechaAleatoriaUltimosMeses(diasAtras) {
  const hoy = new Date()
  const diasAleatorios = Math.floor(Math.random() * diasAtras)
  const fecha = new Date(hoy)
  fecha.setDate(fecha.getDate() - diasAleatorios)
  return fecha
}

async function sembrarHistorico() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Conectado a MongoDB')

    // Limpia lectores y préstamos anteriores para partir de un estado consistente
    await Lector.deleteMany({})
    await Prestamo.deleteMany({})
    console.log('Lectores y préstamos anteriores eliminados')

    // Reinicia los ejemplares disponibles de cada libro a su total original
    const libros = await Libro.find()
    if (libros.length === 0) {
      console.log('No hay libros en la base de datos. Corre primero scripts/seedLibros.js')
      process.exit(1)
    }
    for (const libro of libros) {
      libro.ejemplaresDisponibles = libro.ejemplaresTotales
      await libro.save()
    }
    console.log(`Ejemplares disponibles reiniciados en ${libros.length} libros`)

    // Crea los lectores ficticios
    const lectoresCreados = []
    for (let i = 0; i < lectoresFicticios.length; i++) {
      const l = lectoresFicticios[i]
      const lector = new Lector({
        nombres: l.nombres,
        apellidos: l.apellidos,
        correo: `${l.nombres.split(' ')[0].toLowerCase()}.${l.apellidos.split(' ')[0].toLowerCase()}@correo.com`,
        carrera: carreras[i % carreras.length]
      })
      await lector.save()
      lectoresCreados.push(lector)
    }
    console.log(`${lectoresCreados.length} lectores creados`)

    // Mapa de ejemplares disponibles en memoria, para no pasarnos al simular préstamos
    const disponiblesPorLibro = {}
    libros.forEach((l) => { disponiblesPorLibro[l._id.toString()] = l.ejemplaresDisponibles })

    const TOTAL_PRESTAMOS = 45
    let prestamosCreados = 0
    let intentos = 0

    while (prestamosCreados < TOTAL_PRESTAMOS && intentos < TOTAL_PRESTAMOS * 4) {
      intentos++

      const libro = libros[Math.floor(Math.random() * libros.length)]
      const lector = lectoresCreados[Math.floor(Math.random() * lectoresCreados.length)]
      const idLibroStr = libro._id.toString()

      const fechaPrestamo = fechaAleatoriaUltimosMeses(180) // últimos 6 meses
      const fechaDevolucionEsperada = new Date(fechaPrestamo)
      fechaDevolucionEsperada.setDate(fechaDevolucionEsperada.getDate() + DIAS_PRESTAMO)

      // 75% de los préstamos ya fueron devueltos, 25% siguen activos (algunos atrasados)
      const yaDevuelto = Math.random() < 0.75

      let fechaDevolucionReal = null
      let estado = 'prestado'

      if (yaDevuelto) {
        // Se devolvió entre 1 y 15 días después del préstamo
        const diasParaDevolver = Math.floor(Math.random() * 15) + 1
        fechaDevolucionReal = new Date(fechaPrestamo)
        fechaDevolucionReal.setDate(fechaDevolucionReal.getDate() + diasParaDevolver)

        // Si esa fecha de devolución cae en el futuro, lo dejamos como no devuelto todavía
        if (fechaDevolucionReal > new Date()) {
          fechaDevolucionReal = null
          estado = 'prestado'
        } else {
          estado = 'devuelto'
        }
      }

      // Si sigue "prestado", debe seguir descontando un ejemplar disponible
      if (estado === 'prestado') {
        if (disponiblesPorLibro[idLibroStr] <= 0) continue // no hay ejemplares, prueba con otro libro
        disponiblesPorLibro[idLibroStr] -= 1
      }

      const prestamo = new Prestamo({
        idLibro: libro._id,
        idLector: lector._id,
        fechaPrestamo,
        fechaDevolucionEsperada,
        fechaDevolucionReal,
        estado
      })
      await prestamo.save()
      prestamosCreados++
    }

    // Sincroniza los ejemplares disponibles finales en la base de datos
    for (const libro of libros) {
      libro.ejemplaresDisponibles = disponiblesPorLibro[libro._id.toString()]
      await libro.save()
    }

    console.log(`${prestamosCreados} préstamos históricos creados`)
    console.log('Siembra histórica completada con éxito')
    process.exit(0)
  } catch (error) {
    console.error('Error al sembrar datos históricos:', error.message)
    process.exit(1)
  }
}

sembrarHistorico()