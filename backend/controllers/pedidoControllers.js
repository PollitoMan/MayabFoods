const asyncHandler = require('express-async-handler')
const Pedido = require('../models/pedidoModel')
const Menu = require('../models/menuModel')

// @desc    Obtener todos los pedidos del usuario
// @route   GET /api/pedidos
// @access  Private
const getPedidos = asyncHandler(async (req, res) => {
    const pedidos = await Pedido.find({ usuario: req.user.id })
        .populate('platillos.menu')
        .sort({ createdAt: -1 })
    
    res.status(200).json(pedidos)
})

// @desc    Obtener todos los pedidos (Admin)
// @route   GET /api/pedidos/todos
// @access  Private/Admin
const getAllPedidos = asyncHandler(async (req, res) => {
    const { estado } = req.query
    let filtro = {}
    if (estado) filtro.estado = estado

    const pedidos = await Pedido.find(filtro)
        .populate('usuario', 'nombre email matricula')
        .populate('platillos.menu')
        .sort({ createdAt: -1 })
    
    res.status(200).json(pedidos)
})

// @desc    Obtener pedido por ID
// @route   GET /api/pedidos/:id
// @access  Private
const getPedidoById = asyncHandler(async (req, res) => {
    const pedido = await Pedido.findById(req.params.id)
        .populate('usuario', 'nombre email')
        .populate('platillos.menu')

    if (!pedido) {
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    // Verificar que el usuario sea el dueño del pedido o sea admin
    if (pedido.usuario._id.toString() !== req.user.id && req.user.rol !== 'admin') {
        res.status(401)
        throw new Error('No autorizado para ver este pedido')
    }

    res.status(200).json(pedido)
})

// @desc    Crear nuevo pedido
// @route   POST /api/pedidos
// @access  Private
const createPedido = asyncHandler(async (req, res) => {
    const { platillos, metodoPago, notas, horaRecogida } = req.body

    if (!platillos || platillos.length === 0) {
        res.status(400)
        throw new Error('El pedido debe contener al menos un platillo')
    }

    if (!metodoPago) {
        res.status(400)
        throw new Error('Debe especificar un método de pago')
    }

    // Calcular el total
    let total = 0
    const platillosConPrecio = []

    for (let item of platillos) {
        const menu = await Menu.findById(item.menu)
        
        if (!menu) {
            res.status(404)
            throw new Error(`Menú con ID ${item.menu} no encontrado`)
        }

        if (!menu.disponible) {
            res.status(400)
            throw new Error(`El platillo ${menu.nombre} no está disponible`)
        }

        platillosConPrecio.push({
            menu: item.menu,
            cantidad: item.cantidad,
            precio: menu.precio
        })

        total += menu.precio * item.cantidad
    }

    const pedido = await Pedido.create({
        usuario: req.user.id,
        platillos: platillosConPrecio,
        total,
        metodoPago,
        notas,
        horaRecogida
    })

    const pedidoCompleto = await Pedido.findById(pedido._id).populate('platillos.menu')

    res.status(201).json(pedidoCompleto)
})

// @desc    Actualizar estado del pedido
// @route   PUT /api/pedidos/:id/estado
// @access  Private/Admin
const updateEstadoPedido = asyncHandler(async (req, res) => {
    const pedido = await Pedido.findById(req.params.id)

    if (!pedido) {
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    const { estado } = req.body
    if (!estado) {
        res.status(400)
        throw new Error('Debe proporcionar un estado')
    }

    pedido.estado = estado
    const updatedPedido = await pedido.save()

    res.status(200).json(updatedPedido)
})

// @desc    Actualizar pago del pedido
// @route   PUT /api/pedidos/:id/pago
// @access  Private
const updatePagoPedido = asyncHandler(async (req, res) => {
    const pedido = await Pedido.findById(req.params.id)

    if (!pedido) {
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    // Verificar que el usuario sea el dueño del pedido
    if (pedido.usuario.toString() !== req.user.id) {
        res.status(401)
        throw new Error('No autorizado para modificar este pedido')
    }

    pedido.pagado = true
    pedido.estado = 'confirmado'
    const updatedPedido = await pedido.save()

    res.status(200).json(updatedPedido)
})

// @desc    Cancelar pedido
// @route   DELETE /api/pedidos/:id
// @access  Private
const cancelarPedido = asyncHandler(async (req, res) => {
    const pedido = await Pedido.findById(req.params.id)

    if (!pedido) {
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    // Verificar que el usuario sea el dueño del pedido
    if (pedido.usuario.toString() !== req.user.id && req.user.rol !== 'admin') {
        res.status(401)
        throw new Error('No autorizado para cancelar este pedido')
    }

    // Solo se pueden cancelar pedidos pendientes o confirmados
    if (pedido.estado !== 'pendiente' && pedido.estado !== 'confirmado') {
        res.status(400)
        throw new Error('No se puede cancelar un pedido en este estado')
    }

    pedido.estado = 'cancelado'
    await pedido.save()

    res.status(200).json({ message: 'Pedido cancelado', pedido })
})

module.exports = {
    getPedidos,
    getAllPedidos,
    getPedidoById,
    createPedido,
    updateEstadoPedido,
    updatePagoPedido,
    cancelarPedido
}
