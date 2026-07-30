import Libro from "../models/Libro.js"
import { isValidObjectId } from "mongoose"

// Obtener todos los libros
export const obtenerLibros = async (req, res) => {
  try {
    const libros = await Libro.find()
    res.json(libros)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los libros" })
  }
}

// Crear un libro nuevo
export const crearLibro = async (req, res) => {
  try {
    const nuevoLibro = new Libro(req.body)
    const libroGuardado = await nuevoLibro.save()
    res.status(201).json(libroGuardado)
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear el libro" })
  }
}

// Consultar un libro por su id
export const obtenerLibroPorId = async (req, res) => {
  try {
    const libro = await Libro.findById(req.params.id)
    if (!libro)
      return res.status(404).json({ mensaje: "Libro no encontrado" })
    res.json(libro)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar el libro" })
  }
}

// Actualizar un libro por su id
export const actualizarLibro = async (req, res) => {
  const { id, titulo, autor } = req.body

  if (!id)
    return res.status(400).json({ mensaje: "Debe proporcionar el parámetro id" })
  if (!isValidObjectId(id))
    return res.status(400).json({ mensaje: "Debe proporcionar un id válido" })
  if (!titulo)
    return res.status(400).json({ mensaje: "Debe proporcionar el parámetro titulo" })
  if (!autor)
    return res.status(400).json({ mensaje: "Debe proporcionar el parámetro autor" })

  try {
    const resultado = await Libro.updateOne(
      { _id: id },
      { $set: { ...req.body } }
    )
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: error.message })
  }
}

// Eliminar un libro por su id
export const eliminarLibro = async (req, res) => {
  const id = req.query.id
  if (!id)
    return res.status(400).json({ mensaje: "Debes proporcionar el parámetro id" })

  try {
    const libro = await Libro.findByIdAndDelete(id)
    if (!libro)
      return res.status(404).json({ mensaje: "Libro no encontrado" })
    res.json({ mensaje: "Libro eliminado correctamente" })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el libro" })
  }
}