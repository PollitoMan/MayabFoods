const express = require('express')
const router = express.Router()
const {
    getPagos,
    getAllPagos,
    getPagoById,
    createPago,
    procesarPagoTarjeta,
    updateEstadoPago,
    getEstadisticasPagos
} = require('../controllers/pagoControllers')
const { protect, admin } = require('../middleware/authMiddleware')

// Rutas privadas
router.get('/', protect, getPagos)
router.get('/todos', protect, admin, getAllPagos)
router.get('/estadisticas', protect, admin, getEstadisticasPagos)
router.get('/:id', protect, getPagoById)
router.post('/', protect, createPago)
router.post('/tarjeta', protect, procesarPagoTarjeta)
router.put('/:id/estado', protect, admin, updateEstadoPago)

module.exports = router
