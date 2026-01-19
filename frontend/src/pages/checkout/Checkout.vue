<template>
  <div class="checkout-page">
    <div class="page-header">
      <h1><i class="pi pi-credit-card"></i> ชำระเงิน</h1>
    </div>

    <div class="checkout-layout">
      <!-- Checkout Form -->
      <div class="checkout-form">
        <!-- Shipping Address -->
        <div class="checkout-section glass-card">
          <h3><i class="pi pi-map-marker"></i> ที่อยู่จัดส่ง</h3>
          
          <div v-if="addresses.length > 0" class="address-list">
            <div 
              v-for="addr in addresses" 
              :key="addr.id"
              :class="['address-card', { selected: selectedAddress === addr.id }]"
              @click="selectedAddress = addr.id"
            >
              <div class="address-radio">
                <div class="radio-dot"></div>
              </div>
              <div class="address-info">
                <strong>{{ addr.label }}</strong>
                <p>{{ addr.fullAddress }}</p>
                <p>{{ addr.district }}, {{ addr.province }} {{ addr.postalCode }}</p>
              </div>
              <span v-if="addr.isDefault" class="default-badge">ค่าเริ่มต้น</span>
            </div>
          </div>

          <button @click="showAddressModal = true" class="btn-secondary add-address-btn">
            <i class="pi pi-plus"></i> เพิ่มที่อยู่ใหม่
          </button>
        </div>

        <!-- Payment Method -->
        <div class="checkout-section glass-card">
          <h3><i class="pi pi-wallet"></i> วิธีการชำระเงิน</h3>
          
          <div class="payment-methods">
            <div 
              :class="['payment-option', { selected: paymentMethod === 'promptpay' }]"
              @click="paymentMethod = 'promptpay'"
            >
              <div class="payment-radio">
                <div class="radio-dot"></div>
              </div>
              <div class="payment-icon promptpay">
                <i class="pi pi-qrcode"></i>
              </div>
              <div class="payment-info">
                <strong>PromptPay QR</strong>
                <span>สแกนจ่ายผ่าน Mobile Banking</span>
              </div>
            </div>

            <div 
              :class="['payment-option', { selected: paymentMethod === 'credit' }]"
              @click="paymentMethod = 'credit'"
            >
              <div class="payment-radio">
                <div class="radio-dot"></div>
              </div>
              <div class="payment-icon credit">
                <i class="pi pi-credit-card"></i>
              </div>
              <div class="payment-info">
                <strong>บัตรเครดิต/เดบิต</strong>
                <span>Visa, Mastercard, JCB</span>
              </div>
            </div>

            <div 
              :class="['payment-option', { selected: paymentMethod === 'cod' }]"
              @click="paymentMethod = 'cod'"
            >
              <div class="payment-radio">
                <div class="radio-dot"></div>
              </div>
              <div class="payment-icon cod">
                <i class="pi pi-money-bill"></i>
              </div>
              <div class="payment-info">
                <strong>เก็บเงินปลายทาง</strong>
                <span>ชำระเมื่อได้รับสินค้า (+฿30)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Note -->
        <div class="checkout-section glass-card">
          <h3><i class="pi pi-comment"></i> หมายเหตุ</h3>
          <textarea 
            v-model="orderNote"
            class="input-field note-input"
            placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary glass-card">
        <h3>รายการสั่งซื้อ</h3>

        <div class="order-items">
          <div v-for="item in cartStore.items" :key="item.id" class="order-item">
            <img :src="item.product.image || 'https://placehold.co/60x60/1e293b/6366f1?text=IoT'" :alt="item.product.name">
            <div class="order-item-info">
              <span class="item-name">{{ item.product.name }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
            </div>
            <span class="item-subtotal">฿{{ (item.product.price * item.quantity).toLocaleString() }}</span>
          </div>
        </div>

        <hr>

        <div class="summary-row">
          <span>ราคาสินค้า</span>
          <span>฿{{ cartStore.totalPrice.toLocaleString() }}</span>
        </div>
        <div class="summary-row">
          <span>ค่าจัดส่ง</span>
          <span :class="shippingFee === 0 ? 'free' : ''">
            {{ shippingFee === 0 ? 'ฟรี' : `฿${shippingFee}` }}
          </span>
        </div>
        <div v-if="paymentMethod === 'cod'" class="summary-row">
          <span>ค่าเก็บเงินปลายทาง</span>
          <span>฿30</span>
        </div>

        <hr>

        <div class="summary-row total">
          <span>ยอดรวมทั้งหมด</span>
          <span class="grand-total">฿{{ grandTotal.toLocaleString() }}</span>
        </div>

        <button 
          @click="placeOrder" 
          class="btn-primary place-order-btn"
          :disabled="!selectedAddress || loading"
        >
          <i v-if="loading" class="pi pi-spin pi-spinner"></i>
          <span v-else>ยืนยันการสั่งซื้อ</span>
        </button>

        <p class="terms-note">
          เมื่อกดสั่งซื้อ ถือว่าคุณยอมรับ <a href="#">ข้อกำหนดการใช้งาน</a>
        </p>
      </div>
    </div>

    <!-- Add Address Modal -->
    <div v-if="showAddressModal" class="modal-overlay" @click.self="showAddressModal = false">
      <div class="modal glass-card">
        <div class="modal-header">
          <h3>เพิ่มที่อยู่ใหม่</h3>
          <button @click="showAddressModal = false" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="addAddress" class="modal-form">
          <div class="form-group">
            <label>ชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)</label>
            <input type="text" v-model="newAddress.label" class="input-field" required>
          </div>
          <div class="form-group">
            <label>ที่อยู่</label>
            <textarea v-model="newAddress.fullAddress" class="input-field" rows="2" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>แขวง/ตำบล</label>
              <input type="text" v-model="newAddress.district" class="input-field" required>
            </div>
            <div class="form-group">
              <label>เขต/อำเภอ</label>
              <input type="text" v-model="newAddress.subDistrict" class="input-field" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>จังหวัด</label>
              <input type="text" v-model="newAddress.province" class="input-field" required>
            </div>
            <div class="form-group">
              <label>รหัสไปรษณีย์</label>
              <input type="text" v-model="newAddress.postalCode" class="input-field" pattern="[0-9]{5}" required>
            </div>
          </div>
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="newAddress.isDefault">
            <span>ตั้งเป็นที่อยู่เริ่มต้น</span>
          </label>
          <button type="submit" class="btn-primary">บันทึกที่อยู่</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useCartStore } from '../../stores/cart'
