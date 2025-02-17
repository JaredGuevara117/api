const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Modelo de usuario
const JWT_SECRET = require("../config/jwtSecret"); // Clave segura

const router = express.Router();

router.post("/", async (req, res) => {
  const { telefono, contrasena } = req.body;

  try {
    const user = await User.findOne({ telefono });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (contrasena !== user.contrasena) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar el token con la clave persistente
    const token = jwt.sign(
      { id: user._id, telefono: user.telefono, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
