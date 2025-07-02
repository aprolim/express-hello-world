const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();

// Seguridad: Configuración de Helmet para headers seguros
app.use(helmet());

// Seguridad: Habilitar CORS con configuración restrictiva
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));

// Seguridad: Rate limiting para prevenir abuso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 solicitudes por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api', limiter);

// Middleware para parsear JSON
app.use(express.json());

// Esquema de MongoDB
const userSchema = new mongoose.Schema({
  ci: { type: String, required: true, unique: true },
  fechaNacimiento: { type: String, required: true }, // Formato DD/MM/YYYY
  nombre: { type: String, required: true },
  correo: { type: String, required: true, match: /.+\@.+\..+/ }
});

const User = mongoose.model('User', userSchema);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch(err => {
  console.error('Error de conexión a MongoDB:', err);
});

// Validaciones para la entrada
const validateInput = [
  body('ci').trim().notEmpty().withMessage('CI es requerido').matches(/^\d+$/).withMessage('CI debe contener solo números'),
  body('fechaNacimiento').isISO8601().toDate().withMessage('Fecha de nacimiento debe ser una fecha válida en formato ISO')
];

// Ruta de la API
app.get('/api/consultar', validateInput, async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { ci, fechaNacimiento } = req.query;

    // Convertir fecha ISO a DD/MM/YYYY
    const date = new Date(fechaNacimiento);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
    }
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

    // Buscar en la base de datos
    const user = await User.findOne({ ci, fechaNacimiento: formattedDate });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Respuesta con datos solicitados
    res.json({
      ci: user.ci,
      fechaNacimiento: user.fechaNacimiento,
      nombre: user.nombre,
      correo: user.correo
    });
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
