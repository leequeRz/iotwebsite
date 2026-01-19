<template>
  <div class="product-detail-page">
    <!-- Loading -->
    <div v-if="productStore.loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>กำลังโหลด...</p>
    </div>

    <!-- Error -->
    <div v-else-if="productStore.error" class="error-state glass-card">
      <i class="pi pi-exclamation-triangle"></i>
      <h2>{{ productStore.error }}</h2>
      <router-link to="/products" class="btn-primary">กลับไปหน้าสินค้า</router-link>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="product-content">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <router-link to="/">หน้าหลัก</router-link>
        <i class="pi pi-chevron-right"></i>
        <router-link to="/products">สินค้า</router-link>
        <i class="pi pi-chevron-right"></i>
        <span>{{ product.name }}</span>
      </nav>

      <div class="product-layout">
        <!-- Product Images -->
        <div class="product-images glass-card">
          <div class="main-image">
            <img :src="product.image || 'https://placehold.co/600x600/1e293b/6366f1?text=IoT'" :alt="product.name">
            <div class="image-badges">
              <span v-if="product.isNew" class="badge badge-primary">ใหม่</span>
              <span v-if="product.stock <= 5 && product.stock > 0" class="badge badge-warning">เหลือน้อย</span>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <span class="product-category">{{ product.category?.name }}</span>
          <h1 class="product-name">{{ product.name }}</h1>
          
          <div class="product-rating">
            <div class="stars">
              <i v-for="i in 5" :key="i" :class="['pi', i <= 4 ? 'pi-star-fill' : 'pi-star']"></i>
            </div>
            <span>(128 รีวิว)</span>
          </div>

          <div class="product-price-section glass-card">
            <div class="price-row">
              <span class="price-label">ราคา</span>
              <span class="price-tag">฿{{ product.price.toLocaleString() }}</span>
            </div>
            <div :class="['stock-row', stockClass(product.stock)]">
              <i :class="product.stock > 0 ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
              <span>{{ stockText(product.stock) }}</span>
            </div>
          </div>

          <p class="product-description">{{ product.description }}</p>

          <!-- Quantity -->
          <div class="quantity-section">
            <label>จำนวน</label>
            <div class="quantity-control">
              <button @click="decrementQty" :disabled="quantity <= 1">
                <i class="pi pi-minus"></i>
              </button>
              <span>{{ quantity }}</span>
              <button @click="incrementQty" :disabled="quantity >= product.stock">
                <i class="pi pi-plus"></i>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="product-actions">
            <button 
              @click="handleAddToCart" 
              class="btn-primary add-cart-btn"
              :disabled="product.stock === 0 || loading"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-shopping-cart"></i>
              {{ product.stock === 0 ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า' }}
            </button>
            <button class="btn-secondary wishlist-btn">
              <i class="pi pi-heart"></i>
            </button>
          </div>

          <!-- Features -->
          <div class="product-features">
            <div class="feature-item">
              <i class="pi pi-truck"></i>
              <div>
                <strong>จัดส่งฟรี</strong>
                <span>สั่งซื้อครบ 500 บาท</span>
              </div>
            </div>
            <div class="feature-item">
              <i class="pi pi-refresh"></i>
              <div>
                <strong>เปลี่ยนได้</strong>
                <span>ภายใน 7 วัน</span>
              </div>
            </div>
            <div class="feature-item">
              <i class="pi pi-shield"></i>
              <div>
                <strong>รับประกัน</strong>
                <span>1 ปีเต็ม</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Tabs -->
      <div class="product-tabs glass-card">
        <div class="tab-headers">
          <button 
            :class="['tab-btn', { active: activeTab === 'description' }]"
            @click="activeTab = 'description'"
          >
            รายละเอียด
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'specs' }]"
            @click="activeTab = 'specs'"
          >
            สเปค
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'reviews' }]"
            @click="activeTab = 'reviews'"
          >
            รีวิว (128)
          </button>
        </div>
        <div class="tab-content">
          <div v-if="activeTab === 'description'" class="tab-panel">
            <h3>รายละเอียดสินค้า</h3>
            <p>{{ product.description }}</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          </div>
          <div v-if="activeTab === 'specs'" class="tab-panel">
            <h3>สเปคสินค้า</h3>
            <table class="specs-table">
              <tr><td>รุ่น</td><td>{{ product.name }}</td></tr>
              <tr><td>หมวดหมู่</td><td>{{ product.category?.name }}</td></tr>
              <tr><td>น้ำหนัก</td><td>50g</td></tr>
              <tr><td>ขนาด</td><td>5 x 3 x 1 cm</td></tr>
              <tr><td>แรงดันไฟฟ้า</td><td>3.3V - 5V</td></tr>
            </table>
          </div>
          <div v-if="activeTab === 'reviews'" class="tab-panel">
            <h3>รีวิวจากลูกค้า</h3>
            <div class="review-item">
              <div class="review-header">
                <strong>สมชาย ใจดี</strong>
                <div class="stars">
                  <i v-for="i in 5" :key="i" class="pi pi-star-fill"></i>
                </div>
              </div>
              <p>สินค้าดีมากครับ ส่งไว ใช้งานได้จริง แนะนำเลย!</p>
            </div>
            <div class="review-item">
              <div class="review-header">
                <strong>สมหญิง มั่นคง</strong>
                <div class="stars">
                  <i v-for="i in 4" :key="i" class="pi pi-star-fill"></i>
                  <i class="pi pi-star"></i>
                </div>
              </div>
              <p>คุณภาพดี คุ้มราคา พอใจค่ะ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useProductStore } from '../../stores/product'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const quantity = ref(1)
