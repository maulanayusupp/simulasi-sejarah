<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import ThreeGlobe from 'three-globe'

const props = defineProps({
  events: { type: Array, required: true },
  selectedYear: { type: Number, required: true },
})

const emit = defineEmits(['select-event'])

const container = ref(null)
let renderer, scene, camera, globe, animationId
let raycaster, mouse
let pointsData = []

const visibleEvents = () =>
  props.events.filter((e) => e.year <= props.selectedYear)

function initGlobe() {
  const width = container.value.clientWidth
  const height = container.value.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000010)

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.z = 300

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
  dirLight.position.set(1, 1, 1)
  scene.add(dirLight)

  addStars()

  globe = new ThreeGlobe()
    .globeImageUrl(
      '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
    )
    .bumpImageUrl(
      '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'
    )
    .pointAltitude(0.05)
    .pointRadius(1.2)
    .pointColor((d) => d.color)
    .pointLabel((d) => `<b>${d.name}</b><br/>${d.year} M`)
    .onPointClick((d) => emit('select-event', d))

  scene.add(globe)
  updatePoints()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  renderer.domElement.addEventListener('click', onClick)
  window.addEventListener('resize', onResize)

  let isDragging = false
  let prev = { x: 0, y: 0 }
  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true
    prev = { x: e.clientX, y: e.clientY }
  })
  renderer.domElement.addEventListener('mouseup', () => (isDragging = false))
  renderer.domElement.addEventListener('mouseleave', () => (isDragging = false))
  renderer.domElement.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    globe.rotation.y += dx * 0.005
    globe.rotation.x += dy * 0.005
    prev = { x: e.clientX, y: e.clientY }
  })
  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault()
    camera.position.z = Math.max(150, Math.min(500, camera.position.z + e.deltaY * 0.3))
  }, { passive: false })

  animate()
}

function addStars() {
  const geometry = new THREE.BufferGeometry()
  const count = 3000
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 1500
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })
  scene.add(new THREE.Points(geometry, material))
}

function updatePoints() {
  pointsData = visibleEvents()
  globe.pointsData(pointsData)
}

function onClick(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(globe.children, true)
  if (intersects.length > 0) {
    const obj = intersects[0].object
    if (obj.__data) emit('select-event', obj.__data)
  }
}

function onResize() {
  if (!container.value) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  globe.rotation.y += 0.0008
  renderer.render(scene, camera)
}

watch(() => props.selectedYear, () => updatePoints())

onMounted(() => initGlobe())

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  if (renderer) {
    renderer.dispose()
    container.value?.removeChild(renderer.domElement)
  }
})
</script>

<template>
  <div ref="container" class="globe-container"></div>
</template>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  cursor: grab;
}
.globe-container:active {
  cursor: grabbing;
}
</style>
