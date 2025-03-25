const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  jwtoken: { type: String, required: true },
  tokenType: { type: String, enum: ["temporal", "rememberMe"], required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Expira en 1 hora
});

module.exports = mongoose.model("Token", tokenSchema);