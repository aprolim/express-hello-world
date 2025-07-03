const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// URL de conexión a MongoDB (modifica con tus datos)
const MONGO_URI = 'mongodb+srv://invitado6010:Invitado6010.@ghostnix.1dic5zn.mongodb.net/?retryWrites=true&w=majority&appName=ghostnix';

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