import api from '../../services/api'

const router = useRouter()
const toast = useToast()
const cartStore = useCartStore()

const addresses = ref([])
const selectedAddress = ref(null)
const paymentMethod = ref('promptpay')
const orderNote = ref('')
const loading = ref(false)
const showAddressModal = ref(false)

const newAddress = ref({
  label: '',
  fullAddress: '',
  district: '',
  subDistrict: '',
  province: '',
  postalCode: '',
  isDefault: false
})

const shippingFee = computed(() => {
  return cartStore.totalPrice >= 500 ? 0 : 50
})

const grandTotal = computed(() => {
  let total = cartStore.totalPrice + shippingFee.value
  if (paymentMethod.value === 'cod') total += 30
  return total
})

onMounted(async () => {
  if (cartStore.items.length === 0) {
    await cartStore.fetchCart()
  }
  await fetchAddresses()
})

async function fetchAddresses() {
  try {
    const response = await api.get('/addresses')
    addresses.value = response.data
    
    // Auto-select default address
    const defaultAddr = addresses.value.find(a => a.isDefault)
    if (defaultAddr) {
      selectedAddress.value = defaultAddr.id
    } else if (addresses.value.length > 0) {
      selectedAddress.value = addresses.value[0].id
    }
  } catch (error) {
    console.error('Fetch addresses error:', error)
  }
}

