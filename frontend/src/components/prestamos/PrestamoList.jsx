import { CForm, CFormSelect, CButton, CAlert, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge } from '@coreui/react'
import { useEffect, useState } from 'react'
import { obtenerLibros } from '../../api/libroService'
import { obtenerLectores } from '../../api/lectorService'
import { obtenerPrestamos, crearPrestamo, devolverPrestamo } from '../../api/prestamoService'

export default function PrestamoList() {
  const [libros, setLibros] = useState([])
  const [lectores, setLectores] = useState([])
  const [prestamos, setPrestamos] = useState([])
  const [idLibro, setIdLibro] = useState('')
  const [idLector, setIdLector] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const cargarTodo = async () => {
    try {
      const [dataLibros, dataLectores, dataPrestamos] = await Promise.all([
        obtenerLibros(),
        obtenerLectores(),
        obtenerPrestamos(),
      ])
      setLibros(dataLibros)
      setLectores(dataLectores)
      setPrestamos(dataPrestamos)
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al cargar los datos')
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    if (!idLibro || !idLector) {
      setError('Debe seleccionar un libro y un lector')
      return
    }

    try {
      await crearPrestamo(idLibro, idLector)
      setMensaje('Préstamo registrado con éxito')
      setIdLibro('')
      setIdLector('')
      cargarTodo()
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al registrar el préstamo')
    }
  }

  const handleDevolver = async (idPrestamo) => {
    setMensaje('')
    setError('')
    try {
      await devolverPrestamo(idPrestamo)
      setMensaje('Préstamo marcado como devuelto')
      cargarTodo()
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al procesar la devolución')
    }
  }

  const esAtrasado = (prestamo) => {
    return (
      prestamo.estado === 'prestado' &&
      new Date(prestamo.fechaDevolucionEsperada) < new Date()
    )
  }

  return (
    <div>
      <div className="app-card mb-4">
        <h5 className="mb-3">Registrar préstamo</h5>
        {mensaje && <CAlert color="success">{mensaje}</CAlert>}
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={onSubmit}>
          <CRow>
            <CCol md={5}>
              <CFormSelect label="Libro" value={idLibro} onChange={(e) => setIdLibro(e.target.value)} className="mb-3">
                <option value="">-- Seleccionar libro --</option>
                {libros.map((l) => (
                  <option key={l._id} value={l._id} disabled={l.ejemplaresDisponibles <= 0}>
                    {l.titulo} ({l.ejemplaresDisponibles} disponibles)
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={5}>
              <CFormSelect label="Lector" value={idLector} onChange={(e) => setIdLector(e.target.value)} className="mb-3">
                <option value="">-- Seleccionar lector --</option>
                {lectores.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.nombres} {l.apellidos}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2} className="d-flex align-items-end mb-3">
              <CButton color="primary" type="submit" className="w-100">Prestar</CButton>
            </CCol>
          </CRow>
        </CForm>
      </div>

      <div className="app-card">
        <h5 className="mb-3">Historial de préstamos ({prestamos.length})</h5>
        <CTable striped responsive bordered>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Libro</CTableHeaderCell>
              <CTableHeaderCell>Lector</CTableHeaderCell>
              <CTableHeaderCell>Fecha préstamo</CTableHeaderCell>
              <CTableHeaderCell>Fecha esperada</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Acción</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {prestamos.map((p) => (
              <CTableRow key={p._id}>
                <CTableDataCell>{p.idLibro?.titulo || '(libro eliminado)'}</CTableDataCell>
                <CTableDataCell>{p.idLector ? `${p.idLector.nombres} ${p.idLector.apellidos}` : '(lector eliminado)'}</CTableDataCell>
                <CTableDataCell>{new Date(p.fechaPrestamo).toLocaleDateString()}</CTableDataCell>
                <CTableDataCell>{new Date(p.fechaDevolucionEsperada).toLocaleDateString()}</CTableDataCell>
                <CTableDataCell>
                  {p.estado === 'devuelto' ? (
                    <CBadge color="success">Devuelto</CBadge>
                  ) : esAtrasado(p) ? (
                    <CBadge color="danger">Atrasado</CBadge>
                  ) : (
                    <CBadge color="warning">Prestado</CBadge>
                  )}
                </CTableDataCell>
                <CTableDataCell>
                  {p.estado !== 'devuelto' && (
                    <CButton color="secondary" size="sm" variant="outline" onClick={() => handleDevolver(p._id)}>
                      Marcar devuelto
                    </CButton>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>
    </div>
  )
}