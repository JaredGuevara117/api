const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    cantidad: {
        type: Number,
        required: true
    },
    motivo: {
        type: String,
        required: true
    },
    departamento: {
        type: String,
        required: true
    },
    torre: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Notificacion = mongoose.model('Notificacion', notificacionSchema);

module.exports = Notificacion;