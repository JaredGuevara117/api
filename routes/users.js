const express = require('express');
const User = require('../models/user');
const crypto = require('crypto');
const router = express.Router();
// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});
router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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

  
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    try {
      await User.findByIdAndDelete(id);
      res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  });


module.exports = router;
