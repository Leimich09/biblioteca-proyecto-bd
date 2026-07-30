import Usuario from '../models/Usuario.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Registrar usuario
export const registrar = async (req, res) => {
  const { nombre, correo, password } = req.body
  try {
    const existe = await Usuario.findOne({ correo })
    if (existe) return res.status(400).json({ mensaje: 'El correo ya está registrado' })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const nuevoUsuario = new Usuario({ nombre, correo, password: passwordHash })
    await nuevoUsuario.save()

    res.status(201).json({ mensaje: 'Usuario creado correctamente' })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario' })
  }
}

// Login
export const login = async (req, res) => {
  const { correo, password } = req.body
  try {
    const usuario = await Usuario.findOne({ correo })
    if (!usuario) return res.status(400).json({ mensaje: 'Correo no registrado' })

    const passwordValido = await bcrypt.compare(password, usuario.password)
    if (!passwordValido) return res.status(400).json({ mensaje: 'Contraseña incorrecta' })

    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.json({ token, nombre: usuario.nombre })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el login' })
  }
}