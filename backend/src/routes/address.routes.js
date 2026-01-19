const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()
const prisma = new PrismaClient()

// Get user addresses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    res.json(addresses)
  } catch (error) {
    console.error('Get addresses error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Create address
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { label, fullAddress, district, province, postalCode, latitude, longitude, isDefault } = req.body

    // If this is default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label,
        fullAddress,
        district,
        province,
        postalCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isDefault: isDefault ?? false
      }
    })

    res.status(201).json(address)
  } catch (error) {
    console.error('Create address error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Update address
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { label, fullAddress, district, province, postalCode, latitude, longitude, isDefault } = req.body

    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    })

    if (!existing) {
      return res.status(404).json({ message: 'ไม่พบที่อยู่' })
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.update({
      where: { id: parseInt(req.params.id) },
      data: {
        label,
        fullAddress,
        district,
        province,
        postalCode,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        isDefault
      }
    })

    res.json(address)
  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// Delete address
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.address.deleteMany({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    })

    res.json({ message: 'ลบที่อยู่เรียบร้อย' })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

module.exports = router
