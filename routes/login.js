const express = require('express');
//const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Ajusta el path según tu modelo
const router = express.Router();

router.post('/', async (req, res) => {

  const { telefono, contrasena } = req.body;
  
  console.log('Body recibido:', req.body);
  try {
    const user = await User.findOne({ telefono });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (contrasena !== user.contrasena) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    

    res.status(200).json({ message: 'Inicio de sesión exitoso', user });
  } catch (err) {
    console.error('Error en /login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
