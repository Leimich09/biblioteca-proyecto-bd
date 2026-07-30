// Script de siembra de datos: se ejecuta UNA SOLA VEZ, manualmente,
// para llenar la colección Libro con datos reales tomados de Open Library.
// No forma parte de la aplicación en producción — no se llama desde el frontend.
//
// Uso: node scripts/seedLibros.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Libro from '../models/Libro.js'

dotenv.config()

// Términos de búsqueda variados, para tener libros de distintas categorías
const busquedas = [
  'cien años de soledad',
  'harry potter',
  'el principito',
  'sapiens historia',
  '1984 orwell',
  'don quijote',
  'crimen y castigo',
  'el señor de los anillos',
  'orgullo y prejuicio',
  'la sombra del viento',
  'breve historia del tiempo',
  'el alquimista coelho',
  'juego de tronos',
  'matar a un ruiseñor',
  'el gran gatsby'
]

// Trae los datos de un libro desde la API de Open Library
async function buscarLibro(termino) {
  const campos = 'title,author_name,first_publish_year,publisher,subject,isbn,cover_i'
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(termino)}&limit=1&fields=${campos}`

  try {
    const respuesta = await fetch(url, {
      headers: { 'User-Agent': 'proyecto-biblioteca-universidad (contacto@ejemplo.com)' }
    })

    if (!respuesta.ok) {
      console.log(`Error HTTP ${respuesta.status} al buscar: ${termino}`)
      return null
    }

    const data = await respuesta.json()

    if (!data.docs || data.docs.length === 0) {
      console.log(`No se encontraron resultados para: ${termino}`)
      return null
    }

    const info = data.docs[0]

    // Genera cantidades ficticias de ejemplares (la API no da esto)
    const ejemplaresTotales = Math.floor(Math.random() * 6) + 2 // entre 2 y 7
    const ejemplaresDisponibles = Math.floor(Math.random() * (ejemplaresTotales + 1))

    return {
      titulo: info.title || termino,
      autor: (info.author_name && info.author_name.join(', ')) || 'Autor desconocido',
      categoria: (info.subject && info.subject[0]) || 'General',
      editorial: (info.publisher && info.publisher[0]) || 'Desconocida',
      anioPublicacion: info.first_publish_year || null,
      isbn: (info.isbn && info.isbn[0]) || '',
      imagenUrl: info.cover_i ? `https://covers.openlibrary.org/b/id/${info.cover_i}-M.jpg` : '',
      ejemplaresTotales,
      ejemplaresDisponibles
    }
  } catch (error) {
    console.log(`Error de red al buscar "${termino}": ${error.message}`)
    return null
  }
}

async function sembrarLibros() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Conectado a MongoDB')

    // Borra los libros sembrados anteriormente, para evitar duplicados si se corre de nuevo
    await Libro.deleteMany({})
    console.log('Colección de libros limpiada')

    const libros = []
    for (const termino of busquedas) {
      const libro = await buscarLibro(termino)
      if (libro) libros.push(libro)
      // pausa entre peticiones para no saturar la API pública
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (libros.length === 0) {
      console.log('No se obtuvo ningún libro. Revisa tu conexión a internet.')
      process.exit(1)
    }

    await Libro.insertMany(libros)
    console.log(`${libros.length} libros insertados correctamente.`)
    process.exit(0)
  } catch (error) {
    console.error('Error al sembrar libros:', error.message)
    process.exit(1)
  }
}

sembrarLibros()