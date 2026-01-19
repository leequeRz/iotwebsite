const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iotshop.com' },
    update: {},
    create: {
      email: 'admin@iotshop.com',
      password: adminPassword,
      name: 'Admin',
      phone: '0812345678',
      role: 'admin'
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@iotshop.com' },
    update: {},
    create: {
      email: 'user@iotshop.com',
      password: userPassword,
      name: 'สมชาย ใจดี',
      phone: '0898765432',
      role: 'user',
      addresses: {
        create: {
          label: 'บ้าน',
          fullAddress: '123/45 ถนนสุขุมวิท',
          district: 'คลองเตย',
          province: 'กรุงเทพมหานคร',
          postalCode: '10110',
          latitude: 13.7563,
          longitude: 100.5018,
          isDefault: true
        }
      }
    }
  })
  console.log('✅ Test user created:', user.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'microcontrollers' },
      update: {},
      create: { name: 'Microcontrollers', slug: 'microcontrollers', description: 'บอร์ดไมโครคอนโทรลเลอร์' }
    }),
    prisma.category.upsert({
      where: { slug: 'sensors' },
      update: {},
      create: { name: 'Sensors', slug: 'sensors', description: 'เซ็นเซอร์ทุกชนิด' }
    }),
    prisma.category.upsert({
      where: { slug: 'displays' },
      update: {},
      create: { name: 'Displays', slug: 'displays', description: 'จอแสดงผล' }
    }),
    prisma.category.upsert({
      where: { slug: 'smart-home' },
      update: {},
      create: { name: 'Smart Home', slug: 'smart-home', description: 'อุปกรณ์สมาร์ทโฮม' }
    }),
    prisma.category.upsert({
      where: { slug: 'modules' },
      update: {},
      create: { name: 'Modules', slug: 'modules', description: 'โมดูลเสริม' }
    }),
    prisma.category.upsert({
      where: { slug: 'starter-kits' },
      update: {},
      create: { name: 'Starter Kits', slug: 'starter-kits', description: 'ชุดอุปกรณ์สำหรับผู้เริ่มต้น' }
    })
  ])
  console.log('✅ Categories created:', categories.length)

  // Create products
  const products = [
    { name: 'ESP32 DevKit V1', description: 'บอร์ด ESP32 พร้อม WiFi และ Bluetooth ในตัว เหมาะสำหรับโปรเจค IoT', price: 259, stock: 50, categoryId: 1, isNew: true },
    { name: 'ESP8266 NodeMCU', description: 'บอร์ด ESP8266 รองรับ WiFi เหมาะสำหรับเริ่มต้นเรียนรู้ IoT', price: 159, stock: 80, categoryId: 1 },
    { name: 'Raspberry Pi 5 8GB', description: 'Single-board computer รุ่นล่าสุด ประสิทธิภาพสูง', price: 3290, stock: 15, categoryId: 1, isNew: true },
    { name: 'Arduino Uno R3', description: 'บอร์ด Arduino ยอดนิยม เหมาะสำหรับผู้เริ่มต้น', price: 299, stock: 100, categoryId: 1 },
    { name: 'DHT22 Temperature Sensor', description: 'เซ็นเซอร์วัดอุณหภูมิและความชื้น ความแม่นยำสูง', price: 89, stock: 200, categoryId: 2 },
    { name: 'DHT11 Temperature Sensor', description: 'เซ็นเซอร์วัดอุณหภูมิและความชื้น ราคาประหยัด', price: 39, stock: 300, categoryId: 2 },
    { name: 'HC-SR04 Ultrasonic Sensor', description: 'เซ็นเซอร์วัดระยะทางด้วยคลื่นอัลตราโซนิก', price: 49, stock: 150, categoryId: 2 },
    { name: 'PIR Motion Sensor', description: 'เซ็นเซอร์ตรวจจับการเคลื่อนไหว', price: 45, stock: 180, categoryId: 2 },
    { name: 'OLED Display 0.96"', description: 'จอ OLED ขนาด 0.96 นิ้ว I2C 128x64 pixels', price: 99, stock: 120, categoryId: 3 },
    { name: 'OLED Display 1.3"', description: 'จอ OLED ขนาด 1.3 นิ้ว I2C 128x64 pixels', price: 159, stock: 80, categoryId: 3 },
    { name: 'LCD 16x2 with I2C', description: 'จอ LCD 16x2 พร้อมโมดูล I2C ใช้งานง่าย', price: 89, stock: 100, categoryId: 3 },
    { name: 'TFT Display 2.4"', description: 'จอ TFT สี ขนาด 2.4 นิ้ว รองรับ Touch', price: 299, stock: 40, categoryId: 3 },
    { name: 'Relay Module 4 Channel', description: 'โมดูลรีเลย์ 4 ช่อง ควบคุมอุปกรณ์ไฟฟ้า', price: 129, stock: 90, categoryId: 4 },
    { name: 'Smart Plug WiFi', description: 'ปลั๊กไฟอัจฉริยะ ควบคุมผ่าน WiFi', price: 399, stock: 60, categoryId: 4, isNew: true },
    { name: 'IR Remote Module', description: 'โมดูลรับส่ง IR สำหรับควบคุมอุปกรณ์', price: 35, stock: 200, categoryId: 5 },
    { name: 'Bluetooth HC-05', description: 'โมดูล Bluetooth สำหรับสื่อสารไร้สาย', price: 149, stock: 70, categoryId: 5 },
    { name: 'LoRa Module SX1278', description: 'โมดูล LoRa สำหรับส่งข้อมูลระยะไกล', price: 259, stock: 35, categoryId: 5, isNew: true },
    { name: 'ESP32 Starter Kit', description: 'ชุดอุปกรณ์สำหรับเริ่มต้นเรียนรู้ IoT ครบชุด', price: 1290, stock: 25, categoryId: 6, isNew: true },
    { name: 'Arduino Starter Kit', description: 'ชุดอุปกรณ์ Arduino สำหรับผู้เริ่มต้น', price: 990, stock: 30, categoryId: 6 },
    { name: 'Sensor Kit 37 in 1', description: 'ชุดเซ็นเซอร์ 37 ชนิด สำหรับทดลอง', price: 599, stock: 45, categoryId: 6 }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { 
        id: products.indexOf(product) + 1 
      },
      update: product,
      create: product
    })
  }
  console.log('✅ Products created:', products.length)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
