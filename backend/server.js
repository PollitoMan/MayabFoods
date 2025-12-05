const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorMiddleware')
const cors = require('cors')

const port = process.env.PORT || 5001

connectDB()

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Rutas del sistema
app.use('/api/users', require('./routes/usersRoutes'))
app.use('/api/menus', require('./routes/menuRoutes'))
app.use('/api/pedidos', require('./routes/pedidoRoutes'))
app.use('/api/reservas', require('./routes/reservaRoutes'))
app.use('/api/pagos', require('./routes/pagoRoutes'))

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: 'API de MayabFoods',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            menus: '/api/menus',
            pedidos: '/api/pedidos',
            reservas: '/api/reservas',
            pagos: '/api/pagos'
        }
    })
})

app.use(errorHandler)

app.listen(port, () => console.log(`Servidor iniciado en el puerto ${port}`))
