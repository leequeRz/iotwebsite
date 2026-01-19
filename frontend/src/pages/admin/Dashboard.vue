<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h1><i class="pi pi-th-large"></i> Admin Dashboard</h1>
      <span class="welcome-text">ยินดีต้อนรับ, {{ authStore.user?.name }}</span>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon sales">
          <i class="pi pi-dollar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">ยอดขายวันนี้</span>
          <span class="stat-value">฿{{ stats.todaySales.toLocaleString() }}</span>
          <span class="stat-change positive">+12.5%</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon orders">
          <i class="pi pi-shopping-cart"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">คำสั่งซื้อใหม่</span>
          <span class="stat-value">{{ stats.newOrders }}</span>
          <span class="stat-change positive">+8.2%</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon products">
          <i class="pi pi-box"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">สินค้าทั้งหมด</span>
          <span class="stat-value">{{ stats.totalProducts }}</span>
          <span class="stat-change">{{ stats.lowStock }} ใกล้หมด</span>
        </div>
      </div>

      <div class="stat-card glass-card">
        <div class="stat-icon users">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">ลูกค้าทั้งหมด</span>
          <span class="stat-value">{{ stats.totalUsers.toLocaleString() }}</span>
          <span class="stat-change positive">+{{ stats.newUsers }} วันนี้</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Recent Orders -->
      <div class="dashboard-card glass-card">
        <div class="card-header">
          <h3><i class="pi pi-list"></i> คำสั่งซื้อล่าสุด</h3>
          <router-link to="/admin/orders" class="view-all">ดูทั้งหมด</router-link>
        </div>
        <div class="orders-table">
          <table>
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ลูกค้า</th>
                <th>ยอด</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td>#{{ order.id }}</td>
                <td>{{ order.customer }}</td>
                <td>฿{{ order.total.toLocaleString() }}</td>
                <td>
                  <span :class="['status-badge', `status-${order.status}`]">
                    {{ statusText(order.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Products -->
      <div class="dashboard-card glass-card">
        <div class="card-header">
          <h3><i class="pi pi-star"></i> สินค้าขายดี</h3>
          <router-link to="/admin/products" class="view-all">ดูทั้งหมด</router-link>
        </div>
        <div class="top-products">
          <div v-for="(product, index) in topProducts" :key="product.id" class="product-row">
            <span class="rank">{{ index + 1 }}</span>
            <img :src="product.image" :alt="product.name">
            <div class="product-info">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-sales">ขายไป {{ product.sold }} ชิ้น</span>
            </div>
            <span class="product-revenue">฿{{ product.revenue.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions glass-card">
      <h3>Quick Actions</h3>
      <div class="actions-grid">
        <router-link to="/admin/products" class="action-btn">
          <i class="pi pi-plus"></i>
          <span>เพิ่มสินค้า</span>
        </router-link>
        <router-link to="/admin/orders" class="action-btn">
          <i class="pi pi-list"></i>
          <span>จัดการคำสั่งซื้อ</span>
        </router-link>
        <router-link to="/admin/customers" class="action-btn">
          <i class="pi pi-map"></i>
          <span>แผนที่ลูกค้า</span>
        </router-link>
        <button class="action-btn" @click="exportReport">
          <i class="pi pi-download"></i>
          <span>Export Report</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const stats = ref({
  totalSales: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  lowStock: 0, // Added to match template usage
  newUsers: 0 // Added to match template usage
})

const recentOrders = ref([])
const topProducts = ref([])
const loading = ref(false)

onMounted(async () => {
  await Promise.all([
    fetchDashboardStats(),
    fetchRecentOrders(),
    fetchTopProducts()
  ])
})

async function fetchDashboardStats() {
  try {
    const response = await api.get('/admin/dashboard/stats') // Assuming a specific endpoint for stats
    stats.value = response.data
  } catch (error) {
    console.error('Fetch stats error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load dashboard stats.',
      life: 3000
    })
  }
}

async function fetchRecentOrders() {
  try {
    const response = await api.get('/admin/orders')
    // Get last 5 orders
    recentOrders.value = response.data.slice(0, 5)
  } catch (error) {
    console.error('Fetch orders error:', error)
    recentOrders.value = []
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load recent orders.',
      life: 3000
    })
  }
}

async function fetchTopProducts() {
  try {
    const response = await api.get('/admin/products/top-selling') // Assuming a specific endpoint for top products
    topProducts.value = response.data.slice(0, 5)
  } catch (error) {
    console.error('Fetch top products error:', error)
    topProducts.value = []
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load top products.',
      life: 3000
    })
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('th-TH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function statusClass(status) {
  const map = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    shipping: 'status-shipping',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  }
  return map[status] || ''
}

function statusText(status) {
  const map = {
    pending: 'รอดำเนินการ',
    confirmed: 'ยืนยันแล้ว',
    shipping: 'กำลังจัดส่ง',
    delivered: 'จัดส่งแล้ว',
    cancelled: 'ยกเลิก'
  }
  return map[status] || status
}

function exportReport() {
  toast.add({
    severity: 'success',
    summary: 'Export สำเร็จ',
    detail: 'ดาวน์โหลดไฟล์รายงานแล้ว',
    life: 3000
  })
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
}

.welcome-text {
  color: var(--gray);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 24px;
  color: white;
}

.stat-icon.sales {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.stat-icon.products {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.stat-icon.users {
  background: linear-gradient(135deg, #ec4899, #f472b6);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  color: var(--gray);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-change {
  font-size: 13px;
  color: var(--gray);
}

.stat-change.positive {
  color: var(--secondary);
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.dashboard-card {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
}

.card-header h3 i {
  color: var(--primary);
}

.view-all {
  color: var(--primary-light);
  text-decoration: none;
  font-size: 14px;
}

.view-all:hover {
  text-decoration: underline;
}

/* Orders Table */
.orders-table {
  overflow-x: auto;
}

.orders-table table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.orders-table th {
  color: var(--gray);
  font-weight: 500;
  font-size: 13px;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: rgba(245, 158, 11, 0.2);
  color: var(--accent);
}

.status-confirmed {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.status-shipping {
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary-light);
}

.status-delivered {
  background: rgba(16, 185, 129, 0.2);
  color: var(--secondary);
}

/* Top Products */
.top-products {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.rank {
  width: 24px;
  height: 24px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.product-row img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.product-row .product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-row .product-name {
  font-weight: 500;
  font-size: 14px;
}

.product-row .product-sales {
  font-size: 12px;
  color: var(--gray);
}

.product-revenue {
  font-weight: 600;
  color: var(--secondary);
}

/* Quick Actions */
.quick-actions {
  padding: 24px;
}

.quick-actions h3 {
  font-size: 18px;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--light);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
}

.action-btn i {
  font-size: 24px;
  color: var(--primary);
}

.action-btn span {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
