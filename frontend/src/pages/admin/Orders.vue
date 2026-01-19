<template>
  <div class="admin-orders">
    <div class="page-header">
      <h1><i class="pi pi-list"></i> จัดการคำสั่งซื้อ</h1>
    </div>

    <!-- Stats -->
    <div class="order-stats">
      <div class="stat-item glass-card" v-for="stat in orderStats" :key="stat.status">
        <span class="stat-count">{{ stat.count }}</span>
        <span class="stat-label">{{ stat.label }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters glass-card">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input type="text" v-model="search" class="input-field" placeholder="ค้นหารหัสหรือชื่อลูกค้า...">
      </div>
      <select v-model="statusFilter" class="input-field select-field">
        <option value="">ทุกสถานะ</option>
        <option value="pending">รอดำเนินการ</option>
        <option value="confirmed">ยืนยันแล้ว</option>
        <option value="shipping">กำลังจัดส่ง</option>
        <option value="delivered">จัดส่งแล้ว</option>
        <option value="cancelled">ยกเลิก</option>
      </select>
    </div>

    <!-- Orders Table -->
    <div class="orders-table glass-card">
      <table>
        <thead>
          <tr>
            <th>รหัส</th>
            <th>ลูกค้า</th>
            <th>สินค้า</th>
            <th>ยอดรวม</th>
            <th>วันที่</th>
            <th>สถานะ</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td><strong>#{{ order.id }}</strong></td>
            <td>{{ order.customer }}</td>
            <td>{{ order.itemCount }} รายการ</td>
            <td>฿{{ order.total.toLocaleString() }}</td>
            <td>{{ formatDate(order.date) }}</td>
            <td>
              <select 
                v-model="order.status" 
                @change="updateStatus(order)"
                :class="['status-select', `status-${order.status}`]"
              >
                <option value="pending">รอดำเนินการ</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="shipping">กำลังจัดส่ง</option>
                <option value="delivered">จัดส่งแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </td>
            <td>
              <button @click="viewOrder(order)" class="action-btn view">
                <i class="pi pi-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '../../services/api'

const toast = useToast()

const orders = ref([])
const loading = ref(false)
const statusFilter = ref('')
const search = ref('')

const statusOptions = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'shipping', label: 'กำลังจัดส่ง' },
  { value: 'delivered', label: 'จัดส่งแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' }
]

onMounted(async () => {
  await fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  try {
    const response = await api.get('/admin/orders')
    orders.value = response.data
  } catch (error) {
    console.error('Fetch orders error:', error)
    toast.add({
      severity: 'error',
      summary: 'โหลดข้อมูลไม่สำเร็จ',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  let filtered = orders.value

  if (statusFilter.value) {
    filtered = filtered.filter(o => o.status === statusFilter.value)
  }

  if (search.value) {
    filtered = filtered.filter(o => 
      o.id.toString().includes(search.value) ||
      o.user?.name?.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  return filtered
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

async function updateOrderStatus(order, newStatus) {
  try {
    await api.put(`/admin/orders/${order.id}/status`, { status: newStatus })
    order.status = newStatus
    toast.add({
      severity: 'success',
      summary: 'อัปเดตสถานะแล้ว',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'อัปเดตไม่สำเร็จ',
      detail: error.response?.data?.message || 'เกิดข้อผิดพลาด',
      life: 3000
    })
  }
}

function viewOrder(order) {
  toast.add({
    severity: 'info',
    summary: `ดูคำสั่งซื้อ ${order.id}`,
    life: 2000
  })
}
</script>

<style scoped>
.admin-orders {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  margin-bottom: 30px;
}

/* Stats */
.order-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  padding: 20px;
  text-align: center;
}

.stat-count {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-light);
}

.stat-label {
  font-size: 14px;
  color: var(--gray);
}

/* Filters */
.filters {
  display: flex;
  gap: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
}

.search-box input {
  padding-left: 44px;
}

.select-field {
  width: 200px;
  cursor: pointer;
}

/* Orders Table */
.orders-table {
  padding: 0;
  overflow: hidden;
}

.orders-table table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.orders-table th {
  background: rgba(255, 255, 255, 0.03);
  color: var(--gray);
  font-weight: 500;
  font-size: 13px;
}

.status-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.status-select.status-pending {
  background: rgba(245, 158, 11, 0.2);
  color: var(--accent);
}

.status-select.status-confirmed {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.status-select.status-shipping {
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary-light);
}

.status-select.status-delivered {
  background: rgba(16, 185, 129, 0.2);
  color: var(--secondary);
}

.status-select.status-cancelled {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn.view {
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary-light);
}

.action-btn.view:hover {
  background: rgba(99, 102, 241, 0.3);
}

/* Responsive */
@media (max-width: 992px) {
  .order-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .select-field {
    width: 100%;
  }

  .order-stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
