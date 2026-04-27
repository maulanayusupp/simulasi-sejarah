<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: -3000 },
  max: { type: Number, default: 2025 },
})
defineEmits(['update:modelValue'])

const formatYear = (y) => (y < 0 ? `${Math.abs(y)} SM` : `${y} M`)
</script>

<template>
  <div class="timeline">
    <div class="year-display">{{ formatYear(modelValue) }}</div>
    <input
      type="range"
      :min="min"
      :max="max"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
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
  padding: 16px 24px;
  color: white;
  backdrop-filter: blur(10px);
}
.year-display {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
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
