const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()
const prisma = new PrismaClient()

// Apply admin middleware to all routes
router.use(authMiddleware, adminMiddleware)

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalProducts,
      lowStockProducts,
      totalUsers,
      newUsersToday,
      totalOrders,
      pendingOrders,
      todayOrders,
      todaySales
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { createdAt: { gte: today }, role: 'user' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { total: true }
      })
    ])

    res.json({
      totalProducts,
      lowStockProducts,
      totalUsers,
      newUsersToday,
      totalOrders,
      pendingOrders,
      todayOrders,
      todaySales: todaySales._sum.total || 0
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// All orders (for admin)
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const where = status ? { status } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } },
          address: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ])

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Customer locations for map
router.get('/customer-locations', async (req, res) => {
  try {
    const { period = 'all' } = req.query

    let dateFilter = {}
    const now = new Date()

    switch (period) {
      case 'today':
        dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) }
        break
      case 'week':
        dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) }
        break
      case 'month':
        dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) }
        break
      case 'year':
        dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) }
        break
    }

    const orderWhere = period !== 'all' ? { createdAt: dateFilter } : {}

    // Get orders with addresses
    const orders = await prisma.order.findMany({
      where: orderWhere,
      include: {
        address: true
      }
    })

    // Group by province
    const provinceStats = {}
    orders.forEach(order => {
      const province = order.address.province
      if (!provinceStats[province]) {
        provinceStats[province] = {
          name: province,
          count: 0,
          totalSales: 0
        }
      }
      provinceStats[province].count++
      provinceStats[province].totalSales += parseFloat(order.total)
    })

    const topProvinces = Object.values(provinceStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get addresses with coordinates
    const locations = await prisma.address.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        province: true,
        latitude: true,
        longitude: true
      }
    })

    res.json({
      topProvinces,
      locations,
      totalCustomers: orders.length,
      coveredProvinces: Object.keys(provinceStats).length
    })
  } catch (error) {
    console.error('Get customer locations error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Top selling products
router.get('/top-products', async (req, res) => {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    })

    const productIds = topProducts.map(p => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    const result = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId)
      return {
        ...product,
        sold: tp._sum.quantity,
        revenue: parseFloat(product.price) * tp._sum.quantity
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Get top products error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// All users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

module.exports = router
