const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require("http");
const socketIo = require("socket.io");

const { router: authRoutes, verifyToken, verifyRole } = require('./routes/auth');
const User = require('./models/user'); // Asegúrate de importar el modelo de usuario

const app = express();
const PORT = process.env.PORT || 4001;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Reemplázalo con la URL de tu frontend
    methods: ["GET", "POST"]
  }
});

// Importar rutas
const registro = require('./routes/registro');
const login = require('./routes/login');
const multas = require('./routes/multas')(io);
const users = require('./routes/users');
const notificaciones = require('./routes/notifi');

console.log("Mongo URI:", process.env.MONGODB_URI);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log(`✅ Conectado a MongoDB en la base de datos condominios`))
  .catch((error) => console.error('❌ Error conectando a MongoDB:', error));

app.use(cors());
app.use(express.json());

// Rutas públicas
app.use("/auth", authRoutes);
app.use('/registro', registro);
app.use('/login', login);

// Rutas protegidas con token
app.use('/multas', verifyToken, multas);
app.use('/users', verifyToken, users);
app.use('/notificaciones', verifyToken, notificaciones);

// Ejemplo de ruta solo para administradores
app.get("/admin-data", verifyToken, verifyRole(["administrador"]), async (req, res) => {
  res.json({ mensaje: "Acceso autorizado para administradores" });
});

// Ejemplo de ruta solo para inquilinos
app.get("/inquilino-data", verifyToken, verifyRole(["inquilino"]), async (req, res) => {
  res.json({ mensaje: "Acceso autorizado para inquilinos" });
});

// WebSockets
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

// Exportar `io` para poder emitir eventos desde otras rutas
module.exports = { app, server, io };

// Iniciar servidor
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
