const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'Por favor teclea el nombre del platillo']
    },
    descripcion: {
        type: String,
        required: [true, 'Por favor teclea la descripción']
    },
    precio: {
        type: Number,
        required: [true, 'Por favor teclea el precio']
    },
    categoria: {
        type: String,
        enum: ['desayuno', 'comida', 'cena', 'bebida', 'postre'],
        required: [true, 'Por favor especifica la categoría']
    },
    disponible: {
        type: Boolean,
        default: true
    },
    imagen: {
        type: String
    },
    tipoMenu: {
        type: String,
        enum: ['regular', 'vegano', 'vegetariano', 'sin-gluten', 'promocion'],
        default: 'regular'
    },
    ingredientes: [{
        type: String
    }],
    calorias: {
        type: Number
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Menu', menuSchema)
