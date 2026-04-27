<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  events: { type: Array, required: true },
  selectedYear: { type: Number, required: true },
})
const emit = defineEmits(['select-event'])

const search = ref('')
const isOpen = ref(true)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = props.events.filter((e) => e.year <= props.selectedYear)
  if (!q) return list
  return list.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
  )
})

const formatYear = (y) => (y < 0 ? `${Math.abs(y)} SM` : `${y} M`)
</script>

<template>
  <div class="event-list" :class="{ collapsed: !isOpen }">
    <button class="toggle" @click="isOpen = !isOpen">
      {{ isOpen ? '◀' : '▶' }}
    </button>
    <div v-if="isOpen" class="content">
      <h3>📚 Daftar Peristiwa</h3>
      <input
        v-model="search"
        type="text"
        placeholder="Cari peristiwa..."
        class="search-input"
      />
      <div class="count">{{ filtered.length }} peristiwa</div>
      <div class="list">
        <div
          v-for="evt in filtered"
          :key="evt.id"
          class="item"
          @click="$emit('select-event', evt)"
        >
          <div class="dot" :style="{ background: evt.color }"></div>
          <div class="text">
            <div class="name">{{ evt.name }}</div>
            <div class="meta">
              <span class="year">{{ formatYear(evt.year) }}</span>
              <span class="cat">{{ evt.category }}</span>
            </div>
          </div>
        </div>
        <div v-if="!filtered.length" class="empty">
          Tidak ada peristiwa cocok.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-list {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 320px;
  max-height: calc(100vh - 250px);
  background: rgba(10, 10, 30, 0.85);
  border: 1px solid #444;
  border-radius: 12px;
  color: white;
  backdrop-filter: blur(10px);
  display: flex;
  transition: transform 0.3s;
}
.event-list.collapsed {
  transform: translateX(calc(100% - 30px));
}
.toggle {
  position: absolute;
  left: -16px;
  top: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffd700;
  border: none;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
}
.content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}
.search-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #555;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}
.search-input:focus {
  border-color: #ffd700;
}
.count {
  font-size: 11px;
  color: #aaa;
  margin: 8px 0;
}
.list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 4px;
}
.list::-webkit-scrollbar {
  width: 6px;
}
.list::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}
.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.item:hover {
  background: rgba(255, 215, 0, 0.1);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
}
.text {
  flex: 1;
  min-width: 0;
}
.name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta {
  font-size: 10px;
  color: #888;
  display: flex;
  gap: 8px;
  margin-top: 2px;
}
.year {
  color: #ffd700;
}
.empty {
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 12px;
}

@media (max-width: 768px) {
  .event-list {
    width: 260px;
    top: 60px;
    right: 10px;
    max-height: calc(100vh - 200px);
  }
}
</style>
