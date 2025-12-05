const express = require('express')
const router = express.Router()
const {
    getReservas,
    getAllReservas,
    getReservaById,
    createReserva,
    updateEstadoReserva,
    cancelarReserva,
    getDisponibilidad
} = require('../controllers/reservaControllers')
const { protect, admin } = require('../middleware/authMiddleware')

// Rutas públicas
router.get('/disponibilidad/:fecha', getDisponibilidad)

// Rutas privadas
router.get('/', protect, getReservas)
router.get('/todas', protect, admin, getAllReservas)
router.get('/:id', protect, getReservaById)
router.post('/', protect, createReserva)
router.put('/:id/estado', protect, admin, updateEstadoReserva)
router.delete('/:id', protect, cancelarReserva)

module.exports = router
