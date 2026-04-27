<script setup>
import { ref, computed } from 'vue'
import Globe3D from './components/Globe3D.vue'
import Timeline from './components/Timeline.vue'
import InfoPanel from './components/InfoPanel.vue'
import { historyEvents, categories } from './data/historyEvents.js'

const selectedYear = ref(2025)
const selectedCategory = ref('Semua')
const selectedEvent = ref(null)

const filteredEvents = computed(() => {
  if (selectedCategory.value === 'Semua') return historyEvents
  return historyEvents.filter((e) => e.category === selectedCategory.value)
})

const visibleCount = computed(
  () => filteredEvents.value.filter((e) => e.year <= selectedYear.value).length
)

function handleSelect(event) {
  selectedEvent.value = event
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>🌍 Simulasi Sejarah Dunia 3D</h1>
      <p>Geser timeline untuk melihat peristiwa sejarah muncul di globe</p>
    </header>

    <div class="globe-wrapper">
      <Globe3D :events="filteredEvents" :selected-year="selectedYear" @select-event="handleSelect" />

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
.timeline-wrapper {
  padding: 16px 24px 20px;
  background: rgba(0, 0, 0, 0.5);
}
</style>
