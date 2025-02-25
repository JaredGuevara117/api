const express = require('express');
const User = require('../models/user');
const router = express.Router();
const cors = require('cors');


router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, telefono, departamento, torre, tipoUsuario, contrasena } = req.body;
    console.log('Datos del registro = ', req.body);

    // Validar si ya existe un usuario con el mismo correo o nombre de usuario
    const existingUser = await User.findOne({
      $or: [{ nombre }, { apellido }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'El correo o nombre de usuario ya está registrado' });
    }

    // Crear y guardar el nuevo usuario
    const newUser = new User({ nombre, apellido, telefono, departamento, torre, tipoUsuario, contrasena });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

module.exports = router;
