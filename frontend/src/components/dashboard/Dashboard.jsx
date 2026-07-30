import { CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CAlert } from '@coreui/react'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts'
import {
  getLibrosMasPrestados,
  getPrestamosAtrasados,
  getPromedioDevolucion,
  getTopLectores,
  getPrestamosPorMes
} from '../../api/prestamoService'

const NOMBRES_MES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function Dashboard() {
  const [masPrestados, setMasPrestados] = useState([])
  const [atrasados, setAtrasados] = useState([])
  const [promedio, setPromedio] = useState({ promedioDias: 0, totalDevoluciones: 0 })
  const [topLectores, setTopLectores] = useState([])
  const [porMes, setPorMes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const [mp, at, prom, tl, pm] = await Promise.all([
          getLibrosMasPrestados(),
          getPrestamosAtrasados(),
          getPromedioDevolucion(),
          getTopLectores(),
          getPrestamosPorMes(),
        ])
        setMasPrestados(mp)
        setAtrasados(at)
        setPromedio(prom)
        setTopLectores(tl)
        setPorMes(pm.map((item) => ({ ...item, etiqueta: `${NOMBRES_MES[item.mes]} ${item.anio}` })))
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Error al cargar las estadísticas')
      }
    }
    cargarEstadisticas()
  }, [])

  return (
    <div>
      {error && <CAlert color="danger">{error}</CAlert>}

      {/* Tarjetas de resumen */}
      <CRow className="mb-4">
        <CCol md={4}>
          <div className="stat-card">
            <div className="stat-numero">{promedio.promedioDias}</div>
            <div className="stat-label">Días promedio de devolución ({promedio.totalDevoluciones} devoluciones)</div>
          </div>
        </CCol>
        <CCol md={4}>
          <div className="stat-card">
            <div className="stat-numero">{atrasados.length}</div>
            <div className="stat-label">Préstamos atrasados en este momento</div>
          </div>
        </CCol>
        <CCol md={4}>
          <div className="stat-card">
            <div className="stat-numero">{masPrestados[0]?.titulo || '-'}</div>
            <div className="stat-label">Libro más prestado ({masPrestados[0]?.totalPrestamos || 0} veces)</div>
          </div>
        </CCol>
      </CRow>

      {/* Gráfica: libros más prestados */}
      <div className="app-card mb-4">
        <h5 className="mb-3">Libros más prestados</h5>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={masPrestados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="titulo" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="totalPrestamos" fill="#2E4057" name="Veces prestado" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica: préstamos por mes */}
      <div className="app-card mb-4">
        <h5 className="mb-3">Préstamos por mes</h5>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={porMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="etiqueta" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalPrestamos" stroke="#E3B23C" name="Préstamos" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <CRow>
        {/* Top lectores */}
        <CCol md={6}>
          <div className="app-card mb-4">
            <h5 className="mb-3">Lectores más frecuentes</h5>
            <CTable striped responsive bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Lector</CTableHeaderCell>
                  <CTableHeaderCell>Total préstamos</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {topLectores.map((l, i) => (
                  <CTableRow key={i}>
                    <CTableDataCell>{l.nombreCompleto}</CTableDataCell>
                    <CTableDataCell>{l.totalPrestamos}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCol>

        {/* Atrasados */}
        <CCol md={6}>
          <div className="app-card mb-4">
            <h5 className="mb-3">Préstamos atrasados</h5>
            {atrasados.length === 0 ? (
              <p className="text-muted">No hay préstamos atrasados actualmente.</p>
            ) : (
              <CTable striped responsive bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Libro</CTableHeaderCell>
                    <CTableHeaderCell>Lector</CTableHeaderCell>
                    <CTableHeaderCell>Días de atraso</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {atrasados.map((a, i) => (
                    <CTableRow key={i}>
                      <CTableDataCell>{a.titulo}</CTableDataCell>
                      <CTableDataCell>{a.lector}</CTableDataCell>
                      <CTableDataCell>{a.diasAtraso}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </div>
        </CCol>
      </CRow>
    </div>
  )
}