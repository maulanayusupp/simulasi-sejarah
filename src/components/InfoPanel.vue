<script setup>
defineProps({ event: { type: Object, default: null } })
defineEmits(['close'])
const formatYear = (y) => (y < 0 ? `${Math.abs(y)} SM` : `${y} M`)
</script>

<template>
  <transition name="fade">
    <div v-if="event" class="info-panel">
      <button class="close-btn" @click="$emit('close')">×</button>
      <div class="badge" :style="{ background: event.color }">
        {{ event.category }}
      </div>
      <h2>{{ event.name }}</h2>
      <div class="year">{{ formatYear(event.year) }}</div>
      <p>{{ event.description }}</p>
      <div class="coords">
        Koordinat: {{ event.lat.toFixed(2) }}°, {{ event.lng.toFixed(2) }}°
      </div>
    </div>
  </transition>
</template>

<style scoped>
.info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 320px;
  background: rgba(10, 10, 30, 0.9);
  border: 1px solid #444;
  border-radius: 12px;
  padding: 20px;
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  color: #000;
  margin-bottom: 8px;
}
h2 {
  margin: 0 0 6px 0;
  font-size: 20px;
}
.year {
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 12px;
}
p {
  font-size: 14px;
  line-height: 1.6;
  color: #ddd;
}
.coords {
  margin-top: 12px;
  font-size: 11px;
  color: #888;
  font-family: monospace;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
