<template>
  <div class="products-page">
    <!-- Header -->
    <div class="page-header">
      <h1>สินค้าทั้งหมด</h1>
      <p>อุปกรณ์ IoT คุณภาพสูงกว่า {{ productStore.pagination.total }} รายการ</p>
    </div>

    <div class="products-layout">
      <!-- Filters Sidebar -->
      <aside class="filters-sidebar glass-card">
        <div class="filter-header">
          <h3><i class="pi pi-filter"></i> ตัวกรอง</h3>
          <button @click="resetFilters" class="reset-btn">รีเซ็ต</button>
        </div>

        <!-- Search -->
        <div class="filter-group">
          <label>ค้นหา</label>
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input 
              type="text" 
              v-model="filters.search"
              class="input-field"
              placeholder="ค้นหาสินค้า..."
              @input="debounceSearch"
            >
          </div>
        </div>

        <!-- Categories -->
        <div class="filter-group">
          <label>หมวดหมู่</label>
          <div class="category-list">
            <button 
              v-for="cat in categories" 
              :key="cat.id"
              @click="filters.category = cat.id"
              :class="['category-btn', { active: filters.category === cat.id }]"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Price Range -->
        <div class="filter-group">
          <label>ช่วงราคา</label>
          <div class="price-inputs">
            <input 
              type="number" 
              v-model="filters.minPrice"
              class="input-field"
              placeholder="ต่ำสุด"
            >
            <span>-</span>
            <input 
              type="number" 
              v-model="filters.maxPrice"
              class="input-field"
              placeholder="สูงสุด"
            >
          </div>
        </div>

        <!-- Stock Filter -->
        <div class="filter-group">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="filters.inStock">
            <span>มีสินค้าพร้อมส่ง</span>
          </label>
        </div>

        <button @click="applyFilters" class="btn-primary apply-btn">
          <i class="pi pi-check"></i> ใช้ตัวกรอง
        </button>
      </aside>

      <!-- Products Grid -->
      <div class="products-main">
        <!-- Sort Bar -->
        <div class="sort-bar glass-card">
          <span>{{ productStore.pagination.total }} สินค้า</span>
          <div class="sort-options">
            <label>เรียงตาม:</label>
            <select v-model="filters.sort" @change="applyFilters" class="sort-select">
              <option value="newest">ใหม่ล่าสุด</option>
              <option value="price_asc">ราคา: ต่ำ - สูง</option>
              <option value="price_desc">ราคา: สูง - ต่ำ</option>
              <option value="name">ชื่อ A-Z</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="productStore.loading" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <p>กำลังโหลดสินค้า...</p>
        </div>

        <!-- Products Grid -->
        <div v-else-if="productStore.products.length > 0" class="product-grid">
          <router-link 
            v-for="product in productStore.products" 
            :key="product.id"
            :to="`/products/${product.id}`"
            class="product-card glass-card"
          >
            <div class="product-image">
              <img :src="product.image || 'https://placehold.co/300x300/1e293b/6366f1?text=IoT'" :alt="product.name">
              <div class="product-badges">
                <span v-if="product.isNew" class="badge badge-primary">ใหม่</span>
                <span v-if="product.stock <= 5 && product.stock > 0" class="badge badge-warning">เหลือน้อย</span>
                <span v-if="product.stock === 0" class="badge badge-danger">หมด</span>
              </div>
            </div>
            <div class="product-info">
              <span class="product-category">{{ product.category?.name }}</span>
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-footer">
                <span class="price-tag">฿{{ product.price.toLocaleString() }}</span>
                <span :class="['stock-status', stockClass(product.stock)]">
                  {{ stockText(product.stock) }}
                </span>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state glass-card">
          <i class="pi pi-inbox"></i>
          <h3>ไม่พบสินค้า</h3>
          <p>ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น</p>
          <button @click="resetFilters" class="btn-secondary">รีเซ็ตตัวกรอง</button>
        </div>

        <!-- Pagination -->
        <div v-if="productStore.pagination.totalPages > 1" class="pagination">
          <button 
            @click="changePage(productStore.pagination.page - 1)"
            :disabled="productStore.pagination.page === 1"
            class="page-btn"
          >
            <i class="pi pi-chevron-left"></i>
          </button>
          
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="changePage(page)"
            :class="['page-btn', { active: page === productStore.pagination.page }]"
          >
            {{ page }}
          </button>
          
          <button 
            @click="changePage(productStore.pagination.page + 1)"
            :disabled="productStore.pagination.page === productStore.pagination.totalPages"
            class="page-btn"
          >
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../../stores/product'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const filters = ref({
  search: '',
  category: null,
  minPrice: null,
  maxPrice: null,
  inStock: false,
  sort: 'newest',
  page: 1
})

