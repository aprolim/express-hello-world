// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Configuración inicial
const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(bodyParser.json());

// Conexión a MongoDB (reemplaza la URL con tu conexión real)
mongoose.connect('mongodb+srv://invitado6010:Invitado2016.@ghostnix.1dic5zn.mongodb.net/?retryWrites=true&w=majority&appName=ghostnix', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

// Modelo de datos
const NotaSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true
  },
  nota: {
    type: String,
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

const Nota = mongoose.model('Nota', NotaSchema);

// Ruta POST
app.post('/api/notas', async (req, res) => {
  try {
    const { codigo, nota } = req.body;
    
    if (!codigo || !nota) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (codigo o nota)' });
    }

    const nuevaNota = new Nota({ codigo, nota });
    await nuevaNota.save();

    res.status(201).json({
      mensaje: 'Nota creada exitosamente',
      data: nuevaNota
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Ruta GET para verificar que todo funciona
app.get('/api/notas', async (req, res) => {
  try {
    const notas = await Nota.find();
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las notas' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
