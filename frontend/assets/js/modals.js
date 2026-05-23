// ============================================================
// FEATURE CARD MODALS
// ============================================================

const MODAL_DATA = {
    ai: {
        icon: 'fas fa-brain',
        title: 'AI Cerdas — Random Forest',
        subtitle: 'Model Machine Learning inti penggerak estimasi harga',
        badges: [
            { text: 'Machine Learning', cls: '' },
            { text: 'Python / scikit-learn', cls: 'purple' },
            { text: 'R² 0.92', cls: 'green' },
        ],
        desc: 'KEPO Lahan menggunakan algoritma <strong>Random Forest Regressor</strong> — sebuah ensemble dari ratusan decision tree yang dilatih pada ribuan data properti DKI Jakarta. Model ini mampu menangkap pola non-linear kompleks antara lokasi dan harga tanah yang tidak bisa ditangkap oleh regresi linier biasa.',
        stats: [
            { val: '0.92', lbl: 'R² Score' },
            { val: '7', lbl: 'Fitur Input' },
            { val: '100+', lbl: 'Decision Trees' },
        ],
        listTitle: 'Cara Kerja',
        list: [
            { icon: 'fas fa-check-circle', text: 'Menerima 11 fitur input: kota, kecamatan, kelurahan, luas, jarak Monas, dan 6 jarak lokasi strategis.' },
            { icon: 'fas fa-check-circle', text: 'Label Encoding diterapkan untuk kolom kategori (kota, kecamatan, kelurahan) menggunakan <code>LabelEncoder</code> dari scikit-learn.' },
            { icon: 'fas fa-check-circle', text: 'Model memprediksi faktor pengali AI (faktor_ai) yang dikalikan dengan NJOP 2025 dan luas tanah untuk menghasilkan estimasi harga final.' },
            { icon: 'fas fa-check-circle', text: 'Model disimpan dalam format <code>.pkl</code> menggunakan <code>joblib</code> dan di-load saat server Flask pertama kali berjalan.' },
        ],
        techTitle: 'Stack Teknologi',
        tech: [
            { icon: 'fab fa-python', name: 'Python 3.x', desc: 'Runtime bahasa utama backend' },
            { icon: 'fas fa-cogs', name: 'scikit-learn', desc: 'Library Random Forest & encoder' },
            { icon: 'fas fa-save', name: 'joblib', desc: 'Serialisasi & load model .pkl' },
            { icon: 'fas fa-table', name: 'pandas', desc: 'Manipulasi dataset NJOP CSV' },
        ],
    },

    map: {
        icon: 'fas fa-map-marked-alt',
        title: 'Peta Interaktif — Leaflet.js',
        subtitle: 'Deteksi lokasi real-time berbasis klik & pencarian geocoding',
        badges: [
            { text: 'Leaflet 1.9.4', cls: '' },
            { text: 'OpenStreetMap', cls: 'green' },
            { text: 'Geocoder', cls: 'purple' },
        ],
        desc: 'Peta ditenagai oleh <strong>Leaflet.js</strong> yang merender tile dari <strong>OpenStreetMap</strong>. Plugin <strong>Leaflet Control Geocoder</strong> memungkinkan pencarian lokasi via nama jalan atau area, sedangkan klik langsung di peta memicu reverse geocoding via API Nominatim untuk mendapatkan data wilayah administrasi.',
        stats: [
            { val: '5 km', lbl: 'Radius Deteksi' },
            { val: '6', lbl: 'Kategori Strategis' },
            { val: 'Live', lbl: 'Update Status' },
        ],
        listTitle: 'Fitur Peta',
        list: [
            { icon: 'fas fa-map-pin', text: 'Klik sembarang titik di peta → marker langsung ditempatkan dan deteksi lokasi strategis otomatis dimulai.' },
            { icon: 'fas fa-search', text: 'Search bar Geocoder memungkinkan pencarian alamat atau nama tempat tanpa harus scroll peta manual.' },
            { icon: 'fas fa-satellite', text: 'Marker khusus ditampilkan untuk setiap lokasi strategis terdekat (RS, Mall, Polisi, Ibadah, Tol, Sekolah) dalam radius 5 km.' },
            { icon: 'fas fa-sync', text: 'Cache koordinat di backend mencegah query Overpass API berulang untuk titik yang sama, menjaga performa tetap cepat.' },
        ],
        techTitle: 'Stack Teknologi',
        tech: [
            { icon: 'fas fa-leaf', name: 'Leaflet.js 1.9.4', desc: 'Rendering peta interaktif' },
            { icon: 'fas fa-map', name: 'OpenStreetMap', desc: 'Tile peta open-source global' },
            { icon: 'fas fa-search-location', name: 'Control.Geocoder', desc: 'Plugin pencarian lokasi via nama' },
            { icon: 'fas fa-globe', name: 'Nominatim API', desc: 'Reverse geocoding wilayah administrasi' },
        ],
    },

    data: {
        icon: 'fas fa-database',
        title: 'Data Real-time — OpenStreetMap & NJOP',
        subtitle: 'Kombinasi data spasial OSM dengan data resmi pemerintah DKI Jakarta',
        badges: [
            { text: 'Overpass API', cls: '' },
            { text: 'NJOP 2025', cls: 'amber' },
            { text: 'Fallback System', cls: 'green' },
        ],
        desc: 'Data lokasi strategis diambil secara <strong>real-time</strong> dari <strong>Overpass API</strong> (infrastruktur query OpenStreetMap) dengan radius 5 km dari titik yang dipilih. Data NJOP (Nilai Jual Objek Pajak) 2025 berasal dari dataset resmi pemerintah DKI Jakarta dalam format CSV yang di-load oleh backend Flask.',
        stats: [
            { val: '5', lbl: 'Mirror Overpass' },
            { val: '2025', lbl: 'Tahun NJOP' },
            { val: '3-tier', lbl: 'Pencarian NJOP' },
        ],
        listTitle: 'Mekanisme Data',
        list: [
            { icon: 'fas fa-server', text: 'Backend mencoba 5 mirror Overpass API secara berurutan dengan retry logic — memastikan data tetap tersedia meski satu mirror down atau rate-limited.' },
            { icon: 'fas fa-map-marked-alt', text: 'Query Overpass mencari: rumah sakit, klinik, polisi, tempat ibadah, sekolah, universitas, mall, supermarket, akses tol dalam radius 5 km.' },
            { icon: 'fas fa-sitemap', text: 'Pencarian NJOP dilakukan berjenjang: kelurahan → kecamatan → kota → fallback default Rp 5.000.000/m² jika wilayah tidak ditemukan.' },
            { icon: 'fas fa-memory', text: 'Hasil query Overpass dan reverse geocode di-cache in-memory di server Flask untuk mengurangi latency pada permintaan berulang.' },
        ],
        techTitle: 'Stack Teknologi',
        tech: [
            { icon: 'fas fa-project-diagram', name: 'Overpass API', desc: 'Query data POI OpenStreetMap' },
            { icon: 'fas fa-file-csv', name: 'Dataset NJOP 2025', desc: 'Data nilai tanah resmi DKI Jakarta' },
            { icon: 'fas fa-flask', name: 'Flask + requests', desc: 'HTTP client & server REST API' },
            { icon: 'fas fa-bolt', name: 'In-memory Cache', desc: 'Cache koordinat untuk efisiensi' },
        ],
    },

    predict: {
        icon: 'fas fa-chart-line',
        title: 'Prediksi Akurat — Formula AI × NJOP',
        subtitle: 'Kalkulasi harga berlapis dari NJOP resmi yang dikali faktor strategis AI',
        badges: [
            { text: 'Random Forest', cls: 'purple' },
            { text: 'NJOP 2025', cls: 'amber' },
            { text: 'Chart.js 4', cls: '' },
        ],
        desc: 'Estimasi harga final menggunakan formula <strong>Harga = NJOP × Luas × Faktor AI</strong>. NJOP diambil dari database resmi berdasarkan kelurahan. Faktor AI (antara 1.0–3.0×) dihasilkan oleh model Random Forest berdasarkan kedekatan ke 7 titik strategis. Hasilnya divisualisasikan dalam spline chart interaktif menggunakan <strong>Chart.js 4</strong>.',
        stats: [
            { val: '×1–3', lbl: 'Rentang Faktor AI' },
            { val: '7', lbl: 'Parameter Lokasi' },
            { val: 'Chart.js', lbl: 'Visualisasi' },
        ],
        listTitle: 'Alur Kalkulasi',
        list: [
            { icon: 'fas fa-map-marker-alt', text: '<strong>Langkah 1 — Pilih Lokasi:</strong> Koordinat dipilih via klik peta atau geocoder, lalu reverse geocoded untuk mendapatkan kota, kecamatan, dan kelurahan.' },
            { icon: 'fas fa-radar', text: '<strong>Langkah 2 — Deteksi Strategis:</strong> Backend query Overpass API, hitung jarak Haversine ke 6 kategori POI terdekat + jarak ke Monas.' },
            { icon: 'fas fa-calculator', text: '<strong>Langkah 3 — Hitung NJOP:</strong> NJOP dicari dari dataset CSV secara berjenjang (kelurahan → kecamatan → kota). Dikalikan luas untuk dapat harga dasar.' },
            { icon: 'fas fa-robot', text: '<strong>Langkah 4 — Prediksi AI:</strong> Model Random Forest menghasilkan faktor pengali. Harga final = harga dasar × faktor AI, ditampilkan beserta detail kalkulasi.' },
        ],
        techTitle: 'Stack Teknologi',
        tech: [
            { icon: 'fas fa-chart-area', name: 'Chart.js 4.4.4', desc: 'Spline chart neon gradient jarak strategis' },
            { icon: 'fas fa-ruler-combined', name: 'Formula Haversine', desc: 'Hitung jarak lurus antar koordinat GPS' },
            { icon: 'fas fa-brain', name: 'Random Forest', desc: 'Prediksi faktor pengali AI' },
            { icon: 'fas fa-landmark', name: 'NJOP Database', desc: 'Nilai dasar tanah per kelurahan DKI' },
        ],
    },
};

