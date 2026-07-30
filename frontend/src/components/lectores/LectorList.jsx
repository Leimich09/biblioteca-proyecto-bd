import { CForm, CFormInput, CButton, CAlert, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { obtenerLectores, crearLector } from '../../api/lectorService'

const schema = yup.object().shape({
  nombres: yup.string().required('Los nombres son requeridos'),
  apellidos: yup.string().required('Los apellidos son requeridos'),
  correo: yup.string().email('Correo inválido').required('El correo es requerido'),
  carrera: yup.string(),
})

export default function LectorList() {
  const [lectores, setLectores] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  const cargarLectores = async () => {
    try {
      const data = await obtenerLectores()
      setLectores(data)
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al cargar lectores')
    }
  }

  useEffect(() => {
    cargarLectores()
  }, [])

  const onSubmit = async (data) => {
    setMensaje('')
    setError('')
    try {
      await crearLector(data)
      setMensaje('Lector agregado con éxito')
      reset()
      cargarLectores()
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al agregar el lector')
    }
  }

  return (
    <div>
      <div className="app-card mb-4">
        <h5 className="mb-3">Agregar lector</h5>
        {mensaje && <CAlert color="success">{mensaje}</CAlert>}
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={handleSubmit(onSubmit)}>
          <CRow>
            <CCol md={3}>
              <CFormInput label="Nombres" className="mb-3" {...register('nombres')} invalid={!!errors.nombres} feedback={errors.nombres?.message} />
            </CCol>
            <CCol md={3}>
              <CFormInput label="Apellidos" className="mb-3" {...register('apellidos')} invalid={!!errors.apellidos} feedback={errors.apellidos?.message} />
            </CCol>
            <CCol md={3}>
              <CFormInput label="Correo" className="mb-3" {...register('correo')} invalid={!!errors.correo} feedback={errors.correo?.message} />
            </CCol>
            <CCol md={3}>
              <CFormInput label="Carrera" className="mb-3" {...register('carrera')} />
            </CCol>
          </CRow>
          <CButton color="primary" type="submit">Guardar Lector</CButton>
        </CForm>
      </div>

      <div className="app-card">
        <h5 className="mb-3">Lectores registrados ({lectores.length})</h5>
        <CTable striped responsive bordered>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nombres</CTableHeaderCell>
              <CTableHeaderCell>Apellidos</CTableHeaderCell>
              <CTableHeaderCell>Correo</CTableHeaderCell>
              <CTableHeaderCell>Carrera</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {lectores.map((l) => (
              <CTableRow key={l._id}>
                <CTableDataCell>{l.nombres}</CTableDataCell>
                <CTableDataCell>{l.apellidos}</CTableDataCell>
                <CTableDataCell>{l.correo}</CTableDataCell>
                <CTableDataCell>{l.carrera || '-'}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>
    </div>
  )
}