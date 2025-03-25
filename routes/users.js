const express = require('express');
const User = require('../models/user');
const Token = require('../models/tokens');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();
const {verifyToken} = require('../routes/auth');

// Obtener todos los usuarios
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { nombre, telefono, departamento, torre, rol, contrasena } = req.body;

    if (!nombre || !telefono || !rol || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const newUser = new User({
      nombre,
      telefono,
      departamento,
      torre,
      rol,
      contrasena
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar solo los campos proporcionados
    if (username) user.username = username;
    if (password) user.password = password; // Esto activará el hash en el esquema

    await user.save();
    res.status(200).json({ message: 'Usuario actualizado exitosamente' });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(req.params);
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Ruta para cambiar la contraseña
router.post('/change-password', async (req, res) => {
  const { phone, newPassword, logoutAll } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ telefono: phone });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si logoutAll es verdadero, eliminar todos los tokens asociados al usuario
    if (logoutAll) {
      await Token.deleteMany({ userId: user._id }); // No es necesario convertir el _id a ObjectId
    }

    user.contrasena = newPassword; // Aquí deberías aplicar el hash de la contraseña
    await user.save();

    res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
});

module.exports = router;
