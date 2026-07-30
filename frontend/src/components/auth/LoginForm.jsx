import { CForm, CFormInput, CButton, CAlert } from '@coreui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import * as yup from 'yup'
import { login } from '../../api/authService'
import '../../App.css'

const schema = yup.object().shape({
  correo: yup.string().email('Correo inválido').required('Correo requerido'),
  password: yup.string().required('Contraseña requerida'),
})

export default function LoginForm({ onLogin }) {
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data) => {
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

  return (
    <div className="login-page">
      <h4 className="mb-4">Biblioteca — Iniciar sesión</h4>
      {error && <CAlert color="danger">{error}</CAlert>}
      <CForm onSubmit={handleSubmit(onSubmit)}>
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
      <p className="login-hint text-muted mt-4 text-center" style={{ fontSize: '0.8rem' }}>
        Nota: primero registra un usuario desde /api/auth/registrar (por ejemplo con Postman)
        para poder iniciar sesión aquí.
      </p>
    </div>
  )
}