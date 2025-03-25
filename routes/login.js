const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Token = require("../models/tokens");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const router = express.Router();

// Inicio de sesión normal con usuario y contraseña
router.post("/", async (req, res) => {
  const { telefono, contrasena, rememberMe } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ telefono });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Comparar la contraseña hasheada
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Definir expiración según rememberMe
    const normalExp = "2h";
    const longExp = "7d";

    // Generar tokens
    const token = jwt.sign(
      { id: user._id, telefono: user.telefono, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: normalExp }
    );

    const longToken = jwt.sign(
      { id: user._id, telefono: user.telefono, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: longExp }
    );

    // Guardar o actualizar el token en la BD
    await Token.findOneAndUpdate(
      { userId: user._id }, // Buscar por el _id del usuario
      { 
      jwtoken: rememberMe ? longToken : token,
      tokenType: rememberMe ? 'rememberMe' : 'temporal',
      userId: user._id // Asegurarse de insertar el ObjectId del usuario
      },
      { upsert: true, new: true }
    );

    res.json({ user, token, longToken });

  } catch (err) {
    console.error("🔥 Error en el login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// **Nueva ruta para inicio de sesión con token almacenado en BD**
router.post("/autologin", async (req, res) => {
  const { telefono, token } = req.body;
  console.log("📢 Iniciando autologin...");
  console.log("📞 Teléfono recibido:", telefono);
  console.log("🔑 Token recibido:", token);

  try {
    // Buscar el token en la BD
    const storedToken = await Token.findOne({ telefono }); // Cambiado de phoneNumber a telefono
    console.log("🛢 Token en BD:", storedToken);

    if (!storedToken) {
      console.log("❌ No se encontró el token en la BD.");
      return res.status(401).json({ error: "No hay sesión guardada" });
    }

    if (storedToken.jwtoken !== token) {
      console.log("❌ Token incorrecto o expirado.");
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decodificado:", decoded);

    const user = await User.findOne({ telefono });
    console.log("👤 Usuario encontrado:", user);

    if (!user) {
      console.log("❌ Usuario no encontrado.");
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    res.json({ user, token });

  } catch (err) {
    console.error("🔥 Error en autologin:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// **Nueva ruta para eliminar el token al cerrar sesión**
router.post("/logout", async (req, res) => {
  const { id } = req.body;

  try {
    // Convertir el id a ObjectId usando 'new'
    const objectId = new mongoose.Types.ObjectId(id);

    // Eliminar el token de la base de datos
    await Token.findOneAndDelete({ userId: objectId });

    res.json({ message: "Sesión cerrada correctamente" });
    console.log("👋 Sesión cerrada correctamente.");
  } catch (err) {
    console.error("🔥 Error al cerrar sesión:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// **Nueva ruta para guardar el token si "Recordar sesión" está activado**
router.post("/verificarToken", async (req, res) => {
  const { id } = req.body;

  try {
    // Convertir el id a ObjectId usando 'new'
    const objectId = new mongoose.Types.ObjectId(id);

    // Verificar si existe un registro con el ObjectId
    const tokenRecord = await Token.findOne({ userId: objectId });

    if (!tokenRecord) {
      return res.status(401).json({ error: "Token no encontrado" });
    }

    res.json({ message: "Token verificado correctamente", tokenRecord });
  } catch (err) {
    console.error("🔥 Error al verificar el token:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;