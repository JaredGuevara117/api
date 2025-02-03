const mongoose = require('mongoose');

const multaSchema = new mongoose.Schema({
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

const Multa = mongoose.model('Multa', multaSchema);

module.exports = Multa;