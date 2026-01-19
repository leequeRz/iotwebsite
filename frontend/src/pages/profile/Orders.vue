<template>
  <div class="orders-page">
    <div class="page-header">
      <h1><i class="pi pi-list"></i> คำสั่งซื้อของฉัน</h1>
    </div>

    <!-- Orders List -->
    <div class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card glass-card">
        <div class="order-header">
          <div class="order-id">
            <span class="label">หมายเลขคำสั่งซื้อ</span>
            <strong>#{{ order.id }}</strong>
          </div>
          <div class="order-date">
            <span class="label">วันที่สั่ง</span>
            <strong>{{ formatDate(order.createdAt) }}</strong>
          </div>
          <div :class="['order-status', `status-${order.status}`]">
            {{ statusText(order.status) }}
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.product.image || 'https://placehold.co/60x60/1e293b/6366f1?text=IoT'" :alt="item.product.name">
            <div class="item-info">
              <span class="item-name">{{ item.product.name }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
            </div>
            <span class="item-price">฿{{ (item.price * item.quantity).toLocaleString() }}</span>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            <span>ยอดรวม:</span>
            <strong>฿{{ order.total.toLocaleString() }}</strong>
          </div>
          <div class="order-actions">
            <button v-if="order.status === 'pending'" class="btn-secondary" @click="cancelOrder(order)">
              ยกเลิก
            </button>
            <button class="btn-primary" @click="viewOrder(order)">
              ดูรายละเอียด
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="orders.length === 0" class="empty-state glass-card">
        <i class="pi pi-inbox"></i>
        <h2>ยังไม่มีคำสั่งซื้อ</h2>
        <p>เริ่มช้อปปิ้งเพื่อดูคำสั่งซื้อของคุณที่นี่</p>
        <router-link to="/products" class="btn-primary">เลือกซื้อสินค้า</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '../../services/api'

const toast = useToast()

const orders = ref([])
const loading = ref(false)

onMounted(async () => {
  await fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  try {
    const response = await api.get('/orders')
    orders.value = response.data
  } catch (error) {
    console.error('Fetch orders error:', error)
    toast.add({
      severity: 'error',
      summary: 'โหลดข้อมูลไม่สำเร็จ',
      detail: 'ไม่สามารถดึงรายการคำสั่งซื้อได้',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

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

function viewOrder(order) {
  toast.add({
    severity: 'info',
    summary: `ดูคำสั่งซื้อ ${order.id}`,
    life: 2000
  })
}

async function cancelOrder(order) {
  try {
    await api.put(`/orders/${order.id}/cancel`)
    order.status = 'cancelled'
    toast.add({
      severity: 'success',
      summary: 'ยกเลิกคำสั่งซื้อแล้ว',
      life: 3000
    })
    await fetchOrders()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'ยกเลิกไม่สำเร็จ',
      detail: error.response?.data?.message || 'เกิดข้อผิดพลาด',
      life: 3000
    })
  }
}
</script>

<style scoped>
.orders-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  margin-bottom: 40px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  padding: 24px;
}

.order-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-id,
.order-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-header .label {
  font-size: 12px;
  color: var(--gray);
}

.order-status {
  margin-left: auto;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
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

.status-cancelled {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.order-item img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
}

.item-qty {
  font-size: 13px;
  color: var(--gray);
}

.item-price {
  font-weight: 600;
  color: var(--primary-light);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.order-total {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-total span {
  color: var(--gray);
}

.order-total strong {
  font-size: 20px;
  color: var(--secondary);
}

.order-actions {
  display: flex;
  gap: 10px;
}

.order-actions button {
  padding: 10px 20px;
  font-size: 14px;
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

.empty-state h2 {
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--gray);
  margin-bottom: 24px;
}

.empty-state .btn-primary {
  display: inline-flex;
  text-decoration: none;
}

/* Responsive */
@media (max-width: 640px) {
  .order-header {
    flex-wrap: wrap;
    gap: 16px;
  }

  .order-status {
    margin-left: 0;
    order: -1;
    width: 100%;
    text-align: center;
  }

  .order-footer {
    flex-direction: column;
    gap: 16px;
  }

  .order-actions {
    width: 100%;
  }

  .order-actions button {
    flex: 1;
  }
}
</style>
