const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

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

    // Generar token con el secreto actual
    const token = jwt.sign(
      { id: user._id, telefono: user.telefono, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log("🛠️ Token generado:", token); // 👀 Verifica si se genera un token válido

    res.json({ user, token });
  } catch (err) { 
    console.error("🔥 Error en el login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
