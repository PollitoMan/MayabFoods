const mongoose = require('mongoose')

const pagoSchema = mongoose.Schema({
    pedido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pedido',
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    metodoPago: {
        type: String,
        enum: ['tarjeta', 'paypal', 'vale', 'efectivo'],
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'],
        default: 'pendiente'
    },
    transaccionId: {
        type: String
    },
    comprobante: {
        type: String
    },
    detallesTarjeta: {
        ultimosDigitos: String,
        tipo: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Pago', pagoSchema)
