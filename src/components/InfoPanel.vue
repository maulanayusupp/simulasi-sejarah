<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({ event: { type: Object, default: null } })
defineEmits(['close'])

const isSpeaking = ref(false)
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

const formatYear = (y) => (y < 0 ? `${Math.abs(y)} SM` : `${y} M`)

function speak() {
  if (!supported || !props.event) return
  stop()
  const text = `${props.event.name}. Tahun ${formatYear(props.event.year)}. ${props.event.description}`
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'id-ID'
  utt.rate = 0.95
  utt.pitch = 1
  utt.onend = () => (isSpeaking.value = false)
  utt.onerror = () => (isSpeaking.value = false)
  isSpeaking.value = true
  window.speechSynthesis.speak(utt)
}

function stop() {
  if (!supported) return
  window.speechSynthesis.cancel()
  isSpeaking.value = false
}

watch(
  () => props.event?.id,
  () => stop()
)

onBeforeUnmount(() => stop())
</script>

<template>
  <transition name="fade">
    <div v-if="event" class="info-panel">
      <button class="close-btn" @click="stop(); $emit('close')">×</button>
      <div class="badge" :style="{ background: event.color }">
        {{ event.category }}
      </div>
      <h2>{{ event.name }}</h2>
      <div class="year">{{ formatYear(event.year) }}</div>
      <p>{{ event.description }}</p>
      <div class="actions" v-if="supported">
        <button class="audio-btn" @click="isSpeaking ? stop() : speak()">
          {{ isSpeaking ? '⏹ Hentikan' : '🔊 Dengarkan' }}
        </button>
      </div>
      <div class="coords">
        Koordinat: {{ event.lat.toFixed(2) }}°, {{ event.lng.toFixed(2) }}°
      </div>
    </div>
  </transition>
</template>

<style scoped>
.info-panel {
  position: absolute;
  bottom: 70px;
  left: 20px;
  width: 340px;
  z-index: 5;
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
.actions {
  margin-top: 12px;
}
.audio-btn {
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid #ffd700;
  color: #ffd700;
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s;
}
.audio-btn:hover {
  background: rgba(255, 215, 0, 0.3);
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

@media (max-width: 768px) {
  .info-panel {
    width: calc(100% - 20px);
    left: 10px;
    bottom: 60px;
    padding: 14px;
  }
  h2 {
    font-size: 16px;
  }
  p {
    font-size: 12px;
  }
}
</style>
