const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()
const prisma = new PrismaClient()

// Get user orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(req.params.id),
        ...(req.user.role !== 'admin' && { userId: req.user.id })
      },
      include: {
        items: {
          include: { product: true }
        },
        address: true,
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' })
    }

    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { addressId, note } = req.body

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'ตะกร้าว่างเปล่า' })
    }

    // Check stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `สินค้า ${item.product.name} มีไม่เพียงพอ` 
        })
      }
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity)
    }, 0)

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          addressId: parseInt(addressId),
          total,
          note,
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: {
          items: { include: { product: true } },
          address: true
        }
      })

      // Update stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: req.user.id }
      })

      return newOrder
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Update order status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: {
        items: { include: { product: true } },
        address: true
      }
    })

    res.json(order)
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Cancel order
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
        status: 'pending'
      },
      include: { items: true }
    })

    if (!order) {
      return res.status(404).json({ message: 'ไม่สามารถยกเลิกคำสั่งซื้อนี้ได้' })
    }

    // Restore stock and cancel
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' }
      })
    })

    res.json({ message: 'ยกเลิกคำสั่งซื้อเรียบร้อย' })
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

module.exports = router
