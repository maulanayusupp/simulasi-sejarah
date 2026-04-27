<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: -3000 },
  max: { type: Number, default: 2025 },
})
const emit = defineEmits(['update:modelValue'])

const isPlaying = ref(false)
const speed = ref(20)
let intervalId = null

const formatYear = (y) => (y < 0 ? `${Math.abs(y)} SM` : `${y} M`)

function tick() {
  let next = props.modelValue + speed.value
  if (next >= props.max) {
    next = props.max
    stop()
  }
  emit('update:modelValue', next)
}

function play() {
  if (props.modelValue >= props.max) {
    emit('update:modelValue', props.min)
  }
  isPlaying.value = true
  intervalId = setInterval(tick, 100)
}

function stop() {
  isPlaying.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function toggle() {
  isPlaying.value ? stop() : play()
}

function reset() {
  stop()
  emit('update:modelValue', props.min)
}

watch(() => speed.value, () => {
  if (isPlaying.value) {
    stop()
    play()
  }
})

onBeforeUnmount(() => stop())
</script>

<template>
  <div class="timeline">
    <div class="top-row">
      <button class="play-btn" @click="toggle">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <button class="reset-btn" @click="reset" title="Reset ke awal">⏮</button>
      <div class="year-display">{{ formatYear(modelValue) }}</div>
      <div class="speed-control">
        <label>Kecepatan:</label>
        <select v-model.number="speed">
          <option :value="5">0.5×</option>
          <option :value="10">1×</option>
          <option :value="20">2×</option>
          <option :value="50">5×</option>
          <option :value="100">10×</option>
        </select>
      </div>
    </div>
    <input
      type="range"
      :min="min"
      :max="max"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value)); stop()"
      class="slider"
    />
    <div class="range-labels">
      <span>{{ formatYear(min) }}</span>
      <span>{{ formatYear(max) }}</span>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #444;
  border-radius: 12px;
  padding: 14px 24px;
  color: white;
  backdrop-filter: blur(10px);
}
.top-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.play-btn,
.reset-btn {
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid #ffd700;
  color: #ffd700;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.play-btn:hover,
.reset-btn:hover {
  background: rgba(255, 215, 0, 0.3);
  transform: scale(1.05);
}
.year-display {
  flex: 1;
  text-align: center;
  font-size: 26px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}
.speed-control {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #aaa;
}
.speed-control select {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
}
.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #1e3a8a, #ffd700);
  outline: none;
  -webkit-appearance: none;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffd700;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
}
.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffd700;
  cursor: pointer;
  border: none;
}
.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  color: #aaa;
}
</style>
