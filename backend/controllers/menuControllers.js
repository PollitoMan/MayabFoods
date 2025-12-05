const asyncHandler = require('express-async-handler')
const Menu = require('../models/menuModel')

// @desc    Obtener todos los menús
// @route   GET /api/menus
// @access  Public
const getMenus = asyncHandler(async (req, res) => {
    const { categoria, disponible, tipoMenu } = req.query
    
    let filtro = {}
    if (categoria) filtro.categoria = categoria
    if (disponible !== undefined) filtro.disponible = disponible === 'true'
    if (tipoMenu) filtro.tipoMenu = tipoMenu

    const menus = await Menu.find(filtro).sort({ createdAt: -1 })
    res.status(200).json(menus)
})

// @desc    Obtener un menú por ID
// @route   GET /api/menus/:id
// @access  Public
const getMenuById = asyncHandler(async (req, res) => {
    const menu = await Menu.findById(req.params.id)
    
    if (!menu) {
        res.status(404)
        throw new Error('Menú no encontrado')
    }

    res.status(200).json(menu)
})

// @desc    Crear nuevo menú
// @route   POST /api/menus
// @access  Private/Admin
const createMenu = asyncHandler(async (req, res) => {
    const { nombre, descripcion, precio, categoria, disponible, imagen, tipoMenu, ingredientes, calorias } = req.body

    if (!nombre || !descripcion || !precio || !categoria) {
        res.status(400)
        throw new Error('Por favor completa todos los campos obligatorios')
    }

    const menu = await Menu.create({
        nombre,
        descripcion,
        precio,
        categoria,
        disponible,
        imagen,
        tipoMenu,
        ingredientes,
        calorias
    })

    res.status(201).json(menu)
})

// @desc    Actualizar menú
// @route   PUT /api/menus/:id
// @access  Private/Admin
const updateMenu = asyncHandler(async (req, res) => {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
        res.status(404)
        throw new Error('Menú no encontrado')
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    )

    res.status(200).json(updatedMenu)
})

// @desc    Eliminar menú
// @route   DELETE /api/menus/:id
// @access  Private/Admin
const deleteMenu = asyncHandler(async (req, res) => {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
        res.status(404)
        throw new Error('Menú no encontrado')
    }

    await menu.deleteOne()
    res.status(200).json({ id: req.params.id, message: 'Menú eliminado' })
})

// @desc    Actualizar disponibilidad de menú
// @route   PATCH /api/menus/:id/disponibilidad
// @access  Private/Admin
const updateDisponibilidad = asyncHandler(async (req, res) => {
    const menu = await Menu.findById(req.params.id)

    if (!menu) {
        res.status(404)
        throw new Error('Menú no encontrado')
    }

    menu.disponible = req.body.disponible
    const updatedMenu = await menu.save()

    res.status(200).json(updatedMenu)
})

module.exports = {
    getMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    updateDisponibilidad
}
