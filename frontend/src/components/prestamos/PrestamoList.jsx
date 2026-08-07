import { CForm, CFormInput, CButton, CAlert, CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge, CButtonGroup } from '@coreui/react'
import { useEffect, useMemo, useState } from 'react'
import { obtenerLibros } from '../../api/libroService'
import { obtenerLectores } from '../../api/lectorService'
import { obtenerPrestamos, crearPrestamo, devolverPrestamo } from '../../api/prestamoService'

export default function PrestamoList() {
  const [libros, setLibros] = useState([])
  const [lectores, setLectores] = useState([])
  const [prestamos, setPrestamos] = useState([])

  const [textoLibro, setTextoLibro] = useState('')
  const [textoLector, setTextoLector] = useState('')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const [busquedaHistorial, setBusquedaHistorial] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

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

  const libroSeleccionado = libros.find(
    (l) => `${l.titulo} (${l.ejemplaresDisponibles} disponibles)` === textoLibro
  )
  const lectorSeleccionado = lectores.find(
    (l) => `${l.nombres} ${l.apellidos}` === textoLector
  )

  const onSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    if (!libroSeleccionado || !lectorSeleccionado) {
      setError('Debe seleccionar un libro y un lector válidos de la lista (use el buscador)')
      return
    }

    try {
      await crearPrestamo(libroSeleccionado._id, lectorSeleccionado._id)
      setMensaje('Préstamo registrado con éxito')
      setTextoLibro('')
      setTextoLector('')
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

  const prestamosFiltrados = useMemo(() => {
    return prestamos.filter((p) => {
      const tituloLibro = p.idLibro?.titulo || ''
      const nombreLector = p.idLector ? `${p.idLector.nombres} ${p.idLector.apellidos}` : ''
      const coincideTexto =
        busquedaHistorial.trim() === '' ||
        tituloLibro.toLowerCase().includes(busquedaHistorial.toLowerCase()) ||
        nombreLector.toLowerCase().includes(busquedaHistorial.toLowerCase())

      let coincideEstado = true
      if (filtroEstado === 'prestado') coincideEstado = p.estado === 'prestado' && !esAtrasado(p)
      if (filtroEstado === 'atrasado') coincideEstado = esAtrasado(p)
      if (filtroEstado === 'devuelto') coincideEstado = p.estado === 'devuelto'

      return coincideTexto && coincideEstado
    })
  }, [prestamos, busquedaHistorial, filtroEstado])

  return (
    <div>
      <div className="app-card mb-4">
        <h5 className="mb-3">Registrar préstamo</h5>
        {mensaje && <CAlert color="success">{mensaje}</CAlert>}
        {error && <CAlert color="danger">{error}</CAlert>}
        <CForm onSubmit={onSubmit}>
          <CRow>
            <CCol md={5}>
              <CFormInput
                label="Libro (escriba para buscar)"
                list="lista-libros"
                placeholder="Escriba el título..."
                value={textoLibro}
                onChange={(e) => setTextoLibro(e.target.value)}
                className="mb-3"
              />
              <datalist id="lista-libros">
                {libros.map((l) => (
                  <option key={l._id} value={`${l.titulo} (${l.ejemplaresDisponibles} disponibles)`} />
                ))}
              </datalist>
            </CCol>
            <CCol md={5}>
              <CFormInput
                label="Lector (escriba para buscar)"
                list="lista-lectores"
                placeholder="Escriba el nombre..."
                value={textoLector}
                onChange={(e) => setTextoLector(e.target.value)}
                className="mb-3"
              />
              <datalist id="lista-lectores">
                {lectores.map((l) => (
                  <option key={l._id} value={`${l.nombres} ${l.apellidos}`} />
                ))}
              </datalist>
            </CCol>
            <CCol md={2} className="d-flex align-items-end mb-3">
              <CButton color="primary" type="submit" className="w-100">Prestar</CButton>
            </CCol>
          </CRow>
        </CForm>
      </div>

      <div className="app-card">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 className="mb-0">Historial de préstamos ({prestamosFiltrados.length} de {prestamos.length})</h5>
          <CButtonGroup size="sm">
            <CButton color={filtroEstado === 'todos' ? 'primary' : 'outline-secondary'} onClick={() => setFiltroEstado('todos')}>Todos</CButton>
            <CButton color={filtroEstado === 'prestado' ? 'primary' : 'outline-secondary'} onClick={() => setFiltroEstado('prestado')}>Prestados</CButton>
            <CButton color={filtroEstado === 'atrasado' ? 'primary' : 'outline-secondary'} onClick={() => setFiltroEstado('atrasado')}>Atrasados</CButton>
            <CButton color={filtroEstado === 'devuelto' ? 'primary' : 'outline-secondary'} onClick={() => setFiltroEstado('devuelto')}>Devueltos</CButton>
          </CButtonGroup>
        </div>

        <CFormInput
          placeholder="Buscar por libro o lector..."
          value={busquedaHistorial}
          onChange={(e) => setBusquedaHistorial(e.target.value)}
          className="mb-3"
        />

        {/* Contenedor con scroll interno para que el historial no crezca indefinidamente */}
        <div className="scroll-interno">
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
              {prestamosFiltrados.map((p) => (
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
    </div>
  )
}