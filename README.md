# 🅿️ Sistema de Gestión de Parqueadero

Aplicación web completa para gestionar entradas/salidas de vehículos (autos y motos),
con control de cupos en tiempo real, tarifas configurables, tickets y roles.

## 📋 Stack

- **Backend:** Node.js + Express + MySQL (mysql2) + JWT + bcrypt
- **Frontend:** HTML5, CSS3, JavaScript vanilla (SPA ligera)
- **DB:** MySQL 8+

## 📁 Estructura

```
parqueadero/
├── backend/           → API REST (Express)
│   ├── src/
│   │   ├── config/        → DB, JWT
│   │   ├── controllers/   → Lógica de negocio
│   │   ├── middlewares/   → Auth, roles
│   │   ├── routes/        → Endpoints
│   │   ├── utils/         → Cálculos, helpers
│   │   └── server.js      → Entry point
│   ├── package.json
│   └── .env.example
├── frontend/          → Cliente (HTML/CSS/JS)
│   ├── index.html         → Login
│   ├── pages/             → Dashboard, entradas, salidas, tarifas...
│   ├── css/
│   └── js/
├── database/
│   └── schema.sql         → Script de creación + seeds
└── README.md
```

## 🚀 Instalación local

### 1. Requisitos
- Node.js 18+
- MySQL 8+
- npm

### 2. Base de datos

```bash
mysql -u root -p < database/schema.sql
```

Esto crea la BD `parqueadero_db`, tablas, tarifas por defecto y un usuario admin:
- **Email:** `admin@parqueadero.com`
- **Password:** `admin123`

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales MySQL
npm install
npm run dev       # nodemon en http://localhost:3000
```

### 4. Frontend

Sirve la carpeta `frontend/` con cualquier servidor estático:

```bash
cd frontend
npx serve .       # http://localhost:3000
```

O simplemente abre `frontend/index.html` en el navegador (ajustando `API_URL` en `js/api.js`).

## 🔐 Roles

- **Administrador:** gestión completa (usuarios, tarifas, reportes)
- **Operario:** registro de entradas/salidas, ver cupos, generar tickets

## ☁️ Despliegue

- **Backend:** Railway, Render o VPS (Vercel Serverless NO recomendado para Express persistente + MySQL).
- **DB:** PlanetScale, Railway MySQL o AWS RDS.
- **Frontend:** Vercel, Netlify o Cloudflare Pages (estático).
- Configura `VITE_API_URL` / `API_URL` apuntando al backend público.

## 📡 Endpoints principales

| Método | Ruta                       | Rol      | Descripción                      |
|--------|----------------------------|----------|----------------------------------|
| POST   | /api/auth/login            | público  | Login (email + password)         |
| POST   | /api/auth/register         | admin    | Crear usuario                    |
| GET    | /api/vehiculos/tipos       | auth     | Listar tipos de vehículo         |
| POST   | /api/registros/entrada     | auth     | Registrar entrada                |
| POST   | /api/registros/salida/:id  | auth     | Registrar salida + ticket        |
| GET    | /api/registros/activos     | auth     | Vehículos dentro                 |
| GET    | /api/cupos                 | auth     | Cupos disponibles en tiempo real |
| GET    | /api/tarifas               | auth     | Listar tarifas                   |
| PUT    | /api/tarifas/:id           | admin    | Actualizar tarifa                |

## 🧪 Flujo básico de uso

1. Inicia sesión con `admin@parqueadero.com / admin123`.
2. Ve a **Tarifas** y ajusta valores por minuto/hora.
3. En **Entrada**, registra un vehículo (placa + tipo).
4. En **Salida**, busca por placa → el sistema calcula tiempo y valor → genera ticket.
5. En el **Dashboard** ves cupos en vivo.

## 🛡️ Seguridad

- Contraseñas con **bcrypt** (10 rounds).
- Sesiones con **JWT** (expira 8h).
- Middleware de **roles** por endpoint.
- Validación de placas y tipos.

---

Hecho con ❤️ — Sistema MVP. Amplía con descuentos, exportar PDF, WhatsApp, etc.
<<<<<<< HEAD
BETA
=======
>>>>>>> e8505378f252f31a095237be5658cef3edca1f04
