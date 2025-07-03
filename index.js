const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// URL de conexión a MongoDB (modifica con tus datos)
const MONGO_URI = 'mongodb://localhost:27017/nombre_de_tu_base_de_datos';

// Conexión a MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ **Conexión exitosa a MongoDB**'))
  .catch(err => console.error('❌ **Error de conexión a MongoDB**:', err.message));

// Ruta para probar la conexión
app.get('/test-db', (req, res) => {
  if (mongoose.connection.readyState === 1) { // 1 = conectado
    res.json({ success: true, message: '✅ MongoDB está conectado correctamente' });
  } else {
    res.status(500).json({ success: false, message: '❌ MongoDB NO está conectado' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
