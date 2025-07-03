const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    process.env.MONGO_URI
    mongoose.connect('mongodb+srv://invitado6010:Invitado2016.@ghostnix.1dic5zn.mongodb.net/?retryWrites=true&w=majority&appName=ghostnix')
    .then(() => console.log('✅ Conectado a MongoDB (versión moderna)'))
    .catch(err => console.error('❌ Error de conexión:', err));
  } catch (err) {
    console.error('Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
