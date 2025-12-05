const asyncHandler = require('express-async-handler')
const Reserva = require('../models/reservaModel')

// @desc    Obtener todas las reservas del usuario
// @route   GET /api/reservas
// @access  Private
const getReservas = asyncHandler(async (req, res) => {
    const reservas = await Reserva.find({ usuario: req.user.id })
        .sort({ fecha: -1 })
    
    res.status(200).json(reservas)
})

// @desc    Obtener todas las reservas (Admin)
// @route   GET /api/reservas/todas
// @access  Private/Admin
const getAllReservas = asyncHandler(async (req, res) => {
    const { fecha, estado } = req.query
    let filtro = {}
    
    if (fecha) {
        const fechaInicio = new Date(fecha)
        const fechaFin = new Date(fecha)
        fechaFin.setDate(fechaFin.getDate() + 1)
        filtro.fecha = { $gte: fechaInicio, $lt: fechaFin }
    }
    
    if (estado) filtro.estado = estado

    const reservas = await Reserva.find(filtro)
        .populate('usuario', 'nombre email matricula')
        .sort({ fecha: 1, hora: 1 })
    
    res.status(200).json(reservas)
})

// @desc    Obtener reserva por ID
// @route   GET /api/reservas/:id
// @access  Private
const getReservaById = asyncHandler(async (req, res) => {
    const reserva = await Reserva.findById(req.params.id)
        .populate('usuario', 'nombre email')

    if (!reserva) {
        res.status(404)
        throw new Error('Reserva no encontrada')
    }

    // Verificar que el usuario sea el dueño de la reserva o sea admin
    if (reserva.usuario._id.toString() !== req.user.id && req.user.rol !== 'admin') {
        res.status(401)
        throw new Error('No autorizado para ver esta reserva')
    }

    res.status(200).json(reserva)
})

// @desc    Crear nueva reserva
// @route   POST /api/reservas
// @access  Private
const createReserva = asyncHandler(async (req, res) => {
    const { fecha, hora, numeroPersonas, notas } = req.body

    if (!fecha || !hora || !numeroPersonas) {
        res.status(400)
        throw new Error('Por favor completa todos los campos obligatorios')
    }

    // Validar que la fecha sea futura
    const fechaReserva = new Date(fecha)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    if (fechaReserva < hoy) {
        res.status(400)
        throw new Error('No se pueden hacer reservas para fechas pasadas')
    }

    // Verificar disponibilidad (máximo 20 mesas disponibles por hora)
    const reservasExistentes = await Reserva.countDocuments({
        fecha: {
            $gte: new Date(fecha),
            $lt: new Date(new Date(fecha).setDate(new Date(fecha).getDate() + 1))
        },
        hora,
        estado: { $in: ['pendiente', 'confirmada'] }
    })

    if (reservasExistentes >= 20) {
        res.status(400)
        throw new Error('No hay disponibilidad para esta fecha y hora')
    }

    const reserva = await Reserva.create({
        usuario: req.user.id,
        fecha: fechaReserva,
        hora,
        numeroPersonas,
        notas
    })

    res.status(201).json(reserva)
})

// @desc    Actualizar estado de reserva
// @route   PUT /api/reservas/:id/estado
// @access  Private/Admin
const updateEstadoReserva = asyncHandler(async (req, res) => {
    const reserva = await Reserva.findById(req.params.id)

    if (!reserva) {
        res.status(404)
        throw new Error('Reserva no encontrada')
    }

    const { estado, mesa } = req.body
    if (!estado) {
        res.status(400)
        throw new Error('Debe proporcionar un estado')
    }

    reserva.estado = estado
    if (mesa) reserva.mesa = mesa
    
    const updatedReserva = await reserva.save()

    res.status(200).json(updatedReserva)
})

// @desc    Cancelar reserva
// @route   DELETE /api/reservas/:id
// @access  Private
const cancelarReserva = asyncHandler(async (req, res) => {
    const reserva = await Reserva.findById(req.params.id)

    if (!reserva) {
        res.status(404)
        throw new Error('Reserva no encontrada')
    }

    // Verificar que el usuario sea el dueño de la reserva
    if (reserva.usuario.toString() !== req.user.id && req.user.rol !== 'admin') {
        res.status(401)
        throw new Error('No autorizado para cancelar esta reserva')
    }

    // Solo se pueden cancelar reservas pendientes o confirmadas
    if (reserva.estado !== 'pendiente' && reserva.estado !== 'confirmada') {
        res.status(400)
        throw new Error('No se puede cancelar una reserva en este estado')
    }

    reserva.estado = 'cancelada'
    await reserva.save()

    res.status(200).json({ message: 'Reserva cancelada', reserva })
})

// @desc    Obtener disponibilidad por fecha
// @route   GET /api/reservas/disponibilidad/:fecha
// @access  Public
const getDisponibilidad = asyncHandler(async (req, res) => {
    const { fecha } = req.params
    const fechaBusqueda = new Date(fecha)
    
    const horarios = [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00'
    ]

    const disponibilidad = []

    for (let hora of horarios) {
        const reservasEnHora = await Reserva.countDocuments({
            fecha: {
                $gte: fechaBusqueda,
                $lt: new Date(fechaBusqueda.getTime() + 24 * 60 * 60 * 1000)
            },
            hora,
            estado: { $in: ['pendiente', 'confirmada'] }
        })

        disponibilidad.push({
            hora,
            disponible: reservasEnHora < 20,
            mesasDisponibles: Math.max(0, 20 - reservasEnHora)
        })
    }

    res.status(200).json(disponibilidad)
})

module.exports = {
    getReservas,
    getAllReservas,
    getReservaById,
    createReserva,
    updateEstadoReserva,
    cancelarReserva,
    getDisponibilidad
}