// ============================================================
// BUILD HTML MODAL
// ============================================================
function buildModalHTML(data) {
    const badges = data.badges.map(b =>
        `<span class="fmodal-badge ${b.cls}">${b.text}</span>`
    ).join('');

    const stats = data.stats.map(s => `
        <div class="fmodal-stat">
            <div class="fmodal-stat-val">${s.val}</div>
            <div class="fmodal-stat-lbl">${s.lbl}</div>
        </div>
    `).join('');

    const listItems = data.list.map(item =>
        `<li><i class="${item.icon}"></i><span>${item.text}</span></li>`
    ).join('');

    const techItems = data.tech.map(t => `
        <div class="fmodal-tech-item">
            <i class="${t.icon} fmodal-tech-icon"></i>
            <div>
                <div class="fmodal-tech-name">${t.name}</div>
                <div class="fmodal-tech-desc">${t.desc}</div>
            </div>
        </div>
    `).join('');

    return `
        <div class="fmodal-accent"></div>
        <div class="fmodal-header">
            <div class="fmodal-icon"><i class="${data.icon}"></i></div>
            <div class="fmodal-title-wrap">
                <div class="fmodal-title">${data.title}</div>
                <div class="fmodal-subtitle">${data.subtitle}</div>
                <div class="fmodal-badges">${badges}</div>
            </div>
        </div>
        <div class="fmodal-content">
            <div class="fmodal-desc">${data.desc}</div>
            <div class="fmodal-stats">${stats}</div>
            <div class="fmodal-section-title"><i class="fas fa-list-ul"></i> ${data.listTitle}</div>
            <ul class="fmodal-list">${listItems}</ul>
            <div class="fmodal-section-title"><i class="fas fa-microchip"></i> ${data.techTitle}</div>
            <div class="fmodal-tech-grid">${techItems}</div>
        </div>
    `;
}

// ============================================================
// OPEN / CLOSE LOGIC
// ============================================================
function openModal(key) {
    const data = MODAL_DATA[key];
    if (!data) return;

    const overlay = document.getElementById('featureModal');
    const body    = document.getElementById('fmodalBody');

    body.innerHTML = buildModalHTML(data);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('featureModal');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Open modal on card click or Enter/Space key
    document.querySelectorAll('.feature-card[data-modal]').forEach(card => {
        card.addEventListener('click', () => openModal(card.dataset.modal));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(card.dataset.modal);
            }
        });
    });

    // Close button
    document.getElementById('fmodalClose').addEventListener('click', closeModal);

    // Click outside box to close
    document.getElementById('featureModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
});
