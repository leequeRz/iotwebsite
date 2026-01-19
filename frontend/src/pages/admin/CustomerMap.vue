<template>
  <div class="customer-map-page">
    <div class="page-header">
      <h1><i class="pi pi-map"></i> แผนที่ลูกค้า</h1>
      <div class="header-actions">
        <select v-model="dateFilter" class="input-field select-field">
          <option value="all">ทั้งหมด</option>
          <option value="today">วันนี้</option>
          <option value="week">7 วันล่าสุด</option>
          <option value="month">30 วันล่าสุด</option>
          <option value="year">ปีนี้</option>
        </select>
      </div>
    </div>

    <div class="map-layout">
      <!-- Map Container -->
      <div class="map-container glass-card">
        <div class="map-header">
          <h3>ที่ตั้งลูกค้าทั่วประเทศ</h3>
          <div class="map-legend">
            <span class="legend-item"><i class="dot high"></i>มาก (>100)</span>
            <span class="legend-item"><i class="dot medium"></i>ปานกลาง (50-100)</span>
            <span class="legend-item"><i class="dot low"></i>น้อย (<50)</span>
          </div>
        </div>
        <div id="map" class="map"></div>
      </div>

      <!-- Stats Sidebar -->
      <div class="stats-sidebar">
        <!-- Summary Stats -->
        <div class="summary-stats glass-card">
          <h3>สรุปภาพรวม</h3>
          <div class="stat-row">
            <span>ลูกค้าทั้งหมด</span>
            <strong>{{ totalCustomers.toLocaleString() }}</strong>
          </div>
          <div class="stat-row">
            <span>จังหวัดที่ครอบคลุม</span>
            <strong>{{ coveredProvinces }}/77</strong>
          </div>
          <div class="stat-row">
            <span>ยอดขายรวม</span>
            <strong>฿{{ totalSales.toLocaleString() }}</strong>
          </div>
        </div>

        <!-- Top Provinces -->
        <div class="top-provinces glass-card">
          <h3>จังหวัดลูกค้าสูงสุด</h3>
          <div class="province-list">
            <div v-for="(province, index) in topProvinces" :key="province.name" class="province-item">
              <span class="rank">{{ index + 1 }}</span>
              <div class="province-info">
                <span class="province-name">{{ province.name }}</span>
                <div class="province-bar">
                  <div class="bar-fill" :style="{ width: `${(province.count / topProvinces[0].count) * 100}%` }"></div>
                </div>
              </div>
              <span class="province-count">{{ province.count }}</span>
            </div>
          </div>
        </div>

        <!-- Region Stats -->
        <div class="region-stats glass-card">
          <h3>แยกตามภูมิภาค</h3>
          <div class="region-chart">
            <div v-for="region in regions" :key="region.name" class="region-item">
              <div class="region-label">
                <span>{{ region.name }}</span>
                <span>{{ region.percentage }}%</span>
              </div>
              <div class="region-bar">
                <div class="bar-fill" :style="{ width: `${region.percentage}%`, background: region.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const dateFilter = ref('all')

const totalCustomers = ref(1247)
const coveredProvinces = ref(65)
const totalSales = ref(4589000)

const topProvinces = ref([
  { name: 'กรุงเทพมหานคร', count: 423, lat: 13.7563, lng: 100.5018 },
  { name: 'เชียงใหม่', count: 156, lat: 18.7883, lng: 98.9853 },
  { name: 'ชลบุรี', count: 134, lat: 13.3611, lng: 100.9847 },
  { name: 'นนทบุรี', count: 98, lat: 13.8621, lng: 100.5144 },
  { name: 'ขอนแก่น', count: 87, lat: 16.4322, lng: 102.8236 },
  { name: 'ภูเก็ต', count: 76, lat: 7.8804, lng: 98.3923 },
  { name: 'นครราชสีมา', count: 65, lat: 14.9799, lng: 102.0977 },
  { name: 'สงขลา', count: 54, lat: 7.1893, lng: 100.5953 }
])

