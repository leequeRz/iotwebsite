# IoT Shop 🛍️

ระบบขายสินค้าและอุปกรณ์ IoT ครบวงจร พร้อมระบบจัดการสินค้า ตะกร้า คำสั่งซื้อ และแดชบอร์ดผู้ดูแลระบบ

## 🛠️ Tech Stack

**Frontend:**
- Vue 3 - Progressive JavaScript Framework
- Vite - Next Generation Frontend Tooling
- Pinia - State Management
- Vue Router - Official Router
- TailwindCSS 4 - Utility-First CSS Framework
- PrimeVue 4 - Rich UI Component Library
- Axios - HTTP Client

**Backend:**
- Node.js - JavaScript Runtime
- Express.js 5 - Web Framework
- Prisma ORM - Next-Generation ORM
- PostgreSQL - Relational Database
- JWT - Authentication
- Bcrypt - Password Hashing
- Multer - File Upload
- Zod - Schema Validation

## 📁 Project Structure

```
iotwebsite/
├── frontend/              # Vue 3 Frontend Application
│   ├── src/
│   │   ├── components/    # Reusable Components
│   │   ├── pages/         # Page Components
│   │   ├── router/        # Vue Router Configuration
│   │   ├── stores/        # Pinia Stores
│   │   ├── services/      # API Services
│   │   └── App.vue        # Root Component
│   ├── public/            # Static Assets
│   └── package.json
│
└── backend/               # Node.js API Server
    ├── src/
    │   ├── routes/        # API Routes
    │   ├── middleware/    # Express Middleware
    │   ├── utils/         # Utility Functions
    │   └── index.js       # Server Entry Point
    ├── prisma/
    │   ├── schema.prisma  # Database Schema
    │   └── seed.js        # Database Seeder
    └── package.json
```

## 🚀 Installation Guide

### Prerequisites

ก่อนเริ่มติดตั้ง ต้องมีโปรแกรมเหล่านี้ติดตั้งอยู่ในเครื่อง:

