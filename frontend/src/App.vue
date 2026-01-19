<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- Navigation -->
    <nav class="navbar glass-card">
      <div class="nav-content">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <i class="pi pi-bolt" style="color: var(--primary)"></i>
          <span class="gradient-text">IoT Shop</span>
        </router-link>

        <!-- Desktop Menu -->
        <div class="nav-menu">
          <router-link to="/products" class="nav-link">
            <i class="pi pi-box"></i>
            สินค้า
          </router-link>
          
          <router-link v-if="authStore.isAdmin" to="/admin" class="nav-link">
            <i class="pi pi-cog"></i>
            Admin
          </router-link>
        </div>

        <!-- Right Section -->
        <div class="nav-actions">
          <!-- Cart -->
          <router-link to="/cart" class="cart-btn" v-if="authStore.isAuthenticated">
            <i class="pi pi-shopping-cart"></i>
            <span v-if="cartStore.totalItems > 0" class="cart-badge">
              {{ cartStore.totalItems }}
            </span>
          </router-link>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="user-menu">
            <button @click="toggleUserMenu" class="user-btn">
              <i class="pi pi-user"></i>
              <span>{{ authStore.user?.name }}</span>
              <i class="pi pi-chevron-down"></i>
            </button>
            <div v-if="showUserMenu" class="dropdown-menu glass-card">
              <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                <i class="pi pi-user"></i> โปรไฟล์
              </router-link>
              <router-link to="/orders" class="dropdown-item" @click="showUserMenu = false">
                <i class="pi pi-list"></i> คำสั่งซื้อ
              </router-link>
              <hr class="divider">
              <button @click="handleLogout" class="dropdown-item logout">
                <i class="pi pi-sign-out"></i> ออกจากระบบ
              </button>
            </div>
          </div>

          <!-- Login/Register -->
          <div v-else class="auth-btns">
            <router-link to="/login" class="btn-secondary">เข้าสู่ระบบ</router-link>
            <router-link to="/register" class="btn-primary">สมัครสมาชิก</router-link>
          </div>

          <!-- Mobile Menu Toggle -->
          <button @click="toggleMobileMenu" class="mobile-menu-btn">
            <i :class="showMobileMenu ? 'pi pi-times' : 'pi pi-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="mobile-menu">
        <router-link to="/products" class="mobile-nav-link" @click="showMobileMenu = false">
          <i class="pi pi-box"></i> สินค้า
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/admin" class="mobile-nav-link" @click="showMobileMenu = false">
          <i class="pi pi-cog"></i> Admin
        </router-link>
        <router-link v-if="authStore.isAuthenticated" to="/cart" class="mobile-nav-link" @click="showMobileMenu = false">
          <i class="pi pi-shopping-cart"></i> ตะกร้า ({{ cartStore.totalItems }})
        </router-link>
        <router-link v-if="authStore.isAuthenticated" to="/profile" class="mobile-nav-link" @click="showMobileMenu = false">
          <i class="pi pi-user"></i> โปรไฟล์
        </router-link>
        <router-link v-if="authStore.isAuthenticated" to="/orders" class="mobile-nav-link" @click="showMobileMenu = false">
          <i class="pi pi-list"></i> คำสั่งซื้อ
        </router-link>
        <hr v-if="authStore.isAuthenticated" class="divider">
        <button v-if="authStore.isAuthenticated" @click="handleLogout" class="mobile-nav-link logout">
          <i class="pi pi-sign-out"></i> ออกจากระบบ
        </button>
        <div v-else class="mobile-auth">
          <router-link to="/login" class="btn-secondary" @click="showMobileMenu = false">เข้าสู่ระบบ</router-link>
          <router-link to="/register" class="btn-primary" @click="showMobileMenu = false">สมัครสมาชิก</router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="footer glass-card">
      <div class="footer-content">
        <div class="footer-brand">
          <i class="pi pi-bolt" style="color: var(--primary)"></i>
          <span class="gradient-text">IoT Shop</span>
          <p>อุปกรณ์ IoT คุณภาพสูง ราคาเป็นกันเอง</p>
        </div>
        <div class="footer-links">
          <h4>ลิงก์</h4>
          <router-link to="/products">สินค้าทั้งหมด</router-link>
          <router-link to="/about">เกี่ยวกับเรา</router-link>
          <router-link to="/contact">ติดต่อ</router-link>
        </div>
        <div class="footer-contact">
          <h4>ติดต่อ</h4>
          <p><i class="pi pi-phone"></i> 02-123-4567</p>
          <p><i class="pi pi-envelope"></i> contact@iotshop.com</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 IoT Shop. All rights reserved.</p>
      </div>
    </footer>

    <!-- Toast Messages -->
    <Toast position="top-right" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const isDarkMode = ref(true)
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
  }
})

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function handleLogout() {
  authStore.logout()
  cartStore.clearCart()
  showUserMenu.value = false
  showMobileMenu.value = false
  router.push('/')
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0 20px;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
}

.logo i {
  font-size: 28px;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--light);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary-light);
}

.nav-link.router-link-active {
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary-light);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-btn {
  position: relative;
  color: var(--light);
  font-size: 20px;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.cart-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--primary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--light);
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 180px;
  padding: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  color: var(--light);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.logout {
  color: #ef4444;
}

.divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.auth-btns {
  display: flex;
  gap: 10px;
}

.auth-btns .btn-secondary,
.auth-btns .btn-primary {
  padding: 8px 16px;
  font-size: 14px;
  text-decoration: none;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--light);
  font-size: 24px;
  cursor: pointer;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  color: var(--light);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: none;
  border: none;
  width: 100%;
  font-size: 16px;
  cursor: pointer;
}

.mobile-nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-nav-link.logout {
  color: #ef4444;
}

.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

.mobile-auth a {
  text-align: center;
  text-decoration: none;
}

/* Main Content */
.main-content {
  flex: 1;
  padding-top: 90px;
  padding-bottom: 40px;
}

/* Footer */
.footer {
  margin-top: auto;
  padding: 40px 20px 20px;
  border-radius: 0;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-brand i {
  font-size: 32px;
}

.footer-brand p {
  color: var(--gray);
  margin-top: 10px;
}

.footer-links h4,
.footer-contact h4 {
  color: var(--light);
  margin-bottom: 16px;
}

.footer-links a {
  display: block;
  color: var(--gray);
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--primary-light);
}

.footer-contact p {
  color: var(--gray);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-bottom {
  max-width: 1400px;
  margin: 30px auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: var(--gray);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-menu,
  .auth-btns,
  .user-menu {
    display: none !important;
  }

  .cart-btn {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu {
    display: block;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-brand {
    align-items: center;
  }

  .footer-contact p {
    justify-content: center;
  }
}
</style>
