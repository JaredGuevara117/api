const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "secreto_super_seguro"; // Clave secreta para JWT

// Endpoint de login
router.post("/login", async (req, res) => {
  const { telefono, contrasena } = req.body;

  try {
    const user = await User.findOne({ telefono });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Comparar contraseñas
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT con el rol
    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      SECRET_KEY,
      { expiresIn: "1h" } // Token expira en 1 hora
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(403).json({ error: "Acceso denegado" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Middleware para verificar rol
const verifyRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  };
};

module.exports = { router, verifyToken, verifyRole };