async function addAddress() {
  try {
    const response = await api.post('/addresses', newAddress.value)
    addresses.value.push(response.data)
    selectedAddress.value = response.data.id
    showAddressModal.value = false
    
    newAddress.value = {
      label: '',
      fullAddress: '',
      district: '',
      subDistrict: '',
      province: '',
      postalCode: '',
      isDefault: false
    }
    
    toast.add({
      severity: 'success',
      summary: 'เพิ่มที่อยู่แล้ว',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'เพิ่มที่อยู่ไม่สำเร็จ',
      detail: error.response?.data?.message || 'เกิดข้อผิดพลาด',
      life: 3000
    })
  }
}

async function placeOrder() {
  if (!selectedAddress.value) {
    toast.add({
      severity: 'warn',
      summary: 'กรุณาเลือกที่อยู่จัดส่ง',
      life: 3000
    })
    return
  }

  loading.value = true

  try {
    await api.post('/orders', {
      addressId: selectedAddress.value,
      paymentMethod: paymentMethod.value,
      notes: orderNote.value || null
    })
    
    toast.add({
      severity: 'success',
      summary: 'สั่งซื้อสำเร็จ!',
      detail: 'ขอบคุณสำหรับการสั่งซื้อ',
      life: 5000
    })

    router.push('/orders')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'เกิดข้อผิดพลาด',
      detail: error.response?.data?.message || 'ไม่สามารถสั่งซื้อได้ กรุณาลองใหม่',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
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

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  align-items: start;
}

/* Checkout Sections */
.checkout-section {
  padding: 24px;
  margin-bottom: 24px;
}

.checkout-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  margin-bottom: 20px;
}

.checkout-section h3 i {
  color: var(--primary);
}

/* Address List */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.address-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.address-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
}

.address-card.selected {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.address-radio {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.address-card.selected .address-radio {
  border-color: var(--primary);
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.address-card.selected .radio-dot {
  opacity: 1;
}

.address-info {
  flex: 1;
}

.address-info strong {
  display: block;
  margin-bottom: 4px;
}

.address-info p {
  color: var(--gray);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.default-badge {
  background: rgba(16, 185, 129, 0.2);
  color: var(--secondary);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.add-address-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Payment Methods */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  border-color: rgba(99, 102, 241, 0.3);
}

.payment-option.selected {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.payment-radio {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-option.selected .payment-radio {
  border-color: var(--primary);
}

.payment-option.selected .radio-dot {
  opacity: 1;
}

.payment-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-icon i {
  font-size: 24px;
  color: white;
}

.payment-icon.promptpay {
  background: linear-gradient(135deg, #003d7d, #0066cc);
}

.payment-icon.credit {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.payment-icon.cod {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.payment-info {
  display: flex;
  flex-direction: column;
}

.payment-info span {
  font-size: 13px;
  color: var(--gray);
}

/* Note Input */
.note-input {
  resize: vertical;
  min-height: 80px;
}

/* Order Summary */
.order-summary {
  position: sticky;
  top: 90px;
  padding: 24px;
}

.order-summary h3 {
  font-size: 20px;
  margin-bottom: 20px;
}

.order-items {
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.order-item img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.order-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.order-item-info .item-name {
  font-size: 14px;
  font-weight: 500;
}

.order-item-info .item-qty {
  font-size: 13px;
  color: var(--gray);
}

.item-subtotal {
  font-weight: 600;
}

.order-summary hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 16px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-row span:first-child {
  color: var(--gray);
}

.summary-row .free {
  color: var(--secondary);
  font-weight: 600;
}

.summary-row.total span:first-child {
  color: var(--light);
  font-weight: 600;
}

.grand-total {
  font-size: 24px;
  font-weight: 700;
  color: var(--secondary);
}

.place-order-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  margin-top: 20px;
}

.place-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.terms-note {
  text-align: center;
  font-size: 12px;
  color: var(--gray);
  margin-top: 16px;
}

.terms-note a {
  color: var(--primary-light);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 20px;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: var(--light);
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-wrapper input {
  accent-color: var(--primary);
}

/* Responsive */
@media (max-width: 992px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: relative;
    top: 0;
  }
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
