const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: [true, 'Por favor teclea tu nombre']
    },
    email:{
        type: String,
        required: [true, 'Por favor teclea tu email'],
        unique: true
    },
    password:{
        type: String,
        required: [true, 'Por favor teclea tu password']
    },
    rol: {
        type: String,
        enum: ['estudiante', 'profesor', 'admin'],
        default: 'estudiante',
        required: true
    },
    matricula: {
        type: String,
        sparse: true // Permite null, pero si existe debe ser único
    },
    telefono: {
        type: String
    }
},{
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)