const regions = ref([
  { name: 'ภาคกลาง', percentage: 45, color: '#6366f1' },
  { name: 'ภาคเหนือ', percentage: 18, color: '#10b981' },
  { name: 'ภาคตะวันออกเฉียงเหนือ', percentage: 15, color: '#f59e0b' },
  { name: 'ภาคใต้', percentage: 12, color: '#ec4899' },
  { name: 'ภาคตะวันออก', percentage: 10, color: '#8b5cf6' }
])

let map = null

onMounted(() => {
  initMap()
})

watch(dateFilter, () => {
  // Simulate data update based on filter
  if (dateFilter.value === 'today') {
    totalCustomers.value = 23
    totalSales.value = 45890
  } else if (dateFilter.value === 'week') {
    totalCustomers.value = 156
    totalSales.value = 328900
  } else if (dateFilter.value === 'month') {
    totalCustomers.value = 487
    totalSales.value = 1456000
  } else {
    totalCustomers.value = 1247
    totalSales.value = 4589000
  }
})

function initMap() {
  // Create map centered on Thailand
  const mapContainer = document.getElementById('map')
  if (!mapContainer) return

  // Create a simple SVG map of Thailand
  mapContainer.innerHTML = `
    <svg viewBox="0 0 400 500" class="thailand-map">
      <!-- Thailand outline (simplified) -->
      <path d="M200,50 L280,80 L320,150 L340,250 L300,350 L250,400 L200,480 L150,400 L100,350 L80,250 L100,150 L140,80 Z" 
            fill="rgba(99, 102, 241, 0.2)" stroke="rgba(99, 102, 241, 0.5)" stroke-width="2"/>
      
      <!-- Province markers -->
      ${topProvinces.value.map((p, i) => `
        <g class="marker" transform="translate(${getX(p.lng)}, ${getY(p.lat)})">
          <circle r="${Math.min(20, 8 + p.count / 30)}" fill="${getMarkerColor(p.count)}" opacity="0.7"/>
          <circle r="${Math.min(12, 4 + p.count / 50)}" fill="${getMarkerColor(p.count)}"/>
          <text y="30" text-anchor="middle" fill="white" font-size="10">${p.name}</text>
        </g>
      `).join('')}
    </svg>
  `
}

function getX(lng) {
  // Convert longitude to SVG x coordinate
  return ((lng - 97) / 10) * 300 + 50
}

function getY(lat) {
  // Convert latitude to SVG y coordinate (inverted)
  return ((20 - lat) / 15) * 400 + 50
}

function getMarkerColor(count) {
  if (count > 100) return '#ef4444'
  if (count > 50) return '#f59e0b'
  return '#10b981'
}
</script>

<style scoped>
.customer-map-page {
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

.select-field {
  width: 180px;
  cursor: pointer;
}

/* Map Layout */
.map-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
  align-items: start;
}

/* Map Container */
.map-container {
  padding: 24px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.map-header h3 {
  font-size: 18px;
}

.map-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.high { background: #ef4444; }
.dot.medium { background: #f59e0b; }
.dot.low { background: #10b981; }

.map {
  height: 500px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

:deep(.thailand-map) {
  width: 100%;
  height: 100%;
}

:deep(.marker) {
  cursor: pointer;
  transition: transform 0.2s ease;
}

:deep(.marker:hover) {
  transform: scale(1.2);
}

/* Stats Sidebar */
.stats-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-stats,
.top-provinces,
.region-stats {
  padding: 20px;
}

.summary-stats h3,
.top-provinces h3,
.region-stats h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row span {
  color: var(--gray);
}

.stat-row strong {
  color: var(--primary-light);
}

/* Province List */
.province-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.province-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank {
  width: 24px;
  height: 24px;
  background: var(--primary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.province-info {
  flex: 1;
}

.province-name {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}

.province-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.province-count {
  font-weight: 600;
  color: var(--primary-light);
  min-width: 40px;
  text-align: right;
}

/* Region Stats */
.region-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.region-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.region-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.region-label span:last-child {
  color: var(--gray);
}

.region-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.region-bar .bar-fill {
  background: var(--primary);
}

/* Responsive */
@media (max-width: 992px) {
  .map-layout {
    grid-template-columns: 1fr;
  }

  .map {
    height: 400px;
  }
}
</style>
