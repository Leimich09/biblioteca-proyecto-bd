import Lector from "../models/Lector.js"
import { isValidObjectId } from "mongoose"

// Obtener todos los lectores
export const obtenerLectores = async (req, res) => {
  try {
    const lectores = await Lector.find()
    res.json(lectores)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los lectores" })
  }
}

// Crear un lector nuevo
export const crearLector = async (req, res) => {
  try {
    const nuevoLector = new Lector(req.body)
    const lectorGuardado = await nuevoLector.save()
    res.status(201).json(lectorGuardado)
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear el lector" })
  }
}

// Consultar un lector por su id
export const obtenerLectorPorId = async (req, res) => {
  try {
    const lector = await Lector.findById(req.params.id)
    if (!lector)
      return res.status(404).json({ mensaje: "Lector no encontrado" })
    res.json(lector)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar el lector" })
  }
}

// Actualizar un lector por su id
export const actualizarLector = async (req, res) => {
  const { id, nombres, apellidos } = req.body

  if (!id)
    return res.status(400).json({ mensaje: "Debe proporcionar el parámetro id" })
  if (!isValidObjectId(id))
    return res.status(400).json({ mensaje: "Debe proporcionar un id válido" })
  if (!nombres)
    return res.status(400).json({ mensaje: "Debe proporcionar el parámetro nombres" })
  if (!apellidos)
    return res.status(400).json({ mensaje: "Debe proporcionar el parámetro apellidos" })

  try {
    const resultado = await Lector.updateOne(
      { _id: id },
      { $set: { ...req.body } }
    )
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: error.message })
  }
}

// Eliminar un lector por su id
export const eliminarLector = async (req, res) => {
  const id = req.query.id
  if (!id)
    return res.status(400).json({ mensaje: "Debes proporcionar el parámetro id" })

  try {
    const lector = await Lector.findByIdAndDelete(id)
    if (!lector)
      return res.status(404).json({ mensaje: "Lector no encontrado" })
    res.json({ mensaje: "Lector eliminado correctamente" })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el lector" })
  }
}