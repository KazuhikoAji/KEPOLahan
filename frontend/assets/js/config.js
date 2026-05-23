const API_URL = "";
const SEARCH_RADIUS = 10000;

// Kategori lokasi strategis (dipakai map.js untuk referensi label)
const CATEGORIES = [
    { name: 'Rumah Sakit & Medis',       icon: '🏥', key: 'rumah_sakit', weight: 0.10 },
    { name: 'Pusat Belanja & Pasar',      icon: '🛒', key: 'mall',        weight: 0.20 },
    { name: 'Keamanan & Layanan Publik',  icon: '🚓', key: 'polisi',      weight: 0.05 },
    { name: 'Tempat Ibadah',              icon: '🕌', key: 'ibadah',      weight: 0.05 },
    { name: 'Akses Jalan Tol',            icon: '🚗', key: 'toll',        weight: 0.25 },
    { name: 'Pendidikan',                 icon: '🏫', key: 'sekolah',     weight: 0.10 },
];