const categories = computed(() => {
  return [
    { id: null, name: 'ทั้งหมด' },
    ...productStore.categories
  ]
})

let searchTimeout = null

const visiblePages = computed(() => {
  const total = productStore.pagination.totalPages
  const current = productStore.pagination.page
  const pages = []
  
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  
  return pages
})

onMounted(async () => {
  await productStore.fetchCategories()
  
  // Read query params
  if (route.query.category) {
    filters.value.category = parseInt(route.query.category)
  }
  if (route.query.search) {
    filters.value.search = route.query.search
  }
  
  fetchProducts()
})

watch(() => route.query, () => {
  if (route.query.category) {
    filters.value.category = parseInt(route.query.category)
  }
  fetchProducts()
})

function fetchProducts() {
  const params = {
    page: filters.value.page,
    limit: 12,
    sort: filters.value.sort
  }
  
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.category) params.category = filters.value.category
  if (filters.value.minPrice) params.minPrice = filters.value.minPrice
  if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice
  if (filters.value.inStock) params.inStock = true
  
  productStore.fetchProducts(params)
}

function debounceSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    applyFilters()
  }, 500)
}

function applyFilters() {
  filters.value.page = 1
  fetchProducts()
  
  // Update URL
  const query = {}
  if (filters.value.category) query.category = filters.value.category
  if (filters.value.search) query.search = filters.value.search
  
  router.replace({ query })
}

function resetFilters() {
  filters.value = {
    search: '',
    category: null,
    minPrice: null,
    maxPrice: null,
    inStock: false,
    sort: 'newest',
    page: 1
  }
  router.replace({ query: {} })
  fetchProducts()
}

function changePage(page) {
  if (page < 1 || page > productStore.pagination.totalPages) return
  filters.value.page = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function stockClass(stock) {
  if (stock === 0) return 'stock-out'
  if (stock <= 5) return 'stock-low'
  return 'stock-available'
}

function stockText(stock) {
  if (stock === 0) return 'หมด'
  if (stock <= 5) return `เหลือ ${stock} ชิ้น`
  return 'มีสินค้า'
}
</script>

<style scoped>
.products-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.page-header p {
  color: var(--gray);
}

.products-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

/* Filters Sidebar */
.filters-sidebar {
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 90px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filter-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.reset-btn {
  background: none;
  border: none;
  color: var(--primary-light);
  cursor: pointer;
  font-size: 14px;
}

.reset-btn:hover {
  text-decoration: underline;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group > label {
  display: block;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--light);
}

.search-wrapper {
  position: relative;
}

.search-wrapper i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
}

.search-wrapper input {
  padding-left: 44px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--light);
  padding: 10px 14px;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-btn.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--primary);
  color: var(--primary-light);
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-inputs input {
  width: 100%;
}

.price-inputs span {
  color: var(--gray);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--light);
}

.checkbox-wrapper input {
  accent-color: var(--primary);
}

.apply-btn {
  width: 100%;
}

/* Products Main */
.products-main {
  min-height: 600px;
}

.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.sort-bar span {
  color: var(--gray);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-options label {
  color: var(--gray);
  font-size: 14px;
}

.sort-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--light);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  color: var(--gray);
}

.loading-state i {
  font-size: 48px;
  color: var(--primary);
  margin-bottom: 16px;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.product-card {
  text-decoration: none;
  color: var(--light);
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

.product-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
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
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0 12px;
  line-height: 1.4;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-status {
  font-size: 13px;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 40px;
}

.empty-state i {
  font-size: 64px;
  color: var(--gray);
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--gray);
  margin-bottom: 24px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--light);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.page-btn.active {
  background: var(--primary);
  border-color: var(--primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 992px) {
  .products-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: relative;
    top: 0;
  }
}
</style>
