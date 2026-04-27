export const historyRoutes = [
  {
    id: 'silk-road',
    name: 'Jalur Sutra',
    yearStart: -130,
    yearEnd: 1450,
    color: '#FFD700',
    description:
      'Jaringan rute perdagangan kuno dari Tiongkok ke Eropa via Asia Tengah, ramai sejak Dinasti Han hingga Era Penjelajahan.',
    points: [
      { lat: 34.3416, lng: 108.9398, name: "Xi'an" },
      { lat: 39.4704, lng: 75.9698, name: 'Kashgar' },
      { lat: 39.6542, lng: 66.9597, name: 'Samarkand' },
      { lat: 35.6892, lng: 51.389, name: 'Tehran' },
      { lat: 33.3152, lng: 44.3661, name: 'Baghdad' },
      { lat: 41.0082, lng: 28.9784, name: 'Konstantinopel' },
      { lat: 41.9028, lng: 12.4964, name: 'Roma' },
    ],
  },
  {
    id: 'columbus',
    name: 'Pelayaran Columbus 1492',
    yearStart: 1492,
    yearEnd: 1493,
    color: '#9370DB',
    description:
      'Christopher Columbus berlayar dari Spanyol mencari jalur barat ke Asia, malah menemukan benua Amerika.',
    points: [
      { lat: 37.2614, lng: -6.9447, name: 'Palos, Spanyol' },
      { lat: 28.4636, lng: -16.2518, name: 'Kepulauan Canary' },
      { lat: 23.1136, lng: -82.3666, name: 'Karibia' },
    ],
  },
  {
    id: 'magellan',
    name: 'Ekspedisi Magellan 1519-1522',
    yearStart: 1519,
    yearEnd: 1522,
    color: '#00CED1',
    description:
      'Ekspedisi keliling dunia pertama. Magellan tewas di Filipina; ekspedisi diselesaikan oleh Elcano.',
    points: [
      { lat: 36.5271, lng: -6.2886, name: 'Sanlúcar, Spanyol' },
      { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro' },
      { lat: -52.0, lng: -69.0, name: 'Selat Magellan' },
      { lat: -16.5, lng: -151.7, name: 'Pasifik Selatan' },
      { lat: 10.3, lng: 123.9, name: 'Cebu, Filipina' },
      { lat: -7.5575, lng: 112.3389, name: 'Maluku' },
      { lat: -34.3587, lng: 18.4731, name: 'Tanjung Harapan' },
      { lat: 36.5271, lng: -6.2886, name: 'Kembali ke Spanyol' },
    ],
  },
  {
    id: 'rempah',
    name: 'Jalur Rempah Nusantara',
    yearStart: 1500,
    yearEnd: 1800,
    color: '#FF6347',
    description:
      'Rute perdagangan rempah-rempah (cengkeh, pala, lada) dari Maluku ke Eropa via Selat Malaka dan Tanjung Harapan.',
    points: [
      { lat: -3.6954, lng: 128.1814, name: 'Maluku' },
      { lat: -6.2088, lng: 106.8456, name: 'Batavia' },
      { lat: 1.3521, lng: 103.8198, name: 'Selat Malaka' },
      { lat: 6.9271, lng: 79.8612, name: 'Sri Lanka' },
      { lat: -34.3587, lng: 18.4731, name: 'Tanjung Harapan' },
      { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
    ],
  },
]
