# Sistema de Biblioteca — Bases de Datos 2

Sistema de gestión de biblioteca (libros, lectores y préstamos) con backend en Node.js/Express/MongoDB y frontend en React. Incluye autenticación con JWT y un dashboard con consultas de agregación de MongoDB (libros más prestados, préstamos atrasados, promedio de días de devolución, lectores más frecuentes, préstamos por mes).

## Tecnologías utilizadas

**Backend:** Node.js, Express, Mongoose (MongoDB), JWT (jsonwebtoken + bcryptjs)
**Frontend:** React (Create React App), CoreUI, React Hook Form + Yup, Axios, Recharts
**Base de datos:** MongoDB (local o Atlas)

## Estructura del proyecto

```
biblioteca-proyecto/
├── backend/
│   ├── config/          # Conexión a MongoDB
│   ├── controllers/     # Lógica de negocio (auth, libros, lectores, préstamos)
│   ├── middleware/       # Verificación de token JWT
│   ├── models/          # Esquemas de Mongoose (Libro, Lector, Prestamo, Usuario)
│   ├── routes/           # Definición de endpoints
│   ├── scripts/          # Scripts de siembra de datos (se corren una sola vez)
│   ├── .env               # Variables de entorno (no se sube a git)
│   └── server.js
└── frontend/
    └── src/
        ├── api/                       # Servicios que hablan con el backend (Axios)
        ├── components/
        │   ├── auth/                 # Login
        │   ├── libros/               # Catálogo de libros
        │   ├── lectores/             # Gestión de lectores
        │   ├── prestamos/            # Registro de préstamos
        │   └── dashboard/            # Estadísticas con gráficas
        ├── App.js
        └── App.css
```

## Requisitos previos

- **Node.js** v18 o superior
- **MongoDB** corriendo localmente (o una cadena de conexión de MongoDB Atlas)
- **npm** (viene con Node.js)

## Instalación — Backend

1. Entra a la carpeta del backend:
   ```
   cd backend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` en la raíz de `backend` con este contenido (ajusta según tu entorno):
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/bibliotecadb
   JWT_SECRET=una-clave-secreta-cualquiera
   ```

4. Siembra los datos iniciales (**en este orden, solo la primera vez**):
   ```
   node scripts/seedLibros.js
   node scripts/seedHistorico.js
   ```
   - `seedLibros.js` trae 15 libros reales desde la API pública de Open Library (título, autor, portada, editorial, año).
   - `seedHistorico.js` crea 12 lectores ficticios y ~45 préstamos con fechas repartidas en los últimos 6 meses, para que el dashboard tenga datos variados y realistas.

   **Nota:** `seedHistorico.js` borra los lectores y préstamos existentes antes de volver a sembrar (no toca los libros). No lo vuelvas a correr si ya tienes datos reales que quieras conservar.

5. Levanta el servidor:
   ```
   npm run dev
   ```
   Deberías ver: `Servidor corriendo en el puerto 5000` y `MongoDB conectado`.

## Instalación — Frontend

1. Entra a la carpeta del frontend:
   ```
   cd frontend
   ```

2. Instala las dependencias (usa estas versiones específicas para evitar conflictos):
   ```
   npm install @coreui/react @coreui/coreui bootstrap @hookform/resolvers@3.9.0 react-hook-form yup@1.4.0 axios recharts
   ```
   Si da un error de `ERESOLVE`, agrega `--legacy-peer-deps` al final del comando.

3. (Opcional) Crea un `.env` en la raíz de `frontend` si tu backend corre en otra URL/puerto:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   Si no lo creas, usa `http://localhost:5000/api` por defecto.

4. Levanta el frontend:
   ```
   npm start
   ```
   Se abre automáticamente en `http://localhost:3000`.

## Cómo iniciar sesión por primera vez

El sistema no trae un usuario de acceso por defecto — hay que crear uno manualmente con Postman, Thunder Client, o cualquier cliente HTTP:

**1. Registrar usuario** — `POST http://localhost:5000/api/auth/registrar`
```json
{
  "nombre": "Tu Nombre",
  "correo": "tucorreo@ejemplo.com",
  "password": "tu-contraseña"
}
```

**2. Iniciar sesión** desde la pantalla de login del frontend con ese mismo correo y contraseña.

## Endpoints principales de la API

Todas las rutas (excepto `/api/auth/*`) requieren header `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/registrar` | Crear usuario del sistema |
| POST | `/api/auth/login` | Iniciar sesión, devuelve token |
| GET | `/api/libros` | Listar libros |
| POST | `/api/libros` | Crear libro |
| PUT | `/api/libros` | Actualizar libro |
| DELETE | `/api/libros?id=...` | Eliminar libro |
| GET | `/api/lectores` | Listar lectores |
| POST | `/api/lectores` | Crear lector |
| GET | `/api/prestamos` | Listar préstamos (con libro/lector poblados) |
| POST | `/api/prestamos` | Registrar préstamo |
| PUT | `/api/prestamos/devolver` | Marcar préstamo como devuelto |
| GET | `/api/prestamos/estadisticas/masPrestados` | Top 5 libros más prestados |
| GET | `/api/prestamos/estadisticas/atrasados` | Préstamos atrasados actualmente |
| GET | `/api/prestamos/estadisticas/promedioDevolucion` | Promedio de días de devolución |
| GET | `/api/prestamos/estadisticas/topLectores` | Top 5 lectores más frecuentes |
| GET | `/api/prestamos/estadisticas/porMes` | Préstamos agrupados por mes |

## Notas para quienes van a mejorar el diseño del frontend

- La paleta de colores y estilos base están en `frontend/src/App.css` (clases `.app-header`, `.app-card`, `.stat-card`).
- **Pendiente:** agregar scroll interno en contenedores largos (catálogo de libros, historial de préstamos) para que no crezcan indefinidamente la página.
- Los componentes ya son funcionales (CRUD, buscadores, filtros, gráficas) — el trabajo de diseño es puramente visual (CSS), no debería requerir tocar la lógica.

## Problemas comunes

- **Error 401 / "Token inválido o expirado":** el token dura 2 horas. Cierra sesión y vuelve a iniciar sesión. El sistema tiene auto-logout automático si esto ocurre mientras navegas.
- **`seedLibros.js` no encuentra resultados:** requiere conexión a internet (consulta la API pública de Open Library). Si falla por límite de peticiones, espera unos minutos y vuelve a intentar.
- **Error de `npm install` en el frontend (`ERESOLVE`):** usa las versiones específicas indicadas arriba, o agrega `--legacy-peer-deps`.