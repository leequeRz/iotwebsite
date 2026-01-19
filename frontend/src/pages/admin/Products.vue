<template>
  <div class="admin-products">
    <div class="page-header">
      <h1><i class="pi pi-box"></i> จัดการสินค้า</h1>
      <button @click="openAddModal" class="btn-primary">
        <i class="pi pi-plus"></i> เพิ่มสินค้า
      </button>
    </div>

    <!-- Filters -->
    <div class="filters glass-card">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input type="text" v-model="search" class="input-field" placeholder="ค้นหาสินค้า...">
      </div>
      <select v-model="categoryFilter" class="input-field select-field">
        <option value="">ทุกหมวดหมู่</option>
        <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <select v-model="stockFilter" class="input-field select-field">
        <option value="">ทุกสถานะ</option>
        <option value="instock">มีสินค้า</option>
        <option value="lowstock">ใกล้หมด</option>
        <option value="outofstock">หมดสต็อก</option>
      </select>
    </div>

    <!-- Products Table -->
    <div class="products-table glass-card">
      <table>
        <thead>
          <tr>
            <th>สินค้า</th>
            <th>หมวดหมู่</th>
            <th>ราคา</th>
            <th>สต็อก</th>
            <th>สถานะ</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>
              <div class="product-cell">
                <img :src="product.image" :alt="product.name">
                <div>
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-id">ID: {{ product.id }}</span>
                </div>
              </div>
            </td>
            <td>{{ product.category?.name || product.category }}</td>
            <td>฿{{ typeof product.price === 'number' ? product.price.toLocaleString() : parseFloat(product.price).toLocaleString() }}</td>
            <td>{{ product.stock }}</td>
            <td>
              <span :class="['status-badge', stockStatus(product.stock)]">
                {{ stockLabel(product.stock) }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button @click="editProduct(product)" class="action-btn edit">
                  <i class="pi pi-pencil"></i>
                </button>
                <button @click="deleteProduct(product)" class="action-btn delete">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal glass-card">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</h3>
          <button @click="showModal = false" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="form-group">
            <label>ชื่อสินค้า</label>
            <input type="text" v-model="form.name" class="input-field" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>หมวดหมู่</label>
              <select v-model="form.categoryId" class="input-field" required>
                <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>ราคา (บาท)</label>
              <input type="number" v-model="form.price" class="input-field" min="0" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>จำนวนสต็อก</label>
              <input type="number" v-model="form.stock" class="input-field" min="0" required>
            </div>
            <div class="form-group">
              <label>รูปภาพสินค้า</label>
              <div class="image-upload-wrapper">
                <input 
                  type="file" 
                  ref="fileInput" 
                  @change="handleImageUpload" 
                  accept="image/*"
                  style="display: none"
                >
                <button type="button" @click="$refs.fileInput.click()" class="btn-upload">
                  <i class="pi pi-upload"></i>
                  {{ uploading ? 'กำลังอัปโหลด...' : 'เลือกรูป' }}
                </button>
                <img v-if="form.image" :src="form.image" class="image-preview" alt="Preview">
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>รายละเอียด</label>
            <textarea v-model="form.description" class="input-field" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="form.isActive">
              <span>เปิดขาย</span>
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-secondary">ยกเลิก</button>
            <button type="submit" class="btn-primary">{{ editingProduct ? 'บันทึก' : 'เพิ่มสินค้า' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useProductStore } from '../../stores/product'
import api from '../../services/api'

const toast = useToast()
const productStore = useProductStore()

const search = ref('')
const categoryFilter = ref('')
const stockFilter = ref('')
const showModal = ref(false)
const editingProduct = ref(null)
const uploading = ref(false)
const fileInput = ref(null)

const form = ref({
  name: '',
  categoryId: null,
  price: 0,
  stock: 0,
  image: '',
  description: '',
  isActive: true
})

onMounted(async () => {
  await productStore.fetchCategories()
  await productStore.fetchProducts()
  if (productStore.categories.length > 0) {
    form.value.categoryId = productStore.categories[0].id
  }
})

const filteredProducts = computed(() => {
  let filtered = productStore.products

  if (search.value) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(p => 
      p.categoryId === parseInt(categoryFilter.value)
    )
  }

  if (stockFilter.value === 'outofstock') {
    filtered = filtered.filter(p => p.stock === 0)
  } else if (stockFilter.value === 'lowstock') {
    filtered = filtered.filter(p => p.stock > 0 && p.stock <= 5)
  } else if (stockFilter.value === 'instock') {
    filtered = filtered.filter(p => p.stock > 5)
  }

  return filtered
})

function stockStatus(stock) {
  if (stock === 0) return 'out'
  if (stock <= 5) return 'low'
  return 'ok'
}

function stockLabel(stock) {
  if (stock === 0) return 'หมด'
  if (stock <= 5) return 'ใกล้หมด'
  return 'มีสินค้า'
}

function openAddModal() {
  editingProduct.value = null
  form.value = {
    name: '',
    categoryId: productStore.categories[0]?.id || null,
    price: 0,
    stock: 0,
    image: '',
    description: '',
    isActive: true
  }
  showModal.value = true
}

function editProduct(product) {
  editingProduct.value = product
  form.value = { 
    ...product,
    categoryId: product.category?.id || product.categoryId
  }
  showModal.value = true
}

async function saveProduct() {
  try {
    if (editingProduct.value) {
      await productStore.updateProduct(editingProduct.value.id, form.value)
      toast.add({ severity: 'success', summary: 'บันทึกสำเร็จ', life: 3000 })
    } else {
      await productStore.createProduct(form.value)
      toast.add({ severity: 'success', summary: 'เพิ่มสินค้าแล้ว', life: 3000 })
    }
    showModal.value = false
    await productStore.fetchProducts() // Refresh list
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'เกิดข้อผิดพลาด', 
      detail: error.response?.data?.message || 'ไม่สามารถบันทึกได้',
      life: 3000 
    })
  }
}

