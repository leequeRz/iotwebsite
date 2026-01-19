const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()
const prisma = new PrismaClient()

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      inStock, 
      sort = 'newest' 
    } = req.query

    const where = {
      isActive: true
    }

    if (category) {
      where.categoryId = parseInt(category)
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) }
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) }
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 }
    }

    let orderBy = {}
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ])

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true }
    })

    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' })
    }

    res.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Create product (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, image, categoryId, isActive, isNew } = req.body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image,
        categoryId: parseInt(categoryId),
        isActive: isActive ?? true,
        isNew: isNew ?? false
      },
      include: { category: true }
    })

    res.status(201).json(product)
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Update product (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, image, categoryId, isActive, isNew } = req.body

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        image,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        isActive,
        isNew
      },
      include: { category: true }
    })

    res.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Delete product (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    })

    res.json({ message: 'ลบสินค้าเรียบร้อย' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

module.exports = router
