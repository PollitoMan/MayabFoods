const jwt = require('jsonwebtoken')
const User = require('../models/usersModel')

const protect = async(req, res, next) => {

     //definir la variable token
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //obtengo el token del encabezado de autorizacion
            token = req.headers.authorization.split(' ')[1]
            //verifico el token con la firma del secreto
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            //busco el usuario con el id del token
            req.user = await User.findById(decoded.id).select('-password')

            next()

        } catch (error) {
           console.log(error) 
           res.status(401)
           throw new Error('Acceso no autorizado')
        }
    }

    if (!token) {
        res.status(401)
           throw new Error('Acceso no autorizado, no proporcionaste el token')
    }  
}

// Middleware para verificar que el usuario sea admin
const admin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next()
    } else {
        res.status(403)
        throw new Error('Acceso denegado. Se requiere rol de admin')
    }
}

// Middleware para verificar roles específicos
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401)
            throw new Error('Usuario no autenticado')
        }
        
        if (!roles.includes(req.user.rol)) {
            res.status(403)
            throw new Error(`Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`)
        }
        
        next()
    }
}

module.exports = { protect, admin, authorize }