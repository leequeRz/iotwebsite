const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()
const prisma = new PrismaClient()

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Create category (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, image } = req.body
    const slug = name.toLowerCase().replace(/\s+/g, '-')

    const category = await prisma.category.create({
      data: { name, description, image, slug }
    })

    res.status(201).json(category)
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Update category (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, image } = req.body
    const slug = name ? name.toLowerCase().replace(/\s+/g, '-') : undefined

    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, image, slug }
    })

    res.json(category)
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Delete category (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: parseInt(req.params.id) }
    })

    res.json({ message: 'ลบหมวดหมู่เรียบร้อย' })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

module.exports = router
