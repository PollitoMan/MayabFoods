const mongoose = require('mongoose')

const pedidoSchema = mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    platillos: [{
        menu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        precio: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmado', 'en-preparacion', 'listo', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    metodoPago: {
        type: String,
        enum: ['tarjeta', 'paypal', 'vale', 'efectivo'],
        required: true
    },
    pagado: {
        type: Boolean,
        default: false
    },
    numeroPedido: {
        type: String,
        unique: true
    },
    notas: {
        type: String
    },
    horaRecogida: {
        type: Date
    }
}, {
    timestamps: true
})

// Generar número de pedido automáticamente
pedidoSchema.pre('save', async function(next) {
    if (!this.numeroPedido) {
        const count = await mongoose.model('Pedido').countDocuments()
        this.numeroPedido = `PED-${Date.now()}-${count + 1}`
    }
    next()
})

module.exports = mongoose.model('Pedido', pedidoSchema)
