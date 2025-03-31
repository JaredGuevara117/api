const express = require('express');
const User = require('../models/user');
const Token = require('../models/tokens');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Ruta para generar y enviar el token de cambio de contraseña
router.post('/solicitar-cambio', async (req, res) => {
  const { correoOtelefono } = req.body;

  try {
    // Buscar al usuario por correo o teléfono
    const user = await User.findOne({
      $or: [{ telefono: correoOtelefono }, { correo: correoOtelefono }],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar un token JWT que expira en 5 minutos
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

    // Enviar el token al correo del usuario
    const mailOptions = {
      from: 'Jared Guevara <tu_correo@gmail.com>',
      to: user.correo, // Asegúrate de que el modelo User tenga el campo "correo"
      subject: "Cambio de contraseña",
      html: `
        <h1>Reestablece tu contraseña</h1>
        <p>Haz clic en el siguiente enlace para cambiar tu contraseña. Este enlace expirará en 5 minutos:</p>
        <a href="https://condominio-jsw0nagd9-jaredguevara117s-projects.vercel.app/?token=${resetToken}">Cambiar contraseña</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Correo enviado con el enlace para cambiar la contraseña.' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});

// Ruta para verificar el token y cambiar la contraseña
router.post('/cambiar-contrasena', async (req, res) => {
  const { token, nuevaContrasena, logoutAll } = req.body;

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al usuario por ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar la contraseña
    user.contrasena = nuevaContrasena; // El hash se aplicará automáticamente si está configurado en el modelo
    await user.save();

    // Cerrar sesión en todos los dispositivos si se seleccionó la opción
    if (logoutAll) {
      await Token.deleteMany({ userId: user._id });
    }

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(400).json({ error: 'Token inválido o expirado.' });
  }
});

module.exports = router;