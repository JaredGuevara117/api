const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true, unique: true },
  departamento: { type: String },
  torre: { type: String },
  rol: { type: String, required: true },
  contrasena: { type: String, required: true }
}, { collection: 'users' }); // 🔥 Asegura que use la colección correcta

module.exports = mongoose.model('User', userSchema);