- **Node.js** 18 ขึ้นไป ([ดาวน์โหลด](https://nodejs.org/))
- **PostgreSQL** 14 ขึ้นไป ([ดาวน์โหลด](https://www.postgresql.org/download/))
- **Git** (ถ้าต้องการ clone repository)

### ตรวจสอบการติดตั้ง

```bash
node --version    # ต้องเป็น v18 ขึ้นไป
npm --version     # มากับ Node.js
psql --version    # PostgreSQL
```

### 1. Clone Repository (ถ้าจำเป็น)

```bash
git clone <repository-url>
cd iotwebsite
```

### 2. Database Setup

#### 2.1 สร้าง Database ใน PostgreSQL

```bash
# เข้าสู่ PostgreSQL
psql -U postgres

# สร้างฐานข้อมูล
CREATE DATABASE iotshop;

# ออกจาก psql
\q
```

#### 2.2 ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน backend directory:

```bash
cd backend
```

สร้างไฟล์ `.env` พร้อมเนื้อหา:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/iotshop"
ตอนนี้ใช้ url จาก Prisma Data Platform

# JWT Secret (เปลี่ยนเป็นค่าที่ซับซ้อนกว่านี้ในการใช้งานจริง)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ใช้วิธีนี้ node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Server
PORT=3000
NODE_ENV=development
```

> **หmายเหตุ:** เปลี่ยน `password` ใน DATABASE_URL เป็นรหัสผ่าน PostgreSQL ของคุณ

### 3. Backend Setup

```bash
cd backend

# ติดตั้ง dependencies
npm install

# สร้าง Prisma Client
npx prisma generate

# สร้างตารางในฐานข้อมูล
npx prisma db push

# เพิ่มข้อมูลตัวอย่าง (สินค้า, users, etc.)
npm run db:seed

# เริ่มต้น Development Server
npm run dev
```

Backend จะทำงานที่: `http://localhost:3000`

### 4. Frontend Setup

เปิด Terminal ใหม่:

```bash
cd frontend

# ติดตั้ง dependencies
npm install

# เริ่มต้น Development Server
npm run dev
```

Frontend จะทำงานที่: `http://localhost:5173`

### 5. เข้าสู่ระบบ

เปิดเบราว์เซอร์และไปที่ `http://localhost:5173`

**บัญชีทดสอบ:**

| บทบาท | Email             | รหัสผ่าน |
|--------|-------------------|----------|
| Admin  | admin@iotshop.com | admin123 |
| User   | user@iotshop.com  | user123  |

## 📘 Usage Guide

### สำหรับผู้ใช้ทั่วไป

1. **ลงทะเบียน/เข้าสู่ระบบ**
   - คลิก "เข้าสู่ระบบ" หรือ "สมัครสมาชิก"
   - กรอกข้อมูลและยืนยัน

2. **เลือกซื้อสินค้า**
   - เรียกดูสินค้าทั้งหมดในหน้าแรก
   - คลิกที่สินค้าเพื่อดูรายละเอียด
   - คลิก "เพิ่มในตะกร้า"

3. **จัดการตะกร้าสินค้า**
   - คลิกไอคอนตะกร้าที่มุมบนขวา
   - ปรับจำนวนหรือลบสินค้า
   - คลิก "ชำระเงิน" เมื่อพร้อม

4. **สั่งซื้อสินค้า**
   - กรอกที่อยู่จัดส่ง
   - ตรวจสอบรายการสินค้า
   - ยืนยันคำสั่งซื้อ

5. **ดูประวัติคำสั่งซื้อ**
   - ไปที่หน้า "คำสั่งซื้อของฉัน"
   - ดูสถานะและรายละเอียด

### สำหรับ Admin

1. **เข้าสู่ระบบด้วยบัญชี Admin**
   - Email: `admin@iotshop.com`
   - Password: `admin123`

2. **Dashboard**
   - ดูสถิติรายได้
   - ดูจำนวนคำสั่งซื้อ
   - ดูแผนที่ลูกค้า (Thailand Map)

3. **จัดการสินค้า**
   - เพิ่ม/แก้ไข/ลบสินค้า
   - อัพโหลดรูปภาพสินค้า
   - ตั้งราคาและสต๊อก

4. **จัดการคำสั่งซื้อ**
   - ดูรายการคำสั่งซื้อทั้งหมด
   - อัพเดทสถานะการจัดส่ง

## 📝 API Documentation

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | สมัครสมาชิกใหม่ | No |
| POST | `/api/auth/login` | เข้าสู่ระบบ | No |
| GET | `/api/auth/me` | ดูข้อมูลผู้ใช้ปัจจุบัน | Yes |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | รายการสินค้าทั้งหมด | No |
| GET | `/api/products/:id` | รายละเอียดสินค้า | No |
| POST | `/api/products` | เพิ่มสินค้าใหม่ | Admin |
| PUT | `/api/products/:id` | แก้ไขสินค้า | Admin |
| DELETE | `/api/products/:id` | ลบสินค้า | Admin |

### Cart

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | ดูตะกร้าสินค้า | Yes |
| POST | `/api/cart` | เพิ่มสินค้าในตะกร้า | Yes |
| PUT | `/api/cart/:id` | อัพเดทจำนวนสินค้า | Yes |
| DELETE | `/api/cart/:id` | ลบสินค้าจากตะกร้า | Yes |

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | ดูคำสั่งซื้อของฉัน | Yes |
| GET | `/api/orders/:id` | รายละเอียดคำสั่งซื้อ | Yes |
| POST | `/api/orders` | สร้างคำสั่งซื้อใหม่ | Yes |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats` | สถิติ Dashboard | Admin |
| GET | `/api/admin/customer-locations` | ข้อมูลแผนที่ลูกค้า | Admin |
| GET | `/api/admin/orders` | รายการคำสั่งซื้อทั้งหมด | Admin |

## ✨ Features

### ฟีเจอร์หลัก

- 🛒 **ระบบ E-commerce ครบวงจร**
  - เลือกดูและซื้อสินค้า
  - ระบบตะกร้าสินค้า
  - ระบบสั่งซื้อและชำระเงิน

- 👤 **ระบบสมาชิก**
  - ลงทะเบียนและเข้าสู่ระบบ
  - JWT Authentication
  - บทบาท User และ Admin

- 👨‍💼 **Admin Dashboard**
  - สถิติยอดขายและรายได้
  - จัดการสินค้า (CRUD)
  - จัดการคำสั่งซื้อ
  - แผนที่ลูกค้า (Thailand Map)

- 📍 **Customer Analytics**
  - แสดงตำแหน่งลูกค้าบนแผนที่
  - วิเคราะห์พื้นที่ที่มียอดขายสูง

- 📱 **Responsive Design**
  - รองรับทุกขนาดหน้าจอ
  - Mobile-friendly
  - Modern UI ด้วย TailwindCSS และ PrimeVue

## 🔧 Development

### Backend Scripts

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Database commands
npm run db:push     # อัพเดทฐานข้อมูลตาม schema
npm run db:seed     # เพิ่มข้อมูลตัวอย่าง
npm run db:studio   # เปิด Prisma Studio GUI
```

### Frontend Scripts

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Management

```bash
# ดู database schema ด้วย Prisma Studio
cd backend
npx prisma studio
```

Prisma Studio จะเปิดที่: `http://localhost:5555`

## 🐛 Troubleshooting

### Backend ไม่ติดต่อกับ Database ได้

**ปัญหา:** `Error: P1001: Can't reach database server`

**วิธีแก้:**
1. ตรวจสอบว่า PostgreSQL รันอยู่
2. ตรวจสอบ DATABASE_URL ใน `.env`
3. ลองรัน: `psql -U postgres -c "SELECT 1"`

### Frontend เรียก API ไม่ได้

**ปัญหา:** `Network Error` หรือ `CORS Error`

**วิธีแก้:**
1. ตรวจสอบว่า Backend รันอยู่ที่ port 3000
2. ตรวจสอบ API URL ใน `frontend/src/services/api.js`
3. ตรวจสอบ CORS settings ใน `backend/src/index.js`

### npm install ล้มเหลว

**ปัญหา:** `Error: EACCES` หรือ `permission denied`

**วิธีแก้:**
```bash
# ลบ node_modules และ package-lock.json
rm -rf node_modules package-lock.json

# ลบ npm cache
npm cache clean --force

# ติดตั้งใหม่
npm install
```

### Port ถูกใช้งานอยู่แล้ว

**ปัญหา:** `Error: listen EADDRINUSE: address already in use :::3000`

**วิธีแก้:**

**Windows:**
```bash
# หา PID ที่ใช้ port
netstat -ano | findstr :3000

# Kill process (แทน PID ด้วยตัวเลขที่ได้)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# หาและ kill process
lsof -ti:3000 | xargs kill -9
```

## 📄 License

ISC

## 👥 Author

IoT Shop Development Team

---

**หมายเหตุ:** โปรเจคนี้สร้างขึ้นเพื่อการศึกษาและพัฒนา หากนำไปใช้งานจริง ควรเปลี่ยน JWT_SECRET และข้อมูลสำคัญอื่นๆ
