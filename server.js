import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import exceljs from 'exceljs';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://invitado6010:Invitado2016.@ghostnix.1dic5zn.mongodb.net/examenes2?retryWrites=true&w=majority&appName=ghostnix';

// Middleware
const allowedOrigin = 'https://evaluacion-notarios.github.io/'
app.use(cors({
  origin: allowedOrigin
}));
app.use(express.json());
app.use(express.static('public'));

// Modelo de Examen
const examenSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  nota: { type: Number, required: true },
  ci: { type: String, required: true, index: true },
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  codigo: { type: String, required: true },
  latitud: { type: Number, required: true },
  longitud: { type: Number, required: true },
  tiempoRespuesta: { type: Number }, // en segundos
  createdAt: { type: Date, default: () => {
    const currentTime = Date.now();
    const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
    return new Date(currentTime - fourHoursInMilliseconds);
  } },
  dispositivo: { type: String, required: true },
  circunscripcion: { type: String, required: true },
  intento: { type: Number, required: true }
});

const Examen = mongoose.model('Examen', examenSchema);

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};

// Rutas API
app.post('/api/examenes', async (req, res) => {
  try {
    const { nota, ci, nombre, correo, codigo, latitud, longitud, tiempoRespuesta, dispositivo, circunscripcion, intento} = req.body;
    
    const nuevoExamen = new Examen({
      nota,
      ci,
      nombre,
      correo,
      codigo,
      latitud,
      longitud,
      tiempoRespuesta,
      dispositivo,
      circunscripcion,
      intento
    });

    const examenGuardado = await nuevoExamen.save();
    
    // Emitir evento a todos los clientes conectados
    io.emit('nuevo_examen', examenGuardado);
    
    res.status(201).json(examenGuardado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/examenes', async (req, res) => {
  try {
    const examenes = await Examen.find().sort({ nota: -1, createdAt: -1 }).limit(50);
    res.json(examenes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/examenes/export', async (req, res) => {
  try {
    const examenes = await Examen.find().sort({ createdAt: -1 });
    
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Exámenes');
    
    // Encabezados
    worksheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'CI', key: 'ci', width: 15 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Nota', key: 'nota', width: 10 },
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Tiempo (s)', key: 'tiempoRespuesta', width: 15 },
      { header: 'Fecha', key: 'createdAt', width: 20 },
      { header: 'Dispositivo', key: 'dispositivo', width: 20 },
      { header: 'Circunscripcion', key: 'circunscripcion', width: 20 },
      { header: 'Intento', key: 'intento', width: 20 },
      { header: 'Latitud', key: 'latitud', width: 20 },
      { header: 'Longitud', key: 'longitud', width: 20 },
    ];
    
    // Datos
    examenes.forEach(examen => {
      worksheet.addRow({
        nombre: examen.nombre,
        ci: examen.ci,
        correo: examen.correo,
        nota: examen.nota,
        codigo: examen.codigo,
        tiempoRespuesta: examen.tiempoRespuesta,
        createdAt: examen.createdAt.toLocaleString(),
        dispositivo: examen.dispositivo,
        circunscripcion: examen.circunscripcion,
        intento: examen.intento,
        latitud: examen.latitud,
        longitud: examen.longitud
      });
    });
    
    // Configurar respuesta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=examenes.xlsx'
    );
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/examenes/grupos', async (req, res) => {
  try {
    // Encontrar grupos de personas que hicieron el examen en la misma ubicación y tiempo similar
    const examenes = await Examen.find().sort({ createdAt: 1 });
    
    const grupos = [];
    const umbralDistancia = 0.001; // ~100 metros
    const umbralDistancia2 = 0.000001; // ~10 centimetros
    const umbralTiempo =  480 * 60 * 1000; // 480 minutos
    
    for (let i = 0; i < examenes.length; i++) {
      const grupo = [examenes[i]];
      
      for (let j = i + 1; j < examenes.length; j++) {
        const distancia = Math.sqrt(
          Math.pow(examenes[i].latitud - examenes[j].latitud, 2) +
          Math.pow(examenes[i].longitud - examenes[j].longitud, 2)
        );
        
        const diferenciaTiempo = Math.abs(examenes[i].createdAt - examenes[j].createdAt);
        
        if (distancia < umbralDistancia && distancia > umbralDistancia2 && diferenciaTiempo < umbralTiempo && examenes[j].nombre != examenes[i].nombre ) {
          grupo.push(examenes[j]);
        } else {
          break;
        }
      }
      
      if (grupo.length > 1) {
        grupos.push(grupo);
        i += grupo.length - 1;
      }
    }
    
    res.json(grupos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para el dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile('dashboard.html', { root: './public' });
});

// Iniciar servidor
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();


