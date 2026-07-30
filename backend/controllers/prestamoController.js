import mongoose from "mongoose"
import { isValidObjectId } from "mongoose"
import Prestamo from "../models/Prestamo.js"
import Libro from "../models/Libro.js"

const DIAS_PRESTAMO = 7 // plazo estándar de devolución

// ===== CRUD básico =====

// Registrar un nuevo préstamo
export const crearPrestamo = async (req, res) => {
  const { idLibro, idLector } = req.body

  if (!idLibro || !isValidObjectId(idLibro))
    return res.status(400).json({ mensaje: "Debe proporcionar un idLibro válido" })
  if (!idLector || !isValidObjectId(idLector))
    return res.status(400).json({ mensaje: "Debe proporcionar un idLector válido" })

  try {
    const libro = await Libro.findById(idLibro)
    if (!libro)
      return res.status(404).json({ mensaje: "El libro no existe" })
    if (libro.ejemplaresDisponibles <= 0)
      return res.status(400).json({ mensaje: "No hay ejemplares disponibles de este libro" })

    const fechaPrestamo = new Date()
    const fechaDevolucionEsperada = new Date(fechaPrestamo)
    fechaDevolucionEsperada.setDate(fechaDevolucionEsperada.getDate() + DIAS_PRESTAMO)

    const nuevoPrestamo = new Prestamo({
      idLibro,
      idLector,
      fechaPrestamo,
      fechaDevolucionEsperada,
      estado: "prestado"
    })
    await nuevoPrestamo.save()

    // Descuenta un ejemplar disponible
    libro.ejemplaresDisponibles -= 1
    await libro.save()

    res.status(201).json({ mensaje: "Préstamo registrado con éxito", prestamo: nuevoPrestamo })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el préstamo" })
  }
}

// Listar todos los préstamos, con la información del libro y del lector ya incluida
export const obtenerPrestamos = async (req, res) => {
  try {
    const prestamos = await Prestamo.find()
      .populate("idLibro", "titulo autor imagenUrl")
      .populate("idLector", "nombres apellidos correo")
      .sort({ fechaPrestamo: -1 })
    res.json(prestamos)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los préstamos" })
  }
}

// Listar los préstamos de un lector específico
export const obtenerPrestamosPorLector = async (req, res) => {
  const idLector = req.query.idLector
  if (!idLector || !isValidObjectId(idLector))
    return res.status(400).json({ mensaje: "Debe proporcionar un idLector válido" })

  try {
    const prestamos = await Prestamo.find({ idLector })
      .populate("idLibro", "titulo autor imagenUrl")
      .sort({ fechaPrestamo: -1 })
    res.json(prestamos)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los préstamos del lector" })
  }
}

// Marcar un préstamo como devuelto
export const devolverPrestamo = async (req, res) => {
  const { idPrestamo } = req.body
  if (!idPrestamo || !isValidObjectId(idPrestamo))
    return res.status(400).json({ mensaje: "Debe proporcionar un idPrestamo válido" })

  try {
    const prestamo = await Prestamo.findById(idPrestamo)
    if (!prestamo)
      return res.status(404).json({ mensaje: "Préstamo no encontrado" })
    if (prestamo.estado === "devuelto")
      return res.status(400).json({ mensaje: "Este préstamo ya fue devuelto" })

    prestamo.fechaDevolucionReal = new Date()
    prestamo.estado = "devuelto"
    await prestamo.save()

    // Regresa el ejemplar disponible
    await Libro.updateOne({ _id: prestamo.idLibro }, { $inc: { ejemplaresDisponibles: 1 } })

    res.json({ mensaje: "Préstamo marcado como devuelto", prestamo })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al procesar la devolución" })
  }
}

// ===== Consultas de agregación (lo importante para Bases de Datos 2) =====

