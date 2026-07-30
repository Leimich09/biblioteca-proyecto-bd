import { useState } from 'react'
import { CNav, CNavItem, CNavLink, CButton } from '@coreui/react'
import LoginForm from './components/auth/LoginForm'
import LibroList from './components/libros/LibroList'
import LectorList from './components/lectores/LectorList'
import PrestamoList from './components/prestamos/PrestamoList'
import Dashboard from './components/dashboard/Dashboard'
import './App.css'

function App() {
  const tieneSesionValida = localStorage.getItem('token') && localStorage.getItem('nombre')
  const [nombre, setNombre] = useState(tieneSesionValida ? localStorage.getItem('nombre') : '')
  const [vista, setVista] = useState('libros')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nombre')
    setNombre('')
  }

  if (!nombre) {
    return <LoginForm onLogin={setNombre} />
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="app-header">
        <h4>Sistema de Biblioteca</h4>
        <div className="d-flex align-items-center gap-3">
          <span>Hola, {nombre}</span>
          <CButton color="light" size="sm" onClick={handleLogout}>Cerrar sesión</CButton>
        </div>
      </div>

      <CNav variant="tabs" className="mb-4">
        <CNavItem>
          <CNavLink active={vista === 'libros'} onClick={() => setVista('libros')} style={{ cursor: 'pointer' }}>
            Libros
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={vista === 'lectores'} onClick={() => setVista('lectores')} style={{ cursor: 'pointer' }}>
            Lectores
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={vista === 'prestamos'} onClick={() => setVista('prestamos')} style={{ cursor: 'pointer' }}>
            Préstamos
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={vista === 'dashboard'} onClick={() => setVista('dashboard')} style={{ cursor: 'pointer' }}>
            Dashboard
          </CNavLink>
        </CNavItem>
      </CNav>

      {vista === 'libros' && <LibroList />}
      {vista === 'lectores' && <LectorList />}
      {vista === 'prestamos' && <PrestamoList />}
      {vista === 'dashboard' && <Dashboard />}
    </div>
  )
}

export default App