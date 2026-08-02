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

export default function LoginForm({ onLogin }) {
  const [modo, setModo] = useState('login') // 'login' | 'registro'
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
      <h4 className="mb-4">
        Biblioteca — {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </h4>

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
            <span
              style={{ color: '#2E4057', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => cambiarModo('registro')}
            >
              Regístrate aquí
            </span>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{' '}
            <span
              style={{ color: '#2E4057', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => cambiarModo('login')}
            >
              Inicia sesión
            </span>
          </>
        )}
      </p>
    </div>
  )
}