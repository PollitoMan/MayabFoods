const express = require('express')
const router = express.Router()
const {
    getPedidos,
    getAllPedidos,
    getPedidoById,
    createPedido,
    updateEstadoPedido,
    updatePagoPedido,
    cancelarPedido
} = require('../controllers/pedidoControllers')
const { protect, admin } = require('../middleware/authMiddleware')

// Rutas privadas
router.get('/', protect, getPedidos)
router.get('/todos', protect, admin, getAllPedidos)
router.get('/:id', protect, getPedidoById)
router.post('/', protect, createPedido)
router.put('/:id/estado', protect, admin, updateEstadoPedido)
router.put('/:id/pago', protect, updatePagoPedido)
router.delete('/:id', protect, cancelarPedido)

module.exports = router
