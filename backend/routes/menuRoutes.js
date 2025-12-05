const express = require('express')
const router = express.Router()
const {
    getMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    updateDisponibilidad
} = require('../controllers/menuControllers')
const { protect, admin } = require('../middleware/authMiddleware')

// Rutas públicas
router.get('/', getMenus)
router.get('/:id', getMenuById)

// Rutas privadas (Admin)
router.post('/', protect, admin, createMenu)
router.put('/:id', protect, admin, updateMenu)
router.delete('/:id', protect, admin, deleteMenu)
router.patch('/:id/disponibilidad', protect, admin, updateDisponibilidad)

module.exports = router
