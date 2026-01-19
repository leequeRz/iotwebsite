<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content animate-fade-in">
        <div class="hero-badge">
          <i class="pi pi-bolt"></i>
          <span>อุปกรณ์ IoT คุณภาพสูง</span>
        </div>
        <h1 class="hero-title">
          ยกระดับบ้านของคุณด้วย
          <span class="gradient-text">Smart IoT Devices</span>
        </h1>
        <p class="hero-description">
          ค้นพบอุปกรณ์ IoT ที่จะทำให้ชีวิตของคุณสะดวกสบายมากขึ้น 
          ตั้งแต่ ESP32, Raspberry Pi, เซ็นเซอร์ต่างๆ จนถึง Smart Home Devices
        </p>
        <div class="hero-actions">
          <router-link to="/products" class="btn-primary hero-btn">
            <i class="pi pi-shopping-cart"></i>
            เลือกซื้อสินค้า
          </router-link>
          <router-link to="/products?category=starter" class="btn-secondary hero-btn">
            <i class="pi pi-star"></i>
            สำหรับผู้เริ่มต้น
          </router-link>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">500+</span>
            <span class="stat-label">สินค้า</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">10K+</span>
            <span class="stat-label">ลูกค้า</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">4.9</span>
            <span class="stat-label">คะแนน</span>
          </div>
        </div>
      </div>
      <div class="hero-visual animate-float">
        <div class="hero-glow"></div>
        <div class="hero-image">
          <i class="pi pi-microchip"></i>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="section-header">
        <h2>หมวดหมู่สินค้า</h2>
        <p>เลือกชมสินค้าตามประเภทที่คุณสนใจ</p>
      </div>
      <div class="categories-grid">
        <router-link 
          v-for="category in categories" 
          :key="category.id"
          :to="`/products?category=${category.slug}`"
          class="category-card glass-card"
        >
          <div class="category-icon" :style="{ background: category.color }">
            <i :class="category.icon"></i>
          </div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.count }} สินค้า</p>
        </router-link>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-section">
      <div class="section-header">
        <h2>สินค้าแนะนำ</h2>
        <router-link to="/products" class="see-all">
          ดูทั้งหมด <i class="pi pi-arrow-right"></i>
        </router-link>
      </div>
      <div class="product-grid">
        <div 
          v-for="product in featuredProducts" 
          :key="product.id"
          class="product-card glass-card"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name">
            <div class="product-badge badge-primary" v-if="product.isNew">ใหม่</div>
          </div>
          <div class="product-info">
            <span class="product-category">{{ product.category }}</span>
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-footer">
              <span class="price-tag">฿{{ product.price.toLocaleString() }}</span>
              <button @click="handleAddToCart(product)" class="add-to-cart-btn">
                <i class="pi pi-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2>ทำไมต้องเลือกเรา</h2>
        <p>บริการที่เราภูมิใจนำเสนอ</p>
      </div>
      <div class="features-grid">
        <div class="feature-card glass-card">
          <div class="feature-icon">
            <i class="pi pi-truck"></i>
          </div>
          <h3>จัดส่งทั่วไทย</h3>
          <p>ส่งฟรีเมื่อสั่งซื้อครบ 500 บาท ส่งถึงบ้านภายใน 1-3 วัน</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">
            <i class="pi pi-verified"></i>
          </div>
          <h3>รับประกันสินค้า</h3>
          <p>สินค้าทุกชิ้นรับประกันคุณภาพ เปลี่ยนได้ภายใน 7 วัน</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">
            <i class="pi pi-headphones"></i>
          </div>
          <h3>ซัพพอร์ตตลอด 24 ชม.</h3>
          <p>ทีมงานพร้อมให้คำปรึกษาและแก้ปัญหาตลอด 24 ชั่วโมง</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">
            <i class="pi pi-book"></i>
          </div>
          <h3>คู่มือการใช้งาน</h3>
          <p>มีคู่มือและวิดีโอสอนการใช้งานสำหรับทุกสินค้า</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section glass-card">
      <div class="cta-content">
        <h2>พร้อมเริ่มต้นโปรเจค IoT ของคุณแล้วหรือยัง?</h2>
        <p>สมัครสมาชิกวันนี้ รับส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก</p>
        <router-link to="/register" class="btn-primary cta-btn">
          สมัครสมาชิกฟรี
          <i class="pi pi-arrow-right"></i>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const toast = useToast()
const cartStore = useCartStore()
const authStore = useAuthStore()

