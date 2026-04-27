<script setup>
import { ref, computed } from 'vue'
import Globe3D from './components/Globe3D.vue'
import Timeline from './components/Timeline.vue'
import InfoPanel from './components/InfoPanel.vue'
import EventList from './components/EventList.vue'
import { historyEvents, categories } from './data/historyEvents.js'
import { historyRoutes } from './data/historyRoutes.js'

const selectedYear = ref(2025)
const selectedCategory = ref('Semua')
const selectedEvent = ref(null)
const autoRotate = ref(true)
const flyTo = ref(null)
const showRoutes = ref(true)

const activeRoutes = computed(() =>
  showRoutes.value ? historyRoutes : []
)

const filteredEvents = computed(() => {
  if (selectedCategory.value === 'Semua') return historyEvents
  return historyEvents.filter((e) => e.category === selectedCategory.value)
})

const visibleCount = computed(
  () => filteredEvents.value.filter((e) => e.year <= selectedYear.value).length
)

function handleSelect(event) {
  selectedEvent.value = event
  flyTo.value = { lat: event.lat, lng: event.lng, _t: Date.now() }
  autoRotate.value = false
}

const recentEvents = ref([])
let bannerTimer = null
function handleNewEvent(event) {
  recentEvents.value = [event, ...recentEvents.value].slice(0, 3)
  clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => {
    recentEvents.value = []
  }, 3500)
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>🌍 Simulasi Sejarah Dunia 3D</h1>
      <p>Geser timeline untuk melihat peristiwa sejarah muncul di globe</p>
    </header>

    <div class="globe-wrapper">
      <Globe3D
        :events="filteredEvents"
        :selected-year="selectedYear"
        :auto-rotate="autoRotate"
        :fly-to="flyTo"
        :routes="activeRoutes"
        :highlighted-id="selectedEvent?.id ?? null"
        @select-event="handleSelect"
        @new-event="handleNewEvent"
      />

      <transition-group name="banner" tag="div" class="event-banner">
        <div
          v-for="evt in recentEvents"
          :key="evt.id + '-' + evt.year"
          class="banner-item"
          :style="{ borderColor: evt.color }"
          @click="handleSelect(evt)"
        >
          <div class="banner-dot" :style="{ background: evt.color }"></div>
          <div class="banner-text">
            <div class="banner-name">{{ evt.name }}</div>
            <div class="banner-year">
              {{ evt.year < 0 ? Math.abs(evt.year) + ' SM' : evt.year + ' M' }}
            </div>
          </div>
        </div>
      </transition-group>

      <div class="action-buttons">
        <button class="action-btn" @click="autoRotate = !autoRotate">
          {{ autoRotate ? '⏸ Pause Rotasi' : '▶ Auto Rotasi' }}
        </button>
        <button
          class="action-btn"
          :class="{ active: showRoutes }"
          @click="showRoutes = !showRoutes"
        >
          {{ showRoutes ? '🛤️ Sembunyikan Rute' : '🛤️ Tampilkan Rute' }}
        </button>
      </div>

      <div class="filter-bar">
        <button
          v-for="cat in categories"
          :key="cat.name"
          :class="{ active: selectedCategory === cat.name }"
          :style="{ borderColor: cat.color }"
          @click="selectedCategory = cat.name"
        >
          {{ cat.name }}
        </button>
      </div>

      <div class="event-counter">
        Peristiwa terlihat: <strong>{{ visibleCount }}</strong> /
        {{ filteredEvents.length }}
      </div>

      <EventList
        :events="filteredEvents"
        :selected-year="selectedYear"
        @select-event="handleSelect"
      />

      <InfoPanel :event="selectedEvent" @close="selectedEvent = null" />
    </div>

    <div class="timeline-wrapper">
      <Timeline v-model="selectedYear" :min="-3000" :max="2025" />
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000010;
  color: white;
  overflow: hidden;
}
.header {
  text-align: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}
.header h1 {
  margin: 0;
  font-size: 22px;
}
.header p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #aaa;
}
.globe-wrapper {
  flex: 1;
  position: relative;
  min-height: 0;
}
.filter-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 360px;
}
.filter-bar button {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #555;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.filter-bar button:hover {
  background: rgba(255, 255, 255, 0.1);
}
.filter-bar button.active {
  background: rgba(255, 215, 0, 0.2);
  border-width: 2px;
}
.event-counter {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
}
.action-buttons {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-btn {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #ffd700;
  color: #ffd700;
  padding: 10px 18px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  white-space: nowrap;
}
.action-btn:hover {
  background: rgba(255, 215, 0, 0.15);
  transform: scale(1.03);
}
.action-btn.active {
  background: rgba(255, 215, 0, 0.2);
}
.timeline-wrapper {
  padding: 16px 24px 20px;
  background: rgba(0, 0, 0, 0.5);
}
.event-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  z-index: 20;
}
.banner-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(10, 10, 30, 0.92);
  border: 2px solid;
  border-radius: 12px;
  padding: 10px 18px;
  pointer-events: auto;
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
.banner-item:hover {
  transform: scale(1.02);
}
.banner-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 12px currentColor;
  flex-shrink: 0;
}
.banner-name {
  font-weight: bold;
  font-size: 14px;
  color: white;
}
.banner-year {
  font-size: 11px;
  color: #ffd700;
  margin-top: 2px;
}
.banner-enter-active,
.banner-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.banner-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.banner-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 16px;
  }
  .header p {
    font-size: 11px;
  }
  .filter-bar {
    top: 10px;
    left: 10px;
    max-width: calc(100% - 20px);
    gap: 4px;
  }
  .filter-bar button {
    padding: 4px 8px;
    font-size: 10px;
  }
  .event-counter {
    bottom: 10px;
    left: 10px;
    font-size: 11px;
    padding: 6px 10px;
  }
  .action-buttons {
    bottom: 10px;
    right: 10px;
  }
  .action-btn {
    padding: 8px 12px;
    font-size: 11px;
  }
  .timeline-wrapper {
    padding: 10px 14px 14px;
  }
}
</style>
