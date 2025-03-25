const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); 
const JWT_SECRET = require("../config/jwtSecret"); 

const router = express.Router();

router.post("/", async (req, res) => {
  const { telefono, contrasena, rememberMe } = req.body; // Capturar el "recordar sesión"

  try {
    const user = await User.findOne({ telefono });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (contrasena !== user.contrasena) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Definir tiempos de expiración
    const expiresInShort = "2h"; // Token normal (2 horas)
    const expiresInLong = "7d"; // Token de sesión recordada (7 días)

    // Token normal
    const token = jwt.sign(
      { id: user._id, telefono: user.telefono, rol: user.rol },
      JWT_SECRET,
      { expiresIn: expiresInShort }
    );

    // Token de sesión guardada (si rememberMe es true)
    const refreshToken = rememberMe 
      ? jwt.sign({ id: user._id, telefono: user.telefono, rol: user.rol }, JWT_SECRET, { expiresIn: expiresInLong })
      : null;

    res.json({ user, token, refreshToken }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
