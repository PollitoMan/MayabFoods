const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require ('../models/usersModel')

const login = asyncHandler( async(req,res) => {
    const {email, password} = req.body

    //verificamos que el usuario existe
    const user = await User.findOne({email})

    //si el usuario existe verifico el hash
    if(user && (await bcrypt.compare(password, user.password))){
        res.status(200).json({
            _id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            matricula: user.matricula,
            token: generarToken(user.id)
        })
    } else {
        res.status(401)
        throw new Error('Credenciales inválidas')
    }
})

const register = asyncHandler(async(req,res) => {
    //desestructuramos el body
    const {nombre, email, password, rol, matricula, telefono} = req.body
    
    //verificamos que nos pasen todos los campos
    if (!nombre || !email || !password) {
        res.status(400)
        throw new Error('Faltan datos obligatorios (nombre, email, password)')
    }

    //verificamos que ese usuario no exista y si no existe guardamos
    const userExists = await User.findOne({email})
    if (userExists){
        res.status(400)
        throw new Error('Ese usuario ya existe')
    } else {
        //hash al password
        const salt = await bcrypt.genSalt(10)
        const passwordHashed = await bcrypt.hash(password,salt)

        //crear el usuario
        const user = await User.create({
            nombre,
            email,
            password: passwordHashed,
            rol: rol || 'estudiante',
            matricula,
            telefono
        })

        //si el usuario se creo correctamente lo muestro
        if (user) {
            res.status(201).json({
                _id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                matricula: user.matricula,
                token: generarToken(user.id)
            })
        } else {
            res.status(400)
            throw new Error ('No se pudieron guardar los datos')
        }
    }
})

const data = asyncHandler(async(req,res) => {
    res.status(200).json(req.user)
})

// Obtener todos los usuarios (solo admin)
const getUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password')
    res.status(200).json(users)
})

// Actualizar usuario
const updateUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id)
    
    if (!user) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    ).select('-password')

    res.status(200).json(updatedUser)
})

// Eliminar usuario
const deleteUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id)
    
    if (!user) {
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    await user.deleteOne()
    res.status(200).json({ id: req.params.id, message: 'Usuario eliminado' })
})

const generarToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

module.exports = {
    login, 
    register,
    data,
    getUsers,
    updateUser,
    deleteUser
}