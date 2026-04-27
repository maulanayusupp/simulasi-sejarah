# 🌍 Simulasi Sejarah Dunia 3D

Globe 3D interaktif untuk menjelajahi peristiwa sejarah dunia dari **3000 SM hingga 2025 M**. Geser timeline, pilih kategori, dan saksikan peradaban, perang, penjelajahan, serta rute perdagangan muncul di atas peta bumi.

Proyek edukasi berbasis web yang memvisualisasikan ratusan peristiwa sejarah pada globe 3D — cocok untuk pelajar, pengajar sejarah, dan siapa pun yang ingin memahami konteks geografis peradaban manusia.

## ✨ Fitur

- ⏱️ **Timeline interaktif** dari 3000 SM sampai 2025 M
- 🎯 **Filter kategori**: Nusantara, Peradaban Kuno, Perdagangan, Penjelajahan, Revolusi, Sains, Agama, Perang, Budaya
- 🛤️ **Rute perdagangan & penjelajahan** klasik (Jalur Sutra, Cheng Ho, Columbus, dll.)
- 🌐 **Auto-rotasi globe** dan fly-to ke lokasi peristiwa
- 🔊 **Narasi suara Bahasa Indonesia** (Text-to-Speech) untuk tiap peristiwa
- 📱 **Responsif** untuk desktop dan mobile
- ⚠️ **Disclaimer** akademik untuk transparansi data

## 🛠️ Tech Stack

- [Vue 3](https://vuejs.org/) (`<script setup>`)
- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/) + [three-globe](https://github.com/vasturiano/three-globe)
- [TresJS](https://tresjs.org/) untuk integrasi Three.js dengan Vue

## 🚀 Menjalankan secara lokal

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build untuk produksi
npm run build

# Preview build produksi
npm run preview
```

## 📁 Struktur proyek

```
src/
├── App.vue                # Root component (header, layout, modal disclaimer)
├── components/
│   ├── Globe3D.vue        # Globe 3D + rendering titik & rute
│   ├── Timeline.vue       # Slider timeline 3000 SM – 2025 M
│   ├── InfoPanel.vue      # Panel detail peristiwa + Text-to-Speech
│   └── EventList.vue      # Daftar peristiwa terlihat
├── data/
│   ├── historyEvents.js   # 60+ peristiwa sejarah
│   └── historyRoutes.js   # Rute perdagangan & penjelajahan
└── main.js                # Entry point
```

## ⚠️ Disclaimer

Aplikasi ini adalah proyek **edukasi dan visualisasi**. Data peristiwa, tahun, lokasi koordinat, serta rute dirangkum dari berbagai sumber sekunder dan dapat mengandung:

- Kesalahan titik koordinat (lokasi mendekati, bukan presisi).
- Tahun perkiraan atau yang masih diperdebatkan sejarawan.
- Penyederhanaan rute, batas wilayah, dan nama peradaban.

Mohon **tidak menjadikan aplikasi ini sebagai satu-satunya rujukan akademik**. Untuk riset/tugas, verifikasi ke sumber primer dan literatur sejarah terpercaya.

Menemukan kesalahan? Pull request dan koreksi sangat dihargai.

## 📄 Lisensi

Bebas digunakan untuk keperluan edukasi.
