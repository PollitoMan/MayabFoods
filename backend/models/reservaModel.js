const mongoose = require('mongoose')

const reservaSchema = mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fecha: {
        type: Date,
        required: [true, 'Por favor especifica la fecha de reserva']
    },
    hora: {
        type: String,
        required: [true, 'Por favor especifica la hora de reserva']
    },
    numeroPersonas: {
        type: Number,
        required: [true, 'Por favor especifica el número de personas'],
        min: 1,
        max: 10
    },
    mesa: {
        type: String
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
        default: 'pendiente'
    },
    notas: {
        type: String
    },
    numeroReserva: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
})

// Generar número de reserva automáticamente
reservaSchema.pre('save', async function(next) {
    if (!this.numeroReserva) {
        const count = await mongoose.model('Reserva').countDocuments()
        this.numeroReserva = `RES-${Date.now()}-${count + 1}`
    }
    next()
})

module.exports = mongoose.model('Reserva', reservaSchema)
