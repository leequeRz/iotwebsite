import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity)
    }, 0)
  })

  // Fetch cart items
  async function fetchCart() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/cart')
      items.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'โหลดตะกร้าไม่สำเร็จ'
      console.error('Fetch cart error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Add item to cart
  async function addItem(productId, quantity = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/cart', { productId, quantity })
      await fetchCart() // Refresh cart
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'เพิ่มสินค้าไม่สำเร็จ'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update item quantity
  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return
    
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/cart/${itemId}`, { quantity })
      await fetchCart() // Refresh cart
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'อัปเดตจำนวนไม่สำเร็จ'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Remove item from cart
  async function removeItem(itemId) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/cart/${itemId}`)
      items.value = items.value.filter(item => item.id !== itemId)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'ลบรายการไม่สำเร็จ'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear cart
  async function clearCart() {
    loading.value = true
    error.value = null
    try {
      await api.delete('/cart')
      items.value = []
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'ล้างตะกร้าไม่สำเร็จ'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    totalItems,
    totalPrice,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }
})
