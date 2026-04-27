<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  events: { type: Array, required: true },
  selectedYear: { type: Number, required: true },
  autoRotate: { type: Boolean, default: true },
  flyTo: { type: Object, default: null },
  routes: { type: Array, default: () => [] },
  highlightedId: { type: [Number, String, null], default: null },
})

const emit = defineEmits(['select-event', 'new-event'])

const container = ref(null)
let renderer, scene, camera, globe, animationId
let raycaster, mouse
let pointsGroup, routesGroup, pulseGroup
const GLOBE_RADIUS = 100

let flyState = null
let lastVisibleIds = new Set()
let activePulses = []
let pulseInitialized = false

const visibleEvents = () =>
  props.events.filter((e) => e.year <= props.selectedYear)

function latLngToVector3(lat, lng, radius) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((90 - lng) * Math.PI) / 180
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
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
  // Selaraskan tekstur Earth (Greenwich) ke +Z (depan kamera) — sama seperti three-globe
  geometry.rotateY(-Math.PI / 2)

  // Use YXZ order for predictable lat/lng rotation

  const fallbackMat = new THREE.MeshPhongMaterial({
    color: 0x2266aa,
    emissive: 0x112244,
    shininess: 5,
  })
  globe = new THREE.Mesh(geometry, fallbackMat)
  globe.rotation.order = 'YXZ'
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
  routesGroup = new THREE.Group()
  globe.add(routesGroup)
  pulseGroup = new THREE.Group()
  globe.add(pulseGroup)
  updatePoints()
  updateRoutes()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  attachInteraction()
  window.addEventListener('resize', onResize)
  animate()
}

function attachInteraction() {
  let isDragging = false
  let prev = { x: 0, y: 0 }
  let pinchDist = 0
  const dom = renderer.domElement

  function applyDrag(dx, dy) {
    globe.rotation.y += dx * 0.005
    globe.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, globe.rotation.x + dy * 0.005)
    )
  }

  function applyZoom(delta) {
    camera.position.z = Math.max(
      140,
      Math.min(500, camera.position.z + delta)
    )
  }

  // ===== Mouse =====
  dom.addEventListener('mousedown', (e) => {
    isDragging = true
    prev = { x: e.clientX, y: e.clientY }
  })
  dom.addEventListener('mouseup', () => (isDragging = false))
  dom.addEventListener('mouseleave', () => (isDragging = false))
  dom.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    applyDrag(e.clientX - prev.x, e.clientY - prev.y)
    prev = { x: e.clientX, y: e.clientY }
  })
  dom.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      applyZoom(e.deltaY * 0.3)
    },
    { passive: false }
  )
  dom.addEventListener('click', onClick)

  // ===== Touch =====
  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  let tapStart = null
  dom.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault()
      if (e.touches.length === 1) {
        isDragging = true
        prev = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        tapStart = { x: prev.x, y: prev.y, time: Date.now() }
      } else if (e.touches.length === 2) {
        isDragging = false
        pinchDist = getTouchDist(e.touches)
        tapStart = null
      }
    },
    { passive: false }
  )

  dom.addEventListener(
    'touchmove',
    (e) => {
      e.preventDefault()
      if (e.touches.length === 1 && isDragging) {
        const t = e.touches[0]
        applyDrag(t.clientX - prev.x, t.clientY - prev.y)
        prev = { x: t.clientX, y: t.clientY }
        if (tapStart) {
          const dx = t.clientX - tapStart.x
          const dy = t.clientY - tapStart.y
          if (Math.sqrt(dx * dx + dy * dy) > 8) tapStart = null
        }
      } else if (e.touches.length === 2) {
        const newDist = getTouchDist(e.touches)
        applyZoom((pinchDist - newDist) * 0.8)
        pinchDist = newDist
      }
    },
    { passive: false }
  )

  dom.addEventListener('touchend', (e) => {
    isDragging = false
    if (tapStart && Date.now() - tapStart.time < 300) {
      onClick({ clientX: tapStart.x, clientY: tapStart.y })
    }
    tapStart = null
  })
}

