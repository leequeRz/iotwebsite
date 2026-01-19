<template>
  <div class="auth-page">
    <div class="auth-container glass-card animate-fade-in">
      <div class="auth-header">
        <router-link to="/" class="back-link">
          <i class="pi pi-arrow-left"></i>
        </router-link>
        <div class="auth-logo">
          <i class="pi pi-bolt"></i>
          <span class="gradient-text">IoT Shop</span>
        </div>
        <h1>สมัครสมาชิก</h1>
        <p>สร้างบัญชีเพื่อเริ่มช้อปปิ้ง</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="name">ชื่อ-นามสกุล</label>
          <div class="input-wrapper">
            <i class="pi pi-user"></i>
            <input 
              type="text" 
              id="name"
              v-model="name"
              class="input-field"
              placeholder="กรอกชื่อ-นามสกุล"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="email">อีเมล</label>
          <div class="input-wrapper">
            <i class="pi pi-envelope"></i>
            <input 
              type="email" 
              id="email"
              v-model="email"
              class="input-field"
              placeholder="กรอกอีเมลของคุณ"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="phone">เบอร์โทรศัพท์</label>
          <div class="input-wrapper">
            <i class="pi pi-phone"></i>
            <input 
              type="tel" 
              id="phone"
              v-model="phone"
              class="input-field"
              placeholder="0xx-xxx-xxxx"
              pattern="[0-9]{10}"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <div class="input-wrapper">
            <i class="pi pi-lock"></i>
            <input 
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="input-field"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              minlength="6"
              required
            >
            <button type="button" @click="showPassword = !showPassword" class="toggle-password">
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">ยืนยันรหัสผ่าน</label>
          <div class="input-wrapper">
            <i class="pi pi-lock"></i>
            <input 
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              class="input-field"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              required
            >
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="toggle-password">
              <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <label class="checkbox-wrapper">
          <input type="checkbox" v-model="agreeTerms" required>
          <span class="checkmark"></span>
          ฉันยอมรับ <a href="#">ข้อกำหนดการใช้งาน</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a>
        </label>

        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          {{ error }}
        </div>

        <button type="submit" class="btn-primary submit-btn" :disabled="authStore.loading">
          <i v-if="authStore.loading" class="pi pi-spin pi-spinner"></i>
          <span v-else>สมัครสมาชิก</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>มีบัญชีอยู่แล้ว? <router-link to="/login">เข้าสู่ระบบ</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeTerms = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  
  if (password.value !== confirmPassword.value) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  if (password.value.length < 6) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  const success = await authStore.register(name.value, email.value, password.value, phone.value)
  if (success) {
    router.push('/')
  } else {
    error.value = authStore.error
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
}

.back-link {
  position: absolute;
  left: 0;
  top: 0;
  color: var(--gray);
  font-size: 20px;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--primary-light);
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}

.auth-logo i {
  font-size: 32px;
  color: var(--primary);
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.auth-header p {
  color: var(--gray);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: var(--light);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper > i:first-child {
  position: absolute;
  left: 16px;
  color: var(--gray);
}

.input-wrapper .input-field {
  padding-left: 48px;
}

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  padding: 4px;
}

.toggle-password:hover {
  color: var(--primary-light);
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  color: var(--gray);
  font-size: 14px;
  line-height: 1.5;
}

.checkbox-wrapper input {
  accent-color: var(--primary);
  margin-top: 4px;
}

.checkbox-wrapper a {
  color: var(--primary-light);
  text-decoration: none;
}

.checkbox-wrapper a:hover {
  text-decoration: underline;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  margin-top: 8px;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  color: var(--gray);
}

.auth-footer a {
  color: var(--primary-light);
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
