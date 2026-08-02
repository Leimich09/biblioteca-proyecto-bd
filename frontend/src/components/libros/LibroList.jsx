import { CForm, CFormInput, CButton, CAlert, CRow, CCol, CListGroup, CListGroupItem, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'
import { obtenerLibros, crearLibro, eliminarLibro } from '../../api/libroService'

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

  // Búsqueda en Open Library
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [imagenSeleccionada, setImagenSeleccionada] = useState('')

  // Confirmación de eliminación
  const [confirmando, setConfirmando] = useState({ visible: false, idLibro: null, titulo: '' })

  // Buscador del catálogo
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  // Busca en Open Library y muestra hasta 5 resultados para elegir
  const buscarEnOpenLibrary = async () => {
    if (!terminoBusqueda.trim()) return
    setBuscando(true)
    setResultadosBusqueda([])
    try {
      const campos = 'title,author_name,first_publish_year,publisher,subject,cover_i'
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(terminoBusqueda)}&limit=5&fields=${campos}`
      const respuesta = await fetch(url)
      const data = await respuesta.json()
      setResultadosBusqueda(data.docs || [])
    } catch {
      setError('No se pudo conectar con Open Library. Puedes llenar el formulario manualmente.')
    } finally {
      setBuscando(false)
    }
  }

  // Al elegir un resultado, autocompleta el formulario
  const seleccionarResultado = (libro) => {
    setValue('titulo', libro.title || '')
    setValue('autor', (libro.author_name && libro.author_name.join(', ')) || '')
    setValue('categoria', (libro.subject && libro.subject[0]) || 'General')
    setValue('editorial', (libro.publisher && libro.publisher[0]) || '')
    setValue('anioPublicacion', libro.first_publish_year || '')
    setImagenSeleccionada(libro.cover_i ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg` : '')
    setResultadosBusqueda([])
    setTerminoBusqueda('')
  }

  const onSubmit = async (data) => {
    setMensaje('')
    setError('')
    try {
      await crearLibro({
        ...data,
        ejemplaresDisponibles: data.ejemplaresTotales,
        imagenUrl: imagenSeleccionada
      })
      setMensaje('Libro agregado con éxito')
      reset()
      setImagenSeleccionada('')
      cargarLibros()
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al agregar el libro')
    }
  }

  const pedirConfirmacionEliminar = (libro) => {
    setConfirmando({ visible: true, idLibro: libro._id, titulo: libro.titulo })
  }

  // Filtra el catálogo por título, autor o categoría
  const librosFiltrados = useMemo(() => {
    if (!busquedaCatalogo.trim()) return libros
    const termino = busquedaCatalogo.toLowerCase()
    return libros.filter(
      (l) =>
        l.titulo?.toLowerCase().includes(termino) ||
        l.autor?.toLowerCase().includes(termino) ||
        l.categoria?.toLowerCase().includes(termino)
    )
  }, [libros, busquedaCatalogo])

  const confirmarEliminacion = async () => {
    setMensaje('')
    setError('')
    try {
      await eliminarLibro(confirmando.idLibro)
      setMensaje('Libro eliminado correctamente')
      cargarLibros()
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al eliminar el libro')
    } finally {
      setConfirmando({ visible: false, idLibro: null, titulo: '' })
    }
  }

  return (
    <div>
      <div className="app-card mb-4">
        <h5 className="mb-3">Agregar libro</h5>
        {mensaje && <CAlert color="success">{mensaje}</CAlert>}
        {error && <CAlert color="danger">{error}</CAlert>}

        {/* Buscador en Open Library */}
        <CRow className="mb-3">
          <CCol md={9}>
            <CFormInput
              placeholder="Buscar libro en Open Library (ej: Cien años de soledad)"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscarEnOpenLibrary())}
            />
          </CCol>
          <CCol md={3}>
            <CButton color="secondary" className="w-100" onClick={buscarEnOpenLibrary} disabled={buscando}>
              {buscando ? 'Buscando...' : 'Buscar'}
            </CButton>
          </CCol>
        </CRow>

        {resultadosBusqueda.length > 0 && (
          <CListGroup className="mb-3">
            {resultadosBusqueda.map((r, i) => (
              <CListGroupItem key={i} component="button" type="button" onClick={() => seleccionarResultado(r)}>
                <strong>{r.title}</strong> — {(r.author_name && r.author_name.join(', ')) || 'Autor desconocido'} {r.first_publish_year ? `(${r.first_publish_year})` : ''}
              </CListGroupItem>
            ))}
          </CListGroup>
        )}

        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          Busca y selecciona un resultado para autocompletar el formulario, o llénalo manualmente.
        </p>

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
          <CRow>
            <CCol md={8}>
              <CFormInput
                label="URL de portada (opcional, si no usaste el buscador)"
                placeholder="https://..."
                className="mb-3"
                value={imagenSeleccionada}
                onChange={(e) => setImagenSeleccionada(e.target.value)}
              />
            </CCol>
          </CRow>
          {imagenSeleccionada && (
            <div className="mb-3">
              <img src={imagenSeleccionada} alt="portada seleccionada" style={{ height: 90 }} />
            </div>
          )}
          <CButton color="primary" type="submit">Guardar Libro</CButton>
        </CForm>
      </div>

      <CRow className="mb-3 align-items-center">
        <CCol md={6}>
          <h5 className="mb-0">Catálogo ({librosFiltrados.length} de {libros.length} libros)</h5>
        </CCol>
        <CCol md={6}>
          <CFormInput
            placeholder="Buscar por título, autor o categoría..."
            value={busquedaCatalogo}
            onChange={(e) => setBusquedaCatalogo(e.target.value)}
          />
        </CCol>
      </CRow>
      <CRow>
        {librosFiltrados.map((libro) => (
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
              <p className="mb-2" style={{ fontSize: '0.8rem' }}>
                Disponibles: <strong>{libro.ejemplaresDisponibles}</strong> / {libro.ejemplaresTotales}
              </p>
              <CButton color="danger" size="sm" variant="outline" onClick={() => pedirConfirmacionEliminar(libro)}>
                Eliminar
              </CButton>
            </div>
          </CCol>
        ))}
      </CRow>
      {librosFiltrados.length === 0 && (
        <p className="text-muted">No se encontraron libros que coincidan con "{busquedaCatalogo}".</p>
      )}

      <CModal visible={confirmando.visible} onClose={() => setConfirmando({ visible: false, idLibro: null, titulo: '' })}>
        <CModalHeader>Confirmar eliminación</CModalHeader>
        <CModalBody>
          ¿Está segura/o de eliminar <strong>{confirmando.titulo}</strong> del catálogo? Esta acción no se puede deshacer.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setConfirmando({ visible: false, idLibro: null, titulo: '' })}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmarEliminacion}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}