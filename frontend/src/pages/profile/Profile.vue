<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>โปรไฟล์ของฉัน</h1>
    </div>

    <div class="profile-layout">
      <!-- Sidebar -->
      <aside class="profile-sidebar glass-card">
        <div class="user-avatar">
          <i class="pi pi-user"></i>
        </div>
        <h3>{{ authStore.user?.name }}</h3>
        <p>{{ authStore.user?.email }}</p>
        
        <nav class="profile-nav">
          <router-link to="/profile" class="nav-item" exact-active-class="active">
            <i class="pi pi-user"></i> ข้อมูลส่วนตัว
          </router-link>
          <router-link to="/orders" class="nav-item" exact-active-class="active">
            <i class="pi pi-list"></i> คำสั่งซื้อ
          </router-link>
          <router-link to="/profile/addresses" class="nav-item">
            <i class="pi pi-map-marker"></i> ที่อยู่
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="profile-content glass-card">
        <h2>ข้อมูลส่วนตัว</h2>
        
        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-row">
            <div class="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input type="text" v-model="form.name" class="input-field" required>
            </div>
            <div class="form-group">
              <label>อีเมล</label>
              <input type="email" v-model="form.email" class="input-field" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input type="tel" v-model="form.phone" class="input-field">
            </div>
            <div class="form-group">
              <label>วันเกิด</label>
              <input type="date" v-model="form.birthDate" class="input-field">
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading">
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <span v-else>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>

        <hr>

        <h3>เปลี่ยนรหัสผ่าน</h3>
        <form @submit.prevent="changePassword" class="password-form">
          <div class="form-group">
            <label>รหัสผ่านปัจจุบัน</label>
            <input type="password" v-model="passwordForm.current" class="input-field" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>รหัสผ่านใหม่</label>
              <input type="password" v-model="passwordForm.new" class="input-field" minlength="6" required>
            </div>
            <div class="form-group">
              <label>ยืนยันรหัสผ่านใหม่</label>
              <input type="password" v-model="passwordForm.confirm" class="input-field" required>
            </div>
          </div>
          <button type="submit" class="btn-secondary">เปลี่ยนรหัสผ่าน</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  birthDate: ''
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

onMounted(() => {
  if (authStore.user) {
    form.value.name = authStore.user.name || ''
    form.value.email = authStore.user.email || ''
    form.value.phone = authStore.user.phone || ''
  }
})

async function updateProfile() {
  loading.value = true
  try {
    const response = await api.put('/auth/profile', {
      name: form.value.name,
      phone: form.value.phone
    })
    
    // Update local user data
    authStore.user = response.data
    localStorage.setItem('user', JSON.stringify(response.data))
    
    toast.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'อัปเดตข้อมูลเรียบร้อย',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'เกิดข้อผิดพลาด',
      detail: error.response?.data?.message || 'ไม่สามารถบันทึกได้',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    toast.add({
      severity: 'error',
      summary: 'รหัสผ่านไม่ตรงกัน',
      life: 3000
    })
    return
  }
  
  try {
    await api.put('/auth/password', {
      currentPassword: passwordForm.value.current,
      newPassword: passwordForm.value.new
    })
    
    toast.add({
      severity: 'success',
      summary: 'เปลี่ยนรหัสผ่านสำเร็จ',
      life: 3000
    })
    
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'เปลี่ยนรหัสผ่านไม่สำเร็จ',
      detail: error.response?.data?.message || 'กรุณาตรวจสอบข้อมูล',
      life: 3000
    })
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header h1 {
  font-size: 32px;
  margin-bottom: 40px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  align-items: start;
}

/* Sidebar */
.profile-sidebar {
  padding: 30px;
  text-align: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.user-avatar i {
  font-size: 40px;
  color: white;
}

.profile-sidebar h3 {
  font-size: 20px;
  margin-bottom: 4px;
}

.profile-sidebar p {
  color: var(--gray);
  font-size: 14px;
}

.profile-nav {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--light);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary-light);
}

/* Profile Content */
.profile-content {
  padding: 30px;
}

.profile-content h2 {
  font-size: 24px;
  margin-bottom: 30px;
}

.profile-content h3 {
  font-size: 18px;
  margin-bottom: 20px;
}

.profile-content hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 40px 0;
}

.profile-form,
.password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-actions {
  margin-top: 10px;
}

.form-actions .btn-primary {
  min-width: 150px;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