async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({ severity: 'error', summary: 'ไฟล์ไม่ถูกต้อง', detail: 'กรุณาเลือกไฟล์รูปภาพ', life: 3000 })
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.add({ severity: 'error', summary: 'ไฟล์ใหญ่เกินไป', detail: 'ขนาดไฟล์ต้องไม่เกิน 5MB', life: 3000 })
    return
  }

  try {
    uploading.value = true
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    form.value.image = `http://localhost:3000${response.data.imageUrl}`
    toast.add({ severity: 'success', summary: 'อัปโหลดสำเร็จ', life: 2000 })
  } catch (error) {
    console.error('Upload error:', error)
    toast.add({ severity: 'error', summary: 'อัปโหลดล้มเหลว', detail: error.response?.data?.message || 'เกิดข้อผิดพลาด', life: 3000 })
  } finally {
    uploading.value = false
  }
}

async function deleteProduct(product) {
  try {
    await productStore.deleteProduct(product.id)
    toast.add({ severity: 'info', summary: 'ลบสินค้าแล้ว', detail: product.name, life: 3000 })
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: 'ลบไม่สำเร็จ', 
      detail: error.response?.data?.message || 'เกิดข้อผิดพลาด',
      life: 3000 
    })
  }
}
</script>

<style scoped>
.admin-products {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
}

.page-header .btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
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
  background: rgba(255, 255, 255, 0.05);
  color: var(--light);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238b8b8b' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.select-field option {
  background: #1e293b;
  color: #f1f5f9;
  padding: 8px;
}

.select-field option:checked,
.select-field option:hover {
  background: #334155;
  color: #ffffff;
}

/* Products Table */
.products-table {
  padding: 0;
  overflow: hidden;
}

.products-table table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th,
.products-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.products-table th {
  background: rgba(255, 255, 255, 0.03);
  color: var(--gray);
  font-weight: 500;
  font-size: 13px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.product-cell img {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  object-fit: cover;
}

.product-cell .product-name {
  display: block;
  font-weight: 500;
}

.product-cell .product-id {
  font-size: 12px;
  color: var(--gray);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.ok {
  background: rgba(16, 185, 129, 0.2);
  color: var(--secondary);
}

.status-badge.low {
  background: rgba(245, 158, 11, 0.2);
  color: var(--accent);
}

.status-badge.out {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btns {
  display: flex;
  gap: 8px;
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

.action-btn.edit {
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary-light);
}

.action-btn.edit:hover {
  background: rgba(99, 102, 241, 0.3);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.3);
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
  max-width: 550px;
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

.image-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-upload {
  padding: 10px 16px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid var(--primary);
  border-radius: 8px;
  color: var(--primary-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-upload:hover {
  background: rgba(99, 102, 241, 0.3);
}

.btn-upload i {
  font-size: 16px;
}

.image-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.modal-actions button {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .select-field {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
