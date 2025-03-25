const express = require('express');
const router = express.Router();
const Multa = require('../models/multas');
const Notificacion = require('../models/notificacionesxd'); // Asegúrate de que este modelo sea correcto

router.get('/:departamento/:torre', async (req, res) => {
    const { departamento, torre } = req.params;

    console.log('departamento notificaciones:', departamento);
    console.log('torre:', torre);

    try {
        if (!departamento || !torre) {
            return res.status(400).json({ message: 'Faltan parámetros: departamento o torre' });
        }

        // Busca todas las notificaciones que coincidan con departamento y torre
        const notificaciones = await Notificacion.find({ departamento, torre }).sort({ createdAt: -1 });

        if (notificaciones.length > 0) {
            res.status(200).json(notificaciones); // Devuelve las notificaciones encontradas
        } else {
            res.status(200).json({ message: 'No se encontraron notificaciones', data: [] }); // Respuesta vacía
        }
    } catch (error) {
        console.error('Error al obtener las notificaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('id:', id);

    try {
        // Busca y elimina la notificación por ID
        const notificacionEliminada = await Notificacion.findByIdAndDelete(id);

        if (notificacionEliminada) {
            res.status(200).json({ message: 'Notificación eliminada correctamente' });
        } else {
            res.status(404).json({ message: 'No se encontró la notificación' });
        }
    } catch (error) {
        console.error('Error al eliminar la notificación:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
});


module.exports = router;
