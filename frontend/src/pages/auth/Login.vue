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
        <h1>เข้าสู่ระบบ</h1>
        <p>ยินดีต้อนรับกลับมา</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
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
          <label for="password">รหัสผ่าน</label>
          <div class="input-wrapper">
            <i class="pi pi-lock"></i>
            <input 
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="input-field"
              placeholder="กรอกรหัสผ่าน"
              required
            >
            <button type="button" @click="showPassword = !showPassword" class="toggle-password">
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark"></span>
            จดจำฉัน
          </label>
          <a href="#" class="forgot-link">ลืมรหัสผ่าน?</a>
        </div>

        <div v-if="authStore.error" class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn-primary submit-btn" :disabled="authStore.loading">
          <i v-if="authStore.loading" class="pi pi-spin pi-spinner"></i>
          <span v-else>เข้าสู่ระบบ</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>ยังไม่มีบัญชี? <router-link to="/register">สมัครสมาชิก</router-link></p>
      </div>

      <!-- Demo Accounts -->
      <div class="demo-accounts">
        <p class="demo-title">บัญชีทดสอบ:</p>
        <button @click="fillDemo('admin')" class="demo-btn">
          <i class="pi pi-user"></i> Admin
        </button>
        <button @click="fillDemo('user')" class="demo-btn">
          <i class="pi pi-user"></i> User
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

async function handleLogin() {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }
}

function fillDemo(type) {
  if (type === 'admin') {
    email.value = 'admin@iotshop.com'
    password.value = 'admin123'
  } else {
    email.value = 'user@iotshop.com'
    password.value = 'user123'
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--gray);
  font-size: 14px;
}

.checkbox-wrapper input {
  accent-color: var(--primary);
}

.forgot-link {
  color: var(--primary-light);
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
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

.demo-accounts {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.demo-title {
  width: 100%;
  text-align: center;
  color: var(--gray);
  font-size: 14px;
  margin-bottom: 8px;
}

.demo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--light);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--primary);
}
</style>
