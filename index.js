require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { StatusCodes } = require('http-status-codes');

const noteRoutes = require('./routes/notes');
const securityMiddleware = require('./middlewares/security');

const app = express();

// Conexión a MongoDB
require('./config/db');

// Middlewares de seguridad
app.use(securityMiddleware);

// Middlewares generales
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors());

// Rutas
app.use('/api/notes', noteRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Algo salió mal en el servidor'+err
  });
});

// Ruta no encontrada
app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: `No se puede encontrar ${req.originalUrl} en este servidor`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});