// Los 5 libros más prestados de todos los tiempos
export const librosMasPrestados = async (req, res) => {
  try {
    const resultado = await Prestamo.aggregate([
      {
        $group: {
          _id: "$idLibro",
          totalPrestamos: { $sum: 1 }
        }
      },
      { $sort: { totalPrestamos: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "libros",           // nombre de la colección en MongoDB (plural, minúsculas)
          localField: "_id",
          foreignField: "_id",
          as: "libro"
        }
      },
      { $unwind: "$libro" },
      {
        $project: {
          _id: 0,
          idLibro: "$_id",
          titulo: "$libro.titulo",
          autor: "$libro.autor",
          totalPrestamos: 1
        }
      }
    ])
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al calcular los libros más prestados" })
  }
}

// Préstamos actualmente atrasados (no devueltos y ya pasó la fecha esperada)
export const prestamosAtrasados = async (req, res) => {
  try {
    const resultado = await Prestamo.aggregate([
      {
        $match: {
          estado: "prestado",
          fechaDevolucionEsperada: { $lt: new Date() }
        }
      },
      {
        $lookup: {
          from: "libros",
          localField: "idLibro",
          foreignField: "_id",
          as: "libro"
        }
      },
      { $unwind: "$libro" },
      {
        $lookup: {
          from: "lectors", // Mongoose pluraliza "Lector" como "lectors" en inglés
          localField: "idLector",
          foreignField: "_id",
          as: "lector"
        }
      },
      { $unwind: "$lector" },
      {
        $project: {
          titulo: "$libro.titulo",
          lector: { $concat: ["$lector.nombres", " ", "$lector.apellidos"] },
          fechaPrestamo: 1,
          fechaDevolucionEsperada: 1,
          diasAtraso: {
            $dateDiff: {
              startDate: "$fechaDevolucionEsperada",
              endDate: new Date(),
              unit: "day"
            }
          }
        }
      },
      { $sort: { diasAtraso: -1 } }
    ])
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al calcular los préstamos atrasados" })
  }
}

// Promedio de días que tardan los lectores en devolver un libro
export const promedioDiasDevolucion = async (req, res) => {
  try {
    const resultado = await Prestamo.aggregate([
      { $match: { estado: "devuelto", fechaDevolucionReal: { $ne: null } } },
      {
        $project: {
          dias: {
            $dateDiff: {
              startDate: "$fechaPrestamo",
              endDate: "$fechaDevolucionReal",
              unit: "day"
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          promedioDias: { $avg: "$dias" },
          totalDevoluciones: { $sum: 1 }
        }
      },
      { $project: { _id: 0, promedioDias: { $round: ["$promedioDias", 1] }, totalDevoluciones: 1 } }
    ])
    res.json(resultado[0] || { promedioDias: 0, totalDevoluciones: 0 })
  } catch (error) {
    res.status(500).json({ mensaje: "Error al calcular el promedio de devolución" })
  }
}

// Lectores con más préstamos históricos (top 5)
export const lectoresConMasPrestamos = async (req, res) => {
  try {
    const resultado = await Prestamo.aggregate([
      {
        $group: {
          _id: "$idLector",
          totalPrestamos: { $sum: 1 }
        }
      },
      { $sort: { totalPrestamos: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "lectors",
          localField: "_id",
          foreignField: "_id",
          as: "lector"
        }
      },
      { $unwind: "$lector" },
      {
        $project: {
          _id: 0,
          nombreCompleto: { $concat: ["$lector.nombres", " ", "$lector.apellidos"] },
          totalPrestamos: 1
        }
      }
    ])
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al calcular los lectores más frecuentes" })
  }
}

// Cantidad de préstamos agrupados por mes (para la gráfica de tendencia)
export const prestamosPorMes = async (req, res) => {
  try {
    const resultado = await Prestamo.aggregate([
      {
        $group: {
          _id: {
            anio: { $year: "$fechaPrestamo" },
            mes: { $month: "$fechaPrestamo" }
          },
          totalPrestamos: { $sum: 1 }
        }
      },
      { $sort: { "_id.anio": 1, "_id.mes": 1 } },
      {
        $project: {
          _id: 0,
          anio: "$_id.anio",
          mes: "$_id.mes",
          totalPrestamos: 1
        }
      }
    ])
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ mensaje: "Error al calcular los préstamos por mes" })
  }
}