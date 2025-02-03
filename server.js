const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 4001;
const http = require("http"); // Agregar esta línea
const socketIo = require("socket.io");


const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Reemplázalo con la URL de tu frontend
    methods: ["GET", "POST"]
  }
});

const auth = require('./routes/auth');
const registro = require('./routes/registro');
const login = require('./routes/login');
const multas = require('./routes/multas')(io);
const users = require('./routes/users');





const notificaciones = require('./routes/notifi');

console.log("Mongo URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log(`✅ Conectado a MongoDB en la base de datos condominios`))
  .catch((error) => console.error('❌ Error conectando a MongoDB:', error));
  
app.use(cors());
app.use(express.json());

app.use('/', auth);
app.use('/registro', registro);
app.use('/login', login);
app.use('/multas', multas);
app.use('/users', users);
app.use('/notificaciones', notificaciones);

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
