import { CRow, CCol, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CAlert } from '@coreui/react'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

// Colores del tema de biblioteca, en hexadecimal literal (Recharts no lee variables CSS)
const WINE = '#6B2737'
const FOREST = '#2F4538'
const BRASS = '#B8863A'

// Degradado de borgoña oscuro hacia cuero tostado, sin pasar por rosado ni amarillo
const PALETA_BARRAS = ['#3D1620', '#6B2737', '#8F4A47', '#A66B54', '#BF9463']

// Iconos simples en línea, monocromos, acordes al resto del sistema
function IconoLibro({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M12 6c-1.6-1.2-3.6-1.8-6-1.8v13.6c2.4 0 4.4.6 6 1.8 1.6-1.2 3.6-1.8 6-1.8V4.2c-2.4 0-4.4.6-6 1.8Z" />
      <path d="M12 6v13.6" />
    </svg>
  )
}

function IconoReloj({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  )
}

function IconoAlerta({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill={color} />
    </svg>
  )
}

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
      {/* Encabezado del panel */}
      <div className="mb-4">
        <h4 className="mb-1">Panel de Estadísticas</h4>
        <p className="text-muted" style={{ fontFamily: "'Lora', serif" }}>
          Resumen del comportamiento de préstamos, generado a partir de consultas de agregación en MongoDB.
        </p>
      </div>

      {error && <CAlert color="danger">{error}</CAlert>}

      {/* Tarjetas de resumen, cada una con su icono y acento de color distinto */}
      <CRow className="mb-4 align-items-stretch">
        <CCol md={4} className="mb-3 mb-md-0">
          <div className="stat-card h-100" style={{ borderTop: `3px solid ${FOREST}` }}>
            <IconoReloj color={FOREST} />
            <div className="stat-numero mt-2">{promedio.promedioDias}</div>
            <div className="stat-label">Días promedio de devolución ({promedio.totalDevoluciones} devoluciones)</div>
          </div>
        </CCol>
        <CCol md={4} className="mb-3 mb-md-0">
          <div className="stat-card h-100" style={{ borderTop: `3px solid ${WINE}` }}>
            <IconoAlerta color={WINE} />
            <div className="stat-numero mt-2">{atrasados.length}</div>
            <div className="stat-label">Préstamos atrasados en este momento</div>
          </div>
        </CCol>
        <CCol md={4}>
          <div className="stat-card h-100" style={{ borderTop: `3px solid ${BRASS}` }}>
            <IconoLibro color={BRASS} />
            <div className="stat-numero mt-2" style={{ fontSize: '1.3rem' }}>{masPrestados[0]?.titulo || '-'}</div>
            <div className="stat-label">Libro más prestado ({masPrestados[0]?.totalPrestamos || 0} veces)</div>
          </div>
        </CCol>
      </CRow>

      {/* Gráfica: libros más prestados */}
      <div className="app-card mb-4">
        <h5 className="mb-3">Libros más prestados</h5>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={masPrestados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DCC3" />
            <XAxis dataKey="titulo" tick={{ fontSize: 11, fill: '#6B5D4D' }} interval={0} angle={-15} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} tick={{ fill: '#6B5D4D' }} />
            <Tooltip contentStyle={{ fontFamily: 'Lora, serif', borderRadius: 6 }} />
            <Bar dataKey="totalPrestamos" name="Veces prestado" radius={[3, 3, 0, 0]}>
              {masPrestados.map((entrada, i) => (
                <Cell key={i} fill={PALETA_BARRAS[i % PALETA_BARRAS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica: préstamos por mes */}
      <div className="app-card mb-4">
        <h5 className="mb-3">Préstamos por mes</h5>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={porMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DCC3" />
            <XAxis dataKey="etiqueta" tick={{ fontSize: 12, fill: '#6B5D4D' }} />
            <YAxis allowDecimals={false} tick={{ fill: '#6B5D4D' }} />
            <Tooltip contentStyle={{ fontFamily: 'Lora, serif', borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontFamily: 'Lora, serif' }} />
            <Line type="monotone" dataKey="totalPrestamos" stroke={BRASS} name="Préstamos" strokeWidth={2.5} dot={{ fill: BRASS, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <CRow>
        {/* Top lectores */}
        <CCol md={6}>
          <div className="app-card mb-4">
            <h5 className="mb-3">Lectores más frecuentes</h5>
            {topLectores.length === 0 ? (
              <p className="text-muted">Todavía no hay suficientes préstamos para mostrar este ranking.</p>
            ) : (
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
            )}
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