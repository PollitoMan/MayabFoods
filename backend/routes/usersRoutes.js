const express = require('express')
const router = express.Router()
const {login, register, data, getUsers, updateUser, deleteUser} = require('../controllers/usersControllers')
const {protect, admin} = require ('../middleware/authMiddleware')

//endpoints publicos
router.post('/login', login)
router.post('/register', register)

//endpoint privado
router.get('/data', protect, data)

//endpoints de administración
router.get('/', protect, admin, getUsers)
router.put('/:id', protect, admin, updateUser)
router.delete('/:id', protect, admin, deleteUser)

module.exports = router