const categories = ref([
  { id: 1, name: 'Microcontrollers', slug: 'microcontrollers', icon: 'pi pi-microchip', color: 'linear-gradient(135deg, #6366f1, #8b5cf6)', count: 45 },
  { id: 2, name: 'Sensors', slug: 'sensors', icon: 'pi pi-wifi', color: 'linear-gradient(135deg, #10b981, #34d399)', count: 120 },
  { id: 3, name: 'Displays', slug: 'displays', icon: 'pi pi-desktop', color: 'linear-gradient(135deg, #f59e0b, #fbbf24)', count: 35 },
  { id: 4, name: 'Smart Home', slug: 'smart-home', icon: 'pi pi-home', color: 'linear-gradient(135deg, #ec4899, #f472b6)', count: 60 },
  { id: 5, name: 'Modules', slug: 'modules', icon: 'pi pi-th-large', color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', count: 80 },
  { id: 6, name: 'Starter Kits', slug: 'starter', icon: 'pi pi-box', color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', count: 25 }
])

const featuredProducts = ref([
  { 
    id: 1, 
    name: 'ESP32 DevKit V1', 
    description: 'บอร์ด ESP32 พร้อม WiFi และ Bluetooth',
    price: 259, 
    category: 'Microcontrollers',
    image: 'https://placehold.co/300x300/1e293b/6366f1?text=ESP32',
    isNew: true
  },
  { 
    id: 2, 
    name: 'Raspberry Pi 5 8GB', 
    description: 'Single-board computer รุ่นล่าสุด',
    price: 3290, 
    category: 'Microcontrollers',
    image: 'https://placehold.co/300x300/1e293b/10b981?text=RPi5',
    isNew: true
  },
  { 
    id: 3, 
    name: 'DHT22 Temperature Sensor', 
    description: 'เซ็นเซอร์วัดอุณหภูมิและความชื้น',
    price: 89, 
    category: 'Sensors',
    image: 'https://placehold.co/300x300/1e293b/f59e0b?text=DHT22',
    isNew: false
  },
  { 
    id: 4, 
    name: 'OLED Display 1.3"', 
    description: 'จอ OLED ขนาด 1.3 นิ้ว I2C',
    price: 159, 
    category: 'Displays',
    image: 'https://placehold.co/300x300/1e293b/ec4899?text=OLED',
    isNew: false
  }
])

async function handleAddToCart(product) {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  const success = await cartStore.addToCart(product.id)
  if (success) {
    toast.add({
      severity: 'success',
      summary: 'เพิ่มลงตะกร้าแล้ว',
      detail: product.name,
      life: 3000
    })
  }
}
</script>

<style scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  min-height: 80vh;
  padding: 40px 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary-light);
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
}

.hero-description {
  font-size: 18px;
  color: var(--gray);
  line-height: 1.7;
  margin-bottom: 32px;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.hero-stats {
  display: flex;
  gap: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-light);
}

.stat-label {
  color: var(--gray);
  font-size: 14px;
}

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(40px);
}

.hero-image {
  position: relative;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.4);
}

.hero-image i {
  font-size: 120px;
  color: white;
}

/* Section Header */
.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
}

.section-header p {
  color: var(--gray);
  font-size: 18px;
}

.section-header .see-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-light);
  text-decoration: none;
  font-weight: 500;
  transition: gap 0.3s ease;
}

.section-header .see-all:hover {
  gap: 12px;
}

.section-header:has(.see-all) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

/* Categories Section */
.categories-section {
  padding: 80px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  text-decoration: none;
  color: var(--light);
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary);
}

.category-icon {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.category-icon i {
  font-size: 28px;
  color: white;
}

.category-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.category-card p {
  color: var(--gray);
  font-size: 14px;
}

/* Featured Section */
.featured-section {
  padding: 80px 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
}

.product-info {
  padding: 20px;
}

.product-category {
  font-size: 12px;
  color: var(--primary-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  margin: 8px 0;
}

.product-description {
  color: var(--gray);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-to-cart-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

/* Features Section */
.features-section {
  padding: 80px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary);
}

.feature-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon i {
  font-size: 28px;
  color: white;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.feature-card p {
  color: var(--gray);
  font-size: 14px;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  margin: 80px 0;
  padding: 60px;
  text-align: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
}

.cta-content h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-content p {
  color: var(--gray);
  font-size: 18px;
  margin-bottom: 32px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 992px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    min-height: auto;
    padding: 60px 0;
  }

  .hero-content {
    order: 1;
  }

  .hero-visual {
    order: 0;
  }

  .hero-title {
    font-size: 40px;
  }

  .hero-description {
    max-width: none;
    margin: 0 auto 32px;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-image {
    width: 200px;
    height: 200px;
  }

  .hero-image i {
    font-size: 80px;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-btn {
    width: 100%;
    justify-content: center;
  }

  .hero-stats {
    gap: 24px;
  }

  .cta-section {
    padding: 40px 20px;
  }

  .cta-content h2 {
    font-size: 24px;
  }
}
</style>
