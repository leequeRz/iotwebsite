<template>
  <div class="cart-page">
    <div class="page-header">
      <h1><i class="pi pi-shopping-cart"></i> ตะกร้าสินค้า</h1>
    </div>

    <!-- Empty Cart -->
    <div v-if="!cartStore.loading && cartStore.items.length === 0" class="empty-cart glass-card">
      <i class="pi pi-shopping-cart"></i>
      <h2>ตะกร้าของคุณว่างเปล่า</h2>
      <p>เริ่มช้อปปิ้งเลย!</p>
      <router-link to="/products" class="btn-primary">
        <i class="pi pi-box"></i> ดูสินค้า
      </router-link>
    </div>

    <!-- Cart Content -->
    <div v-else class="cart-layout">
      <!-- Cart Items -->
      <div class="cart-items">
        <div 
          v-for="item in cartStore.items" 
          :key="item.id"
          class="cart-item glass-card"
        >
          <div class="item-image">
            <img :src="item.product.image || 'https://placehold.co/120x120/1e293b/6366f1?text=IoT'" :alt="item.product.name">
          </div>
          <div class="item-info">
            <router-link :to="`/products/${item.product.id}`" class="item-name">
              {{ item.product.name }}
            </router-link>
            <span class="item-category">{{ item.product.category?.name }}</span>
            <span class="item-price">฿{{ item.product.price.toLocaleString() }}</span>
          </div>
          <div class="item-quantity">
            <button @click="updateQty(item, item.quantity - 1)" :disabled="item.quantity <= 1">
              <i class="pi pi-minus"></i>
            </button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQty(item, item.quantity + 1)" :disabled="item.quantity >= item.product.stock">
              <i class="pi pi-plus"></i>
            </button>
          </div>
          <div class="item-total">
            <span class="total-label">รวม</span>
            <span class="total-price">฿{{ (item.product.price * item.quantity).toLocaleString() }}</span>
          </div>
          <button @click="removeItem(item)" class="remove-btn">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary glass-card">
        <h3>สรุปคำสั่งซื้อ</h3>
        
        <div class="summary-row">
          <span>จำนวนสินค้า</span>
          <span>{{ cartStore.totalItems }} ชิ้น</span>
        </div>
        
        <div class="summary-row">
          <span>ราคาสินค้า</span>
          <span>฿{{ cartStore.totalPrice.toLocaleString() }}</span>
        </div>
        
        <div class="summary-row">
          <span>ค่าจัดส่ง</span>
          <span :class="shippingFee === 0 ? 'free-shipping' : ''">
            {{ shippingFee === 0 ? 'ฟรี' : `฿${shippingFee}` }}
          </span>
        </div>

        <div v-if="cartStore.totalPrice < 500" class="shipping-note">
          <i class="pi pi-info-circle"></i>
          ซื้อเพิ่มอีก ฿{{ (500 - cartStore.totalPrice).toLocaleString() }} เพื่อส่งฟรี!
        </div>
        
        <hr>
        
        <div class="summary-row total">
          <span>ยอดรวมทั้งหมด</span>
          <span class="grand-total">฿{{ grandTotal.toLocaleString() }}</span>
        </div>

        <!-- Promo Code -->
        <div class="promo-section">
          <div class="promo-input">
            <input 
              type="text" 
              v-model="promoCode"
              class="input-field"
              placeholder="โค้ดส่วนลด"
            >
            <button @click="applyPromo" class="btn-secondary">ใช้</button>
          </div>
        </div>

        <router-link to="/checkout" class="btn-primary checkout-btn">
          <i class="pi pi-credit-card"></i>
          ดำเนินการชำระเงิน
        </router-link>

        <router-link to="/products" class="continue-shopping">
          <i class="pi pi-arrow-left"></i>
          เลือกซื้อสินค้าต่อ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useCartStore } from '../../stores/cart'

const toast = useToast()
const cartStore = useCartStore()

const promoCode = ref('')

const shippingFee = computed(() => {
  return cartStore.totalPrice >= 500 ? 0 : 50
})

const grandTotal = computed(() => {
  return cartStore.totalPrice + shippingFee.value
})

onMounted(() => {
  cartStore.fetchCart()
})

async function updateQty(item, newQty) {
  if (newQty < 1 || newQty > item.product.stock) return
  await cartStore.updateQuantity(item.id, newQty)
}

async function removeItem(item) {
  await cartStore.removeItem(item.id)
  toast.add({
    severity: 'info',
    summary: 'ลบสินค้าแล้ว',
    detail: item.product.name,
    life: 3000
  })
}

function applyPromo() {
  if (!promoCode.value) return
  toast.add({
    severity: 'warn',
    summary: 'โค้ดไม่ถูกต้อง',
    detail: 'ไม่พบโค้ดส่วนลดนี้',
    life: 3000
  })
}
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 40px;
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 80px 40px;
}

.empty-cart > i {
  font-size: 80px;
  color: var(--gray);
  margin-bottom: 24px;
}

.empty-cart h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-cart p {
  color: var(--gray);
  margin-bottom: 24px;
}

.empty-cart .btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

/* Cart Layout */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
  align-items: start;
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--light);
  text-decoration: none;
}

.item-name:hover {
  color: var(--primary-light);
}

.item-category {
  font-size: 13px;
  color: var(--gray);
}

.item-price {
  font-size: 14px;
  color: var(--primary-light);
}

.item-quantity {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.item-quantity button {
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: var(--light);
  cursor: pointer;
  transition: background 0.2s ease;
}

.item-quantity button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.item-quantity button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-quantity span {
  width: 40px;
  text-align: center;
  font-weight: 600;
}

.item-total {
  text-align: right;
}

.total-label {
  display: block;
  font-size: 12px;
  color: var(--gray);
  margin-bottom: 4px;
}

.total-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--secondary);
}

.remove-btn {
  width: 40px;
  height: 40px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Order Summary */
.order-summary {
  position: sticky;
  top: 90px;
  padding: 24px;
}

.order-summary h3 {
  font-size: 20px;
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
}

.summary-row span:first-child {
  color: var(--gray);
}

.free-shipping {
  color: var(--secondary) !important;
  font-weight: 600;
}

.shipping-note {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: var(--accent);
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  margin: 12px 0;
}

.order-summary hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 16px 0;
}

.summary-row.total {
  padding-top: 16px;
}

.summary-row.total span:first-child {
  color: var(--light);
  font-weight: 600;
}

.grand-total {
  font-size: 24px;
  font-weight: 700;
  color: var(--secondary) !important;
}

.promo-section {
  margin: 20px 0;
}

.promo-input {
  display: flex;
  gap: 10px;
}

.promo-input input {
  flex: 1;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  font-size: 16px;
  text-decoration: none;
  margin-bottom: 16px;
}

.continue-shopping {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--gray);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.continue-shopping:hover {
  color: var(--primary-light);
}

/* Responsive */
@media (max-width: 992px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: relative;
    top: 0;
  }
}

@media (max-width: 640px) {
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 16px;
  }

  .item-quantity,
  .item-total,
  .remove-btn {
    grid-column: 2;
  }

  .item-quantity {
    justify-self: start;
  }

  .item-total {
    text-align: left;
  }

  .remove-btn {
    justify-self: end;
  }
}
</style>
