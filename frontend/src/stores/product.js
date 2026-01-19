import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const categories = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Fetch all products with filters
  async function fetchProducts(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 12,
        category: filters.category,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock,
        sort: filters.sort || 'newest'
      }
      
      const response = await api.get('/products', { params })
      products.value = response.data.products
      pagination.value = response.data.pagination
      return response.data.products
    } catch (err) {
      error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดสินค้า'
      console.error('Fetch products error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch single product
  async function fetchProduct(id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/products/${id}`)
      currentProduct.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'ไม่พบสินค้า'
      console.error('Fetch product error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Fetch categories
  async function fetchCategories() {
    try {
      const response = await api.get('/categories')
      categories.value = response.data
      return response.data
    } catch (err) {
      console.error('Fetch categories error:', err)
      return []
    }
  }

  // Admin: Create product
  async function createProduct(productData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/products', productData)
      products.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'เพิ่มสินค้าไม่สำเร็จ'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Admin: Update product
  async function updateProduct(id, productData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/products/${id}`, productData)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'อัปเดตสินค้าไม่สำเร็จ'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Admin: Delete product
  async function deleteProduct(id) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'ลบสินค้าไม่สำเร็จ'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    categories,
    currentProduct,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchProduct,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