function spawnPulse(evt) {
  const pos = latLngToVector3(evt.lat, evt.lng, GLOBE_RADIUS * 1.01)
  const ringGeo = new THREE.RingGeometry(1.5, 2.5, 32)
  const ringMat = new THREE.MeshBasicMaterial({
    color: evt.color,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.position.copy(pos)
  ring.lookAt(0, 0, 0)
  pulseGroup.add(ring)
  activePulses.push({ mesh: ring, born: performance.now(), duration: 1800 })
}

function updatePoints() {
  if (!pointsGroup) return
  const visible = visibleEvents()
  const visibleIdSet = new Set(visible.map((e) => e.id))

  // Detect newly appeared events (skip on first render)
  if (pulseInitialized) {
    const newEvents = visible.filter((e) => !lastVisibleIds.has(e.id))
    newEvents.forEach((evt) => {
      spawnPulse(evt)
      emit('new-event', evt)
    })
  }
  pulseInitialized = true
  lastVisibleIds = visibleIdSet

  while (pointsGroup.children.length) {
    const c = pointsGroup.children.pop()
    c.geometry?.dispose()
    c.material?.dispose()
  }
  visible.forEach((evt) => {
    const isHighlighted = evt.id === props.highlightedId
    const pos = latLngToVector3(evt.lat, evt.lng, GLOBE_RADIUS * 1.01)

    const dotSize = isHighlighted ? 3.5 : 2.2
    const dotGeo = new THREE.SphereGeometry(dotSize, 16, 16)
    const dotMat = new THREE.MeshBasicMaterial({ color: evt.color })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.copy(pos)
    dot.userData = evt

    const ringGeo = new THREE.RingGeometry(
      isHighlighted ? 4 : 3,
      isHighlighted ? 5.5 : 4,
      32
    )
    const ringMat = new THREE.MeshBasicMaterial({
      color: evt.color,
      transparent: true,
      opacity: isHighlighted ? 1 : 0.6,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.copy(pos)
    ring.lookAt(0, 0, 0)
    ring.userData = evt
    if (isHighlighted) ring.userData._isHighlight = true

    pointsGroup.add(dot)
    pointsGroup.add(ring)

    if (isHighlighted) {
      // Tambah cincin denyut permanen untuk highlight
      const beaconGeo = new THREE.RingGeometry(6, 7.5, 32)
      const beaconMat = new THREE.MeshBasicMaterial({
        color: evt.color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      })
      const beacon = new THREE.Mesh(beaconGeo, beaconMat)
      beacon.position.copy(pos)
      beacon.lookAt(0, 0, 0)
      beacon.userData._beacon = true
      pointsGroup.add(beacon)
    }
  })
}

function updateBeacons() {
  if (!pointsGroup) return
  const t = (performance.now() / 1000) % (Math.PI * 2)
  const pulse = 1 + Math.sin(t * 3) * 0.25
  pointsGroup.children.forEach((c) => {
    if (c.userData && c.userData._beacon) {
      c.scale.set(pulse, pulse, pulse)
      c.material.opacity = 0.5 + Math.sin(t * 3) * 0.3
    }
  })
}

function updatePulses() {
  if (!pulseGroup || !activePulses.length) return
  const now = performance.now()
  activePulses = activePulses.filter((p) => {
    const t = (now - p.born) / p.duration
    if (t >= 1) {
      pulseGroup.remove(p.mesh)
      p.mesh.geometry.dispose()
      p.mesh.material.dispose()
      return false
    }
    const scale = 1 + t * 6
    p.mesh.scale.set(scale, scale, scale)
    p.mesh.material.opacity = 1 - t
    return true
  })
}

function buildArcCurve(p1, p2) {
  const v1 = latLngToVector3(p1.lat, p1.lng, GLOBE_RADIUS * 1.01)
  const v2 = latLngToVector3(p2.lat, p2.lng, GLOBE_RADIUS * 1.01)
  const dist = v1.distanceTo(v2)
  const altitude = GLOBE_RADIUS + Math.min(dist * 0.4, GLOBE_RADIUS * 0.5)
  const mid = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(altitude)
  const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2)
  return curve
}

function updateRoutes() {
  if (!routesGroup) return
  while (routesGroup.children.length) {
    const c = routesGroup.children.pop()
    c.geometry?.dispose()
    c.material?.dispose()
  }
  const visible = props.routes.filter(
    (r) => r.yearStart <= props.selectedYear
  )
  visible.forEach((route) => {
    for (let i = 0; i < route.points.length - 1; i++) {
      const curve = buildArcCurve(route.points[i], route.points[i + 1])
      const points = curve.getPoints(50)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: route.color,
        transparent: true,
        opacity: 0.85,
      })
      const line = new THREE.Line(geometry, material)
      line.userData = { route: route.id }
      routesGroup.add(line)
    }
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

function shortestAngle(from, to) {
  let diff = (to - from) % (Math.PI * 2)
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return diff
}

function startFlyTo(lat, lng) {
  const targetX = (lat * Math.PI) / 180
  const targetY = (-lng * Math.PI) / 180
  flyState = {
    targetX,
    targetY,
    targetZ: 170,
    elapsed: 0,
    duration: 1.2,
    startX: globe.rotation.x,
    startY: globe.rotation.y,
    startZ: camera.position.z,
    deltaX: shortestAngle(globe.rotation.x, targetX),
    deltaY: shortestAngle(globe.rotation.y, targetY),
  }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function animate() {
  animationId = requestAnimationFrame(animate)

  if (flyState) {
    flyState.elapsed += 1 / 60
    const t = Math.min(flyState.elapsed / flyState.duration, 1)
    const eased = easeInOutCubic(t)
    globe.rotation.x = flyState.startX + flyState.deltaX * eased
    globe.rotation.y = flyState.startY + flyState.deltaY * eased
    camera.position.z = flyState.startZ + (flyState.targetZ - flyState.startZ) * eased
    if (t >= 1) flyState = null
  } else if (props.autoRotate) {
    globe.rotation.y += 0.0008
  }

  updatePulses()
  updateBeacons()
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

watch(() => props.selectedYear, () => {
  updatePoints()
  updateRoutes()
})
watch(() => props.highlightedId, () => updatePoints())
watch(
  () => props.events,
  () => {
    pulseInitialized = false
    updatePoints()
  },
  { deep: true }
)
watch(() => props.routes, () => updateRoutes(), { deep: true })
watch(
  () => props.flyTo,
  (target) => {
    if (target && globe) startFlyTo(target.lat, target.lng)
  }
)

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
