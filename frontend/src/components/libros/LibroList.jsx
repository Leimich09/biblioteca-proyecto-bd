import { CForm, CFormInput, CButton, CAlert, CRow, CCol } from '@coreui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { obtenerLibros, crearLibro } from '../../api/libroService'

const schema = yup.object().shape({
  titulo: yup.string().required('El título es requerido'),
  autor: yup.string().required('El autor es requerido'),
  categoria: yup.string().required('La categoría es requerida'),
  editorial: yup.string(),
  anioPublicacion: yup.number().typeError('Debe ser un número'),
  ejemplaresTotales: yup.number().typeError('Debe ser un número').min(1, 'Debe ser al menos 1').required('Requerido'),
})

export default function LibroList() {
  const [libros, setLibros] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  const cargarLibros = async () => {
    try {
      const data = await obtenerLibros()
      setLibros(data)
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al cargar libros')
    }
  }

  useEffect(() => {
    cargarLibros()
  }, [])

  const onSubmit = async (data) => {
    setMensaje('')
    setError('')
    try {
      await crearLibro({ ...data, ejemplaresDisponibles: data.ejemplaresTotales })
      setMensaje('Libro agregado con éxito')
      reset()
      cargarLibros()
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al agregar el libro')
    }
  }

  return (
    <div>
      <div className="app-card mb-4">
        <h5 className="mb-3">Agregar libro</h5>
        {mensaje && <CAlert color="success">{mensaje}</CAlert>}
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CRow>
            <CCol md={4}>
              <CFormInput label="Título" className="mb-3" {...register('titulo')} invalid={!!errors.titulo} feedback={errors.titulo?.message} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Autor" className="mb-3" {...register('autor')} invalid={!!errors.autor} feedback={errors.autor?.message} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Categoría" className="mb-3" {...register('categoria')} invalid={!!errors.categoria} feedback={errors.categoria?.message} />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={4}>
              <CFormInput label="Editorial" className="mb-3" {...register('editorial')} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Año" type="number" className="mb-3" {...register('anioPublicacion')} invalid={!!errors.anioPublicacion} feedback={errors.anioPublicacion?.message} />
            </CCol>
            <CCol md={4}>
              <CFormInput label="Ejemplares" type="number" className="mb-3" {...register('ejemplaresTotales')} invalid={!!errors.ejemplaresTotales} feedback={errors.ejemplaresTotales?.message} />
            </CCol>
          </CRow>
          <CButton color="primary" type="submit">Guardar Libro</CButton>
        </CForm>
      </div>

      <h5 className="mb-3">Catálogo ({libros.length} libros)</h5>
      <CRow>
        {libros.map((libro) => (
          <CCol md={3} key={libro._id} className="mb-4">
            <div className="app-card h-100 text-center">
              {libro.imagenUrl ? (
                <img src={libro.imagenUrl} alt={libro.titulo} style={{ height: 140, objectFit: 'contain', marginBottom: 10 }} />
              ) : (
                <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  Sin portada
                </div>
              )}
              <strong>{libro.titulo}</strong>
              <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>{libro.autor}</p>
              <p className="mb-0" style={{ fontSize: '0.8rem' }}>
                Disponibles: <strong>{libro.ejemplaresDisponibles}</strong> / {libro.ejemplaresTotales}
              </p>
            </div>
          </CCol>
        ))}
      </CRow>
    </div>
  )
}