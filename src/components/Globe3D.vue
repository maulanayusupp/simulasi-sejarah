<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  events: { type: Array, required: true },
  selectedYear: { type: Number, required: true },
  autoRotate: { type: Boolean, default: true },
})

const emit = defineEmits(['select-event'])

const container = ref(null)
let renderer, scene, camera, globe, animationId
let raycaster, mouse
let pointsGroup
const GLOBE_RADIUS = 100

const visibleEvents = () =>
  props.events.filter((e) => e.year <= props.selectedYear)

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

function initGlobe() {
  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000010)

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000)
  camera.position.z = 280

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.9))
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(5, 3, 5)
  scene.add(dirLight)

  addStars()

  const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64)
  const fallbackMat = new THREE.MeshPhongMaterial({
    color: 0x2266aa,
    emissive: 0x112244,
    shininess: 5,
  })
  globe = new THREE.Mesh(geometry, fallbackMat)
  scene.add(globe)

  const loader = new THREE.TextureLoader()
  loader.crossOrigin = 'anonymous'
  loader.load(
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    (texture) => {
      globe.material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 8,
      })
      globe.material.needsUpdate = true
    },
    undefined,
    () => {
      console.warn('Texture gagal dimuat — pakai warna fallback')
    }
  )

  const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.04, 64, 64)
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  })
  scene.add(new THREE.Mesh(atmosphereGeo, atmosphereMat))

  pointsGroup = new THREE.Group()
  globe.add(pointsGroup)
  updatePoints()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  attachInteraction()
  window.addEventListener('resize', onResize)
  animate()
}

function attachInteraction() {
  let isDragging = false
  let prev = { x: 0, y: 0 }
  const dom = renderer.domElement

  dom.addEventListener('mousedown', (e) => {
    isDragging = true
    prev = { x: e.clientX, y: e.clientY }
  })
  dom.addEventListener('mouseup', () => (isDragging = false))
  dom.addEventListener('mouseleave', () => (isDragging = false))
  dom.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    globe.rotation.y += dx * 0.005
    globe.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, globe.rotation.x + dy * 0.005)
    )
    prev = { x: e.clientX, y: e.clientY }
  })
  dom.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      camera.position.z = Math.max(
        140,
        Math.min(500, camera.position.z + e.deltaY * 0.3)
      )
    },
    { passive: false }
  )
  dom.addEventListener('click', onClick)
}

function updatePoints() {
  if (!pointsGroup) return
  while (pointsGroup.children.length) {
    const c = pointsGroup.children.pop()
    c.geometry?.dispose()
    c.material?.dispose()
  }
  visibleEvents().forEach((evt) => {
    const pos = latLngToVector3(evt.lat, evt.lng, GLOBE_RADIUS * 1.01)
    const dotGeo = new THREE.SphereGeometry(1.5, 16, 16)
    const dotMat = new THREE.MeshBasicMaterial({ color: evt.color })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.copy(pos)
    dot.userData = evt

    const ringGeo = new THREE.RingGeometry(2.5, 3.5, 24)
    const ringMat = new THREE.MeshBasicMaterial({
      color: evt.color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.copy(pos)
    ring.lookAt(0, 0, 0)
    ring.userData = evt

    pointsGroup.add(dot)
    pointsGroup.add(ring)
  })
}

function onClick(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(pointsGroup.children, true)
  if (intersects.length > 0) {
    const data = intersects[0].object.userData
    if (data && data.id) emit('select-event', data)
  }
}

function onResize() {
  if (!container.value || !renderer) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  if (props.autoRotate) globe.rotation.y += 0.0008
  renderer.render(scene, camera)
}

function addStars() {
  const geo = new THREE.BufferGeometry()
  const count = 3000
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 1500
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })
  scene.add(new THREE.Points(geo, mat))
}

watch(() => props.selectedYear, () => updatePoints())
watch(() => props.events, () => updatePoints(), { deep: true })

onMounted(() => {
  requestAnimationFrame(() => initGlobe())
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
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
  position: absolute;
  inset: 0;
}
.globe-container:active {
  cursor: grabbing;
}
</style>
