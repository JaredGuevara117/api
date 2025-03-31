const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true, unique: true },
  correo: { type: String, required: true, unique: true },
  departamento: { type: String },
  torre: { type: String },
  rol: { type: String, required: true },
  contrasena: { type: String, required: true },
}, { collection: 'users' });

// Middleware para hash de la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (this.isModified('contrasena')) {
    this.contrasena = await bcrypt.hash(this.contrasena, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
