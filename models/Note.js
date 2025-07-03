const mongoose = require('mongoose');
const validator = require('validator');

const noteSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código es requerido'],
    trim: true,
    maxlength: [50, 'El código no puede exceder los 50 caracteres']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  correo: {
    type: String,
    required: [true, 'El correo electrónico es requerido'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor ingrese un correo electrónico válido']
  },
  nota: {
    type: String,
    required: [true, 'La nota es requerida'],
    trim: true,
    maxlength: [1000, 'La nota no puede exceder los 1000 caracteres']
  },
  ubicacion: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: [true, 'Las coordenadas son requeridas'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -90 && coords[0] <= 90 && 
                 coords[1] >= -180 && coords[1] <= 180;
        },
        message: 'Coordenadas inválidas. La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180'
      }
    }
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  ipCliente: {
    type: String,
    select: false
  }
});

// Índice geospacial para búsquedas por ubicación
noteSchema.index({ ubicacion: '2dsphere' });
noteSchema.index({ codigo: 1 });
noteSchema.index({ correo: 1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;