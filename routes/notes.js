const express = require('express');
const { StatusCodes } = require('http-status-codes');
const validator = require('validator');
const Note = require('../models/Note');

const router = express.Router();

// Middleware para validar datos de entrada
const validateNoteInput = (req, res, next) => {
  const { codigo, nombre, correo, nota, latitud, longitud } = req.body;
  
  if (!codigo || !nombre || !correo || !nota || latitud === undefined || longitud === undefined) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Todos los campos (codigo, nombre, correo, nota, latitud, longitud) son requeridos'
    });
  }

  if (!validator.isEmail(correo)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Por favor ingrese un correo electrónico válido'
    });
  }

  if (isNaN(latitud) || isNaN(longitud) || 
      latitud < -90 || latitud > 90 || 
      longitud < -180 || longitud > 180) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Coordenadas inválidas. La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180'
    });
  }

  next();
};

// Crear una nueva nota
router.post('/', validateNoteInput, async (req, res) => {
  try {
    const { codigo, nombre, correo, nota, latitud, longitud } = req.body;
    
    const newNote = await Note.create({
      codigo,
      nombre,
      correo,
      nota,
      ubicacion: {
        type: 'Point',
        coordinates: [parseFloat(longitud), parseFloat(latitud)]
      },
      ipCliente: req.ip
    });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        note: newNote
      }
    });
  } catch (err) {
    console.error('Error al crear nota:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Error al guardar la nota en la base de datos'
    });
  }
});

// Obtener todas las notas (con paginación para seguridad)
router.get('/', async (req, res) => {
  try {
    // Paginación para evitar devolver demasiados datos
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find()
      .skip(skip)
      .limit(limit)
      .sort({ fechaCreacion: -1 })
      .select('-ipCliente'); // Excluir la IP del cliente

    const total = await Note.countDocuments();

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: notes.length,
      data: {
        notes
      },
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error al obtener notas:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Error al obtener las notas de la base de datos'+err
    });
  }
});
// Buscar notas cerca de una ubicación
router.get('/cerca-de', async (req, res) => {
  try {
    const { lat, lng, distancia = 1000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Debe proporcionar latitud (lat) y longitud (lng)'
      });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const distNum = parseFloat(distancia);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(distNum) ||
        latNum < -90 || latNum > 90 || 
        lngNum < -180 || lngNum > 180) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Coordenadas inválidas'
      });
    }

    const notes = await Note.find({
      ubicacion: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lngNum, latNum]
          },
          $maxDistance: distNum
        }
      }
    }).select('-ipCliente');

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: notes.length,
      data: {
        notes
      }
    });
  } catch (err) {
    console.error('Error al buscar notas por ubicación:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Error al buscar notas por ubicación'
    });
  }
});
// curl -X POST http://localhost:3000/api/notes \
//   -H "Content-Type: application/json" \
//   -d '{
//     "codigo": "NOTA002",
//     "nombre": "María García",
//     "correo": "maria@example.com",
//     "nota": "Esta es una nota con ubicación",
//     "latitud": 19.4326,
//     "longitud": -99.1332
//   }'


// Buscar notas cerca de una ubicación (1000 metros por defecto):
// curl "http://localhost:3000/api/notes/cerca-de?lat=19.4326&lng=-99.1332"

// Buscar notas en un radio específico (5000 metros):
// curl "http://localhost:3000/api/notes/cerca-de?lat=19.4326&lng=-99.1332&distancia=5000"

module.exports = router;