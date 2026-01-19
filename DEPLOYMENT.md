# คู่มือการ Deploy โปรเจค IoT Website

โปรเจคนี้แยก deployment เป็น 2 ส่วน:
- **Frontend**: Deploy ไป Vercel
- **Backend**: Deploy ไป Render หรือ Railway

## 🚀 Deploy Frontend ไป Vercel

### วิธีที่ 1: Deploy ผ่าน Vercel Dashboard (แนะนำ)

1. **Push code ไป GitHub** (ถ้ายังไม่ได้ push)
   ```bash
   git add .
   git commit -m "Update deployment configuration"
   git push origin main
   ```

2. **Import Project ไป Vercel**
   - เข้า [Vercel Dashboard](https://vercel.com/dashboard)
   - คลิก "Add New..." → "Project"
   - เลือก GitHub repository ของคุณ
   - คลิก "Import"

3. **ตั้งค่า Project Settings**
   
   Vercel จะอ่าน `vercel.json` อัตโนมัติ แต่ตรวจสอบให้แน่ใจว่าตั้งค่าดังนี้:
   
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (ใช้ root ของ repo)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install --prefix frontend`

4. **ตั้งค่า Environment Variables**
   
   ใน Vercel Dashboard → Settings → Environment Variables เพิ่ม:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_API_URL` | `https://your-backend-url.onrender.com` | Production |
   | `VITE_API_URL` | `http://localhost:3000` | Development |

5. **Deploy!**
   - คลิก "Deploy"
   - รอ deployment เสร็จ (ประมาณ 1-2 นาที)
   - ทดสอบ website ที่ URL ที่ Vercel สร้างให้

### วิธีที่ 2: Deploy ผ่าน Vercel CLI

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd d:\githubrepo\iotwebsite
vercel

# Deploy to production
vercel --prod
```

---

## 🖥️ Deploy Backend ไป Render

### เตรียมความพร้อม

1. **ตรวจสอบ `backend/package.json`** ว่ามี build script:
   ```json
   {
     "scripts": {
       "start": "node src/index.js",
       "build": "prisma generate"
     }
   }
   ```

### Deploy บน Render

1. **สร้าง Web Service ใหม่**
   - เข้า [Render Dashboard](https://dashboard.render.com/)
   - คลิก "New +" → "Web Service"
   - เชื่อมต่อกับ GitHub repository

2. **ตั้งค่า Web Service**
   
   - **Name**: `iot-backend` (หรือชื่ออื่นที่ต้องการ)
   - **Region**: Singapore (ใกล้ที่สุดกับไทย)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: Free

3. **ตั้งค่า Environment Variables**
   
   ใน Environment Variables section เพิ่ม:
   
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=10000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
   
   > **หมายเหตุ**: `DATABASE_URL` ได้จาก Render PostgreSQL database (สร้างแยกต่างหาก)

4. **สร้าง PostgreSQL Database**
   
   - คลิก "New +" → "PostgreSQL"
   - ตั้งชื่อ database (เช่น `iot-database`)
   - เลือก Free tier
   - คัดลอก "Internal Database URL" ไปใส่ใน `DATABASE_URL`

5. **Deploy!**
   - คลิก "Create Web Service"
   - รอ deployment เสร็จ (ครั้งแรกอาจใช้เวลา 3-5 นาที)

### Seed Database (ถ้ามี seed data)

หลัง deploy สำเร็จ ให้ seed database:

```bash
# ใน Render Shell (Dashboard → Shell tab)
npx prisma db seed
```

---

## 🔗 เชื่อมต่อ Frontend กับ Backend

1. **อัพเดท Environment Variable ของ Frontend**
   
   ใน Vercel Dashboard → Settings → Environment Variables:
   - แก้ไข `VITE_API_URL` เป็น URL ของ backend บน Render
   - เช่น: `https://iot-backend.onrender.com`

2. **อัพเดท CORS ใน Backend**
   
   แก้ไขไฟล์ `backend/src/index.js`:
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:5173',
       'https://your-frontend.vercel.app'
     ],
     credentials: true
   }));
   ```

3. **Redeploy Frontend**
   - ใน Vercel Dashboard → Deployments
   - คลิก "Redeploy" บน deployment ล่าสุด

---

## ✅ ทดสอบการทำงาน

### ทดสอบ Backend
```bash
# ทดสอบ health check
curl https://your-backend.onrender.com/api/health

# ทดสอบ API
curl https://your-backend.onrender.com/api/products
```

### ทดสอบ Frontend
1. เปิด browser ไปที่ URL ของ Vercel
2. ตรวจสอบ:
   - หน้าแรกโหลดได้
   - Routing ทำงาน (กด refresh ที่ทุก route)
   - เรียก API ได้ (ดูใน Network tab)
   - Login/Register ทำงาน

---

## 🐛 Troubleshooting

### Frontend ไม่เชื่อมต่อกับ Backend

1. ตรวจสอบ `VITE_API_URL` ถูกต้องหรือไม่
2. ตรวจสอบ CORS settings ใน backend
3. ดู Console errors ใน browser DevTools

### Backend crash หลัง deploy

1. ตรวจสอบ Logs ใน Render Dashboard
2. ตรวจสอบ `DATABASE_URL` ถูกต้องหรือไม่
3. ตรวจสอบว่า Prisma migrations ทำงานหรือไม่

### Routing ไม่ทำงาน (404 on refresh)

- ตรวจสอบว่า `vercel.json` มี rewrites configuration ครบ

---

## 📝 Auto-Deploy

ทั้ง Vercel และ Render จะ auto-deploy เมื่อมี commit ใหม่บน `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

- **Vercel**: Deploy frontend อัตโนมัติ
- **Render**: Deploy backend อัตโนมัติ

---

## 💡 Tips

1. **Check Build Logs**: ถ้า deployment ล้มเหลว ให้ดู build logs ใน Dashboard
2. **Use Environment Variables**: อย่า hardcode sensitive data ในโค้ด
3. **Monitor Performance**: ใช้ Vercel Analytics และ Render Metrics
4. **Backup Database**: สำรอง database บน Render เป็นประจำ

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
