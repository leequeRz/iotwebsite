const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()
const prisma = new PrismaClient()

// Get cart items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(cartItems)
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Add to cart
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    })

    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' })
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'สินค้าไม่เพียงพอ' })
    }

    // Check if already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId)
        }
      }
    })

    let cartItem

    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity) },
        include: { product: true }
      })
    } else {
      // Create new
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        },
        include: { product: true }
      })
    }

    res.status(201).json(cartItem)
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Update cart item quantity
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      include: { product: true }
    })

    if (!cartItem) {
      return res.status(404).json({ message: 'ไม่พบรายการในตะกร้า' })
    }

    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ message: 'สินค้าไม่เพียงพอ' })
    }

    const updated = await prisma.cartItem.update({
      where: { id: parseInt(req.params.id) },
      data: { quantity: parseInt(quantity) },
      include: { product: true }
    })

    res.json(updated)
  } catch (error) {
    console.error('Update cart error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Remove from cart
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    })

    res.json({ message: 'ลบสินค้าออกจากตะกร้าแล้ว' })
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Clear cart
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    })

    res.json({ message: 'ล้างตะกร้าเรียบร้อย' })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

module.exports = router
