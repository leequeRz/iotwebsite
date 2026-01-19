require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

// Import routes
const authRoutes = require('./routes/auth.routes')
const productRoutes = require('./routes/product.routes')
const categoryRoutes = require('./routes/category.routes')
const cartRoutes = require('./routes/cart.routes')
const orderRoutes = require('./routes/order.routes')
const addressRoutes = require('./routes/address.routes')
const adminRoutes = require('./routes/admin.routes')
const uploadRoutes = require('./routes/upload.routes')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IoT Shop API is running!' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 3000

// Start server only if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
  })
}

// Export for Vercel
module.exports = app

module.exports = app
