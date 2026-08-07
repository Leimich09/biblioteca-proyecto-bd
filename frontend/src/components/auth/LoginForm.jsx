import { CForm, CFormInput, CButton, CAlert } from '@coreui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import * as yup from 'yup'
import { login, registrar } from '../../api/authService'
import '../../App.css'

const schemaLogin = yup.object().shape({
  correo: yup.string().email('Correo inválido').required('Correo requerido'),
  password: yup.string().required('Contraseña requerida'),
})

const schemaRegistro = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido'),
  correo: yup.string().email('Correo inválido').required('Correo requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña requerida'),
})

// Emblema simple de libro abierto, en el color principal del tema
function EmblemaLibro() {
  return (
    <div className="login-emblema">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F6F1E4" strokeWidth="1.6">
        <path d="M12 6c-1.6-1.2-3.6-1.8-6-1.8v13.6c2.4 0 4.4.6 6 1.8 1.6-1.2 3.6-1.8 6-1.8V4.2c-2.4 0-4.4.6-6 1.8Z" />
        <path d="M12 6v13.6" />
      </svg>
    </div>
  )
}

export default function LoginForm({ onLogin }) {
  const [modo, setModo] = useState('login')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(modo === 'login' ? schemaLogin : schemaRegistro) })

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setError('')
    setMensaje('')
    reset()
  }

  const onSubmitLogin = async (data) => {
    setError('')
    try {
      const res = await login(data.correo, data.password)
      localStorage.setItem('token', res.token)
      localStorage.setItem('nombre', res.nombre)
      onLogin(res.nombre)
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al iniciar sesión')
    }
  }

  const onSubmitRegistro = async (data) => {
    setError('')
    setMensaje('')
    try {
      await registrar(data.nombre, data.correo, data.password)
      setMensaje('Cuenta creada con éxito. Ahora puedes iniciar sesión.')
      reset()
      setModo('login')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al registrar usuario')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <EmblemaLibro />

        <h4 className="mb-1">Biblioteca</h4>
        <p className="login-subtitulo">
          {modo === 'login' ? 'Bienvenido de nuevo' : 'Únete al sistema'}
        </p>

        {error && <CAlert color="danger">{error}</CAlert>}
        {mensaje && <CAlert color="success">{mensaje}</CAlert>}

        {modo === 'login' ? (
          <CForm onSubmit={handleSubmit(onSubmitLogin)}>
            <CFormInput
              label="Correo"
              placeholder="usuario@correo.com"
              className="mb-2"
              {...register('correo')}
              invalid={!!errors.correo}
              feedback={errors.correo?.message}
            />
            <CFormInput
              label="Contraseña"
              type="password"
              className="mb-3"
              {...register('password')}
              invalid={!!errors.password}
              feedback={errors.password?.message}
            />
            <CButton color="primary" type="submit" className="w-100">
              Ingresar
            </CButton>
          </CForm>
        ) : (
          <CForm onSubmit={handleSubmit(onSubmitRegistro)}>
            <CFormInput
              label="Nombre"
              placeholder="Tu nombre"
              className="mb-2"
              {...register('nombre')}
              invalid={!!errors.nombre}
              feedback={errors.nombre?.message}
            />
            <CFormInput
              label="Correo"
              placeholder="usuario@correo.com"
              className="mb-2"
              {...register('correo')}
              invalid={!!errors.correo}
              feedback={errors.correo?.message}
            />
            <CFormInput
              label="Contraseña"
              type="password"
              className="mb-3"
              {...register('password')}
              invalid={!!errors.password}
              feedback={errors.password?.message}
            />
            <CButton color="primary" type="submit" className="w-100">
              Crear cuenta
            </CButton>
          </CForm>
        )}

        <p className="login-hint text-muted mt-4 text-center" style={{ fontSize: '0.85rem' }}>
          {modo === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <span className="login-link" onClick={() => cambiarModo('registro')}>
                Regístrate aquí
              </span>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <span className="login-link" onClick={() => cambiarModo('login')}>
                Inicia sesión
              </span>
            </>
          )}
        </p>
      </div>

      <p className="login-cita">
        "Una biblioteca es el testimonio de lo que una civilización considera importante."
      </p>
    </div>
  )
}