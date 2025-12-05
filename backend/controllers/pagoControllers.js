const asyncHandler = require('express-async-handler')
const Pago = require('../models/pagoModel')
const Pedido = require('../models/pedidoModel')

// @desc    Obtener todos los pagos del usuario
// @route   GET /api/pagos
// @access  Private
const getPagos = asyncHandler(async (req, res) => {
    const pagos = await Pago.find({ usuario: req.user.id })
        .populate('pedido')
        .sort({ createdAt: -1 })
    
    res.status(200).json(pagos)
})

// @desc    Obtener todos los pagos (Admin)
// @route   GET /api/pagos/todos
// @access  Private/Admin
const getAllPagos = asyncHandler(async (req, res) => {
    const { estado, metodoPago } = req.query
    let filtro = {}
    
    if (estado) filtro.estado = estado
    if (metodoPago) filtro.metodoPago = metodoPago

    const pagos = await Pago.find(filtro)
        .populate('usuario', 'nombre email')
        .populate('pedido')
        .sort({ createdAt: -1 })
    
    res.status(200).json(pagos)
})

// @desc    Obtener pago por ID
// @route   GET /api/pagos/:id
// @access  Private
const getPagoById = asyncHandler(async (req, res) => {
    const pago = await Pago.findById(req.params.id)
        .populate('usuario', 'nombre email')
        .populate('pedido')

    if (!pago) {
        res.status(404)
        throw new Error('Pago no encontrado')
    }

    // Verificar que el usuario sea el dueño del pago o sea admin
    if (pago.usuario._id.toString() !== req.user.id && req.user.rol !== 'admin') {
        res.status(401)
        throw new Error('No autorizado para ver este pago')
    }

    res.status(200).json(pago)
})

// @desc    Crear nuevo pago
// @route   POST /api/pagos
// @access  Private
const createPago = asyncHandler(async (req, res) => {
    const { pedidoId, metodoPago, detallesTarjeta } = req.body

    if (!pedidoId || !metodoPago) {
        res.status(400)
        throw new Error('Por favor completa todos los campos obligatorios')
    }

    // Verificar que el pedido existe
    const pedido = await Pedido.findById(pedidoId)
    if (!pedido) {
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    // Verificar que el usuario es el dueño del pedido
    if (pedido.usuario.toString() !== req.user.id) {
        res.status(401)
        throw new Error('No autorizado para pagar este pedido')
    }

    // Verificar que el pedido no esté ya pagado
    if (pedido.pagado) {
        res.status(400)
        throw new Error('Este pedido ya ha sido pagado')
    }

    // Simular procesamiento de pago
    const transaccionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const comprobante = `COMP-${Date.now()}`

    const pago = await Pago.create({
        pedido: pedidoId,
        usuario: req.user.id,
        monto: pedido.total,
        metodoPago,
        estado: 'completado',
        transaccionId,
        comprobante,
        detallesTarjeta
    })

    // Actualizar estado del pedido
    pedido.pagado = true
    pedido.estado = 'confirmado'
    await pedido.save()

    const pagoCompleto = await Pago.findById(pago._id)
        .populate('usuario', 'nombre email')
        .populate('pedido')

    res.status(201).json(pagoCompleto)
})

// @desc    Procesar pago con tarjeta
// @route   POST /api/pagos/tarjeta
// @access  Private
const procesarPagoTarjeta = asyncHandler(async (req, res) => {
    const { pedidoId, numeroTarjeta, cvv, fechaExpiracion, nombreTitular } = req.body

    if (!pedidoId || !numeroTarjeta || !cvv || !fechaExpiracion || !nombreTitular) {
        res.status(400)
        throw new Error('Por favor completa todos los datos de la tarjeta')
    }

    // Validación básica de tarjeta
    if (numeroTarjeta.length < 13 || numeroTarjeta.length > 19) {
        res.status(400)
        throw new Error('Número de tarjeta inválido')
    }

    // Verificar que el pedido existe
    const pedido = await Pedido.findById(pedidoId)
    if (!pedido) {
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    // Verificar que el usuario es el dueño del pedido
    if (pedido.usuario.toString() !== req.user.id) {
        res.status(401)
        throw new Error('No autorizado para pagar este pedido')
    }

    // Simular procesamiento de pago con tarjeta
    const ultimosDigitos = numeroTarjeta.slice(-4)
    const tipoTarjeta = numeroTarjeta.startsWith('4') ? 'Visa' : 
                       numeroTarjeta.startsWith('5') ? 'Mastercard' : 'Otra'

    const transaccionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const comprobante = `COMP-${Date.now()}`

    const pago = await Pago.create({
        pedido: pedidoId,
        usuario: req.user.id,
        monto: pedido.total,
        metodoPago: 'tarjeta',
        estado: 'completado',
        transaccionId,
        comprobante,
        detallesTarjeta: {
            ultimosDigitos,
            tipo: tipoTarjeta
        }
    })

    // Actualizar estado del pedido
    pedido.pagado = true
    pedido.estado = 'confirmado'
    await pedido.save()

    res.status(201).json({
        message: 'Pago procesado exitosamente',
        pago,
        pedido
    })
})

// @desc    Actualizar estado del pago
// @route   PUT /api/pagos/:id/estado
// @access  Private/Admin
const updateEstadoPago = asyncHandler(async (req, res) => {
    const pago = await Pago.findById(req.params.id)

    if (!pago) {
        res.status(404)
        throw new Error('Pago no encontrado')
    }

    const { estado } = req.body
    if (!estado) {
        res.status(400)
        throw new Error('Debe proporcionar un estado')
    }

    pago.estado = estado
    const updatedPago = await pago.save()

    res.status(200).json(updatedPago)
})

// @desc    Obtener estadísticas de pagos (Admin)
// @route   GET /api/pagos/estadisticas
// @access  Private/Admin
const getEstadisticasPagos = asyncHandler(async (req, res) => {
    const totalPagos = await Pago.countDocuments({ estado: 'completado' })
    
    const montoTotal = await Pago.aggregate([
        { $match: { estado: 'completado' } },
        { $group: { _id: null, total: { $sum: '$monto' } } }
    ])

    const pagosPorMetodo = await Pago.aggregate([
        { $match: { estado: 'completado' } },
        { $group: { _id: '$metodoPago', count: { $sum: 1 }, total: { $sum: '$monto' } } }
    ])

    res.status(200).json({
        totalPagos,
        montoTotal: montoTotal[0]?.total || 0,
        pagosPorMetodo
    })
})

module.exports = {
    getPagos,
    getAllPagos,
    getPagoById,
    createPago,
    procesarPagoTarjeta,
    updateEstadoPago,
    getEstadisticasPagos
}
