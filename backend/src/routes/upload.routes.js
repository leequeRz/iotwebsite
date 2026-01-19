const express = require('express')
const upload = require('../middlewares/upload.middleware')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()

// Upload single image (admin only)
router.post('/image', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'ไม่พบไฟล์รูปภาพ' })
    }

    // Return the file path/URL
    const imageUrl = `/uploads/${req.file.filename}`
    
    res.json({
      message: 'อัพโหลดรูปภาพสำเร็จ',
      imageUrl: imageUrl,
      filename: req.file.filename
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพโหลด' })
  }
})

// Upload multiple images (admin only)
router.post('/images', authMiddleware, adminMiddleware, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'ไม่พบไฟล์รูปภาพ' })
    }

    const imageUrls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }))

    res.json({
      message: 'อัพโหลดรูปภาพสำเร็จ',
      images: imageUrls
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพโหลด' })
  }
})

module.exports = router
