/**
 * Entry point del backend.
 * Express + MySQL + JWT.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
console.log("DB_HOST:", process.env.DB_HOST);

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const tipoVehiculoRoutes = require('./routes/tipoVehiculo.routes');
const tarifaRoutes = require('./routes/tarifa.routes');
const registroRoutes = require('./routes/registro.routes');
const cupoRoutes = require('./routes/cupo.routes');

const app = express();

app.use(cors({
  origin: ["https://parqueadero-led-u86n.vercel.app", "http://127.0.0.1:5500"]
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

// Healthcheck
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});
// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/vehiculos/tipos', tipoVehiculoRoutes);
app.use('/api/tarifas', tarifaRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/cupos', cupoRoutes);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🅿️  API corriendo en http://localhost:${PORT}`));