const activeTab = ref('description')
const loading = ref(false)

const product = computed(() => productStore.currentProduct)

onMounted(() => {
  productStore.fetchProduct(route.params.id)
})

function incrementQty() {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

function decrementQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

async function handleAddToCart() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  loading.value = true
  try {
    await cartStore.addItem(product.value.id, quantity.value)
    toast.add({
      severity: 'success',
      summary: 'เพิ่มลงตะกร้าแล้ว',
      detail: `${product.value.name} x ${quantity.value}`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'เพิ่มไม่สำเร็จ',
      detail: error.response?.data?.message || 'กรุณาลองใหม่',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

function stockClass(stock) {
  if (stock === 0) return 'stock-out'
  if (stock <= 5) return 'stock-low'
  return 'stock-available'
}

function stockText(stock) {
  if (stock === 0) return 'สินค้าหมด'
  if (stock <= 5) return `เหลือเพียง ${stock} ชิ้น`
  return `มีสินค้า ${stock} ชิ้น`
}
</script>

<style scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  text-align: center;
}

.loading-state i,
.error-state i {
  font-size: 64px;
  color: var(--primary);
  margin-bottom: 20px;
}

.error-state i {
  color: #ef4444;
}

.error-state h2 {
  margin-bottom: 24px;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-size: 14px;
}

.breadcrumb a {
  color: var(--gray);
  text-decoration: none;
}

.breadcrumb a:hover {
  color: var(--primary-light);
}

.breadcrumb i {
  font-size: 10px;
  color: var(--gray);
}

.breadcrumb span {
  color: var(--light);
}

/* Product Layout */
.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.product-images {
  padding: 20px;
}

.main-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.image-badges {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
}

/* Product Info */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-category {
  font-size: 14px;
  color: var(--primary-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.product-name {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stars {
  display: flex;
  gap: 4px;
}

.stars i {
  color: #fbbf24;
}

.product-rating span {
  color: var(--gray);
  font-size: 14px;
}

.product-price-section {
  padding: 20px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.price-label {
  color: var(--gray);
}

.price-tag {
  font-size: 32px;
}

.stock-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.product-description {
  color: var(--gray);
  line-height: 1.7;
}

/* Quantity */
.quantity-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.quantity-section label {
  font-weight: 500;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.quantity-control button {
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  color: var(--light);
  cursor: pointer;
  transition: background 0.2s ease;
}

.quantity-control button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control span {
  width: 60px;
  text-align: center;
  font-weight: 600;
  font-size: 18px;
}

/* Actions */
.product-actions {
  display: flex;
  gap: 12px;
}

.add-cart-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  font-size: 16px;
}

.add-cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wishlist-btn {
  width: 54px;
  height: 54px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wishlist-btn i {
  font-size: 20px;
}

/* Features */
.product-features {
  display: flex;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-item i {
  font-size: 24px;
  color: var(--primary);
}

.feature-item div {
  display: flex;
  flex-direction: column;
}

.feature-item strong {
  font-size: 14px;
}

.feature-item span {
  font-size: 12px;
  color: var(--gray);
}

/* Tabs */
.product-tabs {
  padding: 0;
  overflow: hidden;
}

.tab-headers {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 20px;
  background: none;
  border: none;
  color: var(--gray);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: var(--light);
}

.tab-btn.active {
  color: var(--primary-light);
  border-bottom-color: var(--primary);
}

.tab-content {
  padding: 30px;
}

.tab-panel h3 {
  font-size: 20px;
  margin-bottom: 16px;
}

.tab-panel p {
  color: var(--gray);
  line-height: 1.7;
  margin-bottom: 16px;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.specs-table td {
  padding: 12px 0;
}

.specs-table td:first-child {
  color: var(--gray);
  width: 40%;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.review-item p {
  margin: 0;
}

/* Responsive */
@media (max-width: 992px) {
  .product-layout {
    grid-template-columns: 1fr;
  }

  .product-features {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .product-name {
    font-size: 24px;
  }

  .product-actions {
    flex-direction: column;
  }

  .wishlist-btn {
    width: 100%;
    height: 50px;
  }
}
</style>
