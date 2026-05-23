let map;
let marker;
let userLatLng        = null;
let strategicLocations = {};
let strategicMarkers   = [];
let mapLocked          = false;
let heatLayer          = null;
let heatmapVisible     = false;

// ============================================================
// INIT MAP
// ============================================================
function initMap() {
    map = L.map('map').setView([-6.2088, 106.8456], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Geocoder / search bar
    L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Cari lokasi tanah...',
    })
    .on('markgeocode', function (e) {
        const latlng = e.geocode.center;
        map.setView(latlng, 15);
        handleLocationClick(latlng.lat, latlng.lng);
    })
    .addTo(map);

    // Klik peta — diabaikan jika peta sedang terkunci
    map.on('click', function (e) {
        if (mapLocked) return;
        handleLocationClick(e.latlng.lat, e.latlng.lng);
    });

    // Tombol hapus marker
    document.getElementById('clearMarker').addEventListener('click', clearAll);

    // Heatmap toggle
    document.getElementById('heatmapToggle')?.addEventListener('click', toggleHeatmap);

    // Overlay indikator kunci
    const lockHint = document.createElement('div');
    lockHint.id = 'mapLockHint';
    lockHint.innerHTML = `<i class="fas fa-lock"></i> Peta terkunci — klik <b>Reset</b> untuk ubah lokasi`;
    document.querySelector('.dash-map').appendChild(lockHint);
}

// ============================================================
// KLIK LOKASI
// ============================================================
async function handleLocationClick(lat, lng) {
    clearMarkers();

    userLatLng = [lat, lng];

    // Marker user
    marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup('<b>📍 Lokasi Tanah Anda</b>')
        .openPopup();

    document.getElementById('coords').textContent =
        `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    // Reset state
    document.getElementById('calculateBtn').disabled = true;
    document.getElementById('results').style.display = 'none';

    // Pindah ke step 2: Tunggu deteksi
    setStep(2);

    // Deteksi lokasi strategis
    showStrategicLoading();
    await detectStrategicLocations(lat, lng);
}

// ============================================================
// DETEKSI LOKASI STRATEGIS (via backend → Overpass API)
// ============================================================
async function detectStrategicLocations(lat, lng) {
    try {
        const resp = await fetch(`${API_URL}/strategic-locations?lat=${lat}&lng=${lng}`);
        if (!resp.ok) {
            let errMsg = `HTTP ${resp.status}`;
            try {
                const errData = await resp.json();
                if (errData.error) errMsg = errData.error;
            } catch (e) {}
            throw new Error(errMsg);
        }

        const data = await resp.json();
        strategicLocations = data;

        // Tambahkan marker strategis ke peta
        addStrategicMarkers(data);

        // Tampilkan panel (dengan warning jika fallback)
        showStrategicLocations(data);

        // Kunci peta setelah lokasi strategis berhasil ditentukan
        mapLocked = true;
        updateMapLockUI(true);

        // Aktifkan tombol hitung & pindah ke step 3
        document.getElementById('calculateBtn').disabled = false;
        setStep(3);

    } catch (err) {
        console.error('[Strategic] Error:', err);
        showStrategicError(err.message);
    }
}

// ============================================================
// MARKER LOKASI STRATEGIS
// ============================================================
function addStrategicMarkers(data) {
    const keys = ['rumah_sakit', 'mall', 'polisi', 'ibadah', 'toll', 'sekolah'];

    keys.forEach(key => {
        const item = data[key];
        if (!item || item.lat == null || item.lon == null) return;

        const divIcon = L.divIcon({
            className: '',
            html: `<div class="strat-pin">${item.icon}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
        });

        const m = L.marker([item.lat, item.lon], { icon: divIcon })
            .addTo(map)
            .bindPopup(
                `<b>${item.icon} ${item.name || item.category_name}</b>` +
                `<br>📏 ${item.distance} km dari lokasi Anda`
            );

        strategicMarkers.push(m);
    });
}

// ============================================================
// CLEAR
// ============================================================
function clearMarkers() {
    if (marker) map.removeLayer(marker);
    strategicMarkers.forEach(m => map.removeLayer(m));
    strategicMarkers = [];
}

function clearAll() {
    clearMarkers();
    strategicLocations = {};
    userLatLng = null;
    document.getElementById('coords').textContent = 'Klik peta untuk memilih lokasi';
    document.getElementById('calculateBtn').disabled = true;
    document.getElementById('strategicPanel').style.display = 'none';
    document.getElementById('results').style.display = 'none';

    // Buka kunci peta
    mapLocked = false;
    updateMapLockUI(false);

    // Reset PDF data
    window._kepoPdfData = null;

    // Kembali ke step 1
    setStep(1);
}

// ============================================================
// UPDATE UI INDIKATOR KUNCI PETA
// ============================================================
function updateMapLockUI(locked) {
    const hint = document.getElementById('mapLockHint');
    if (!hint) return;
    hint.classList.toggle('map-lock-visible', locked);

    // Ubah cursor peta
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.cursor = locked ? 'not-allowed' : '';
}

// ============================================================
// HEATMAP TOGGLE
// ============================================================
const HEATMAP_DATA = [
    // ===== JAKARTA PUSAT — Ultra Premium =====
    [-6.1944, 106.8294, 1.0],  [-6.1863, 106.8234, 0.97], [-6.2007, 106.8312, 0.95],
    [-6.1920, 106.8350, 0.93], [-6.1751, 106.8272, 0.88], [-6.1790, 106.8327, 0.86],
    [-6.1988, 106.8395, 0.90], [-6.2044, 106.8361, 0.87], [-6.1877, 106.8147, 0.82],
    [-6.2018, 106.8098, 0.78], [-6.1768, 106.8434, 0.75], [-6.1820, 106.8476, 0.72],
    [-6.1694, 106.8370, 0.80], [-6.1654, 106.8298, 0.77],
    // ===== JAKARTA SELATAN — Premium =====
    [-6.2246, 106.8071, 0.96], [-6.2185, 106.8095, 0.94], [-6.2301, 106.8048, 0.93],
    [-6.2438, 106.8071, 0.90], [-6.2302, 106.8004, 0.88], [-6.2502, 106.8012, 0.86],
    [-6.2604, 106.8140, 0.82], [-6.2656, 106.8108, 0.80], [-6.2897, 106.7865, 0.85],
    [-6.2968, 106.7810, 0.83], [-6.2843, 106.7907, 0.80], [-6.2943, 106.8002, 0.73],
    [-6.3012, 106.8067, 0.70], [-6.3062, 106.8437, 0.58], [-6.3154, 106.8510, 0.55],
    [-6.3452, 106.8301, 0.45], [-6.3612, 106.8250, 0.42], [-6.2357, 106.8540, 0.76],
    [-6.2413, 106.8601, 0.74], [-6.2535, 106.8238, 0.72], [-6.2608, 106.8302, 0.68],
    [-6.2891, 106.7647, 0.60], [-6.3021, 106.7598, 0.55], [-6.2450, 106.7923, 0.78],
    [-6.2712, 106.7957, 0.65],
    // ===== JAKARTA BARAT — Medium-High =====
    [-6.1675, 106.7886, 0.68], [-6.1740, 106.7823, 0.65], [-6.1978, 106.7823, 0.70],
    [-6.2053, 106.7876, 0.67], [-6.1944, 106.7616, 0.62], [-6.2051, 106.7571, 0.58],
    [-6.1412, 106.7391, 0.48], [-6.1524, 106.7312, 0.45], [-6.1467, 106.7087, 0.40],
    [-6.1589, 106.7023, 0.38], [-6.1458, 106.7982, 0.62], [-6.1530, 106.8054, 0.60],
    [-6.1437, 106.8136, 0.66], [-6.1380, 106.8187, 0.64], [-6.1876, 106.7402, 0.54],
    [-6.2001, 106.7312, 0.50],
    // ===== JAKARTA TIMUR — Medium =====
    [-6.2150, 106.8697, 0.65], [-6.2230, 106.8756, 0.62], [-6.2050, 106.8619, 0.70],
    [-6.2120, 106.8588, 0.68], [-6.2433, 106.8697, 0.55], [-6.2561, 106.8756, 0.52],
    [-6.2340, 106.8989, 0.50], [-6.2410, 106.9056, 0.48], [-6.1952, 106.9289, 0.42],
    [-6.2076, 106.9354, 0.40], [-6.3121, 106.8989, 0.38], [-6.3245, 106.9012, 0.35],
    [-6.3245, 106.8601, 0.45], [-6.3387, 106.8654, 0.42], [-6.1877, 106.9034, 0.52],
    [-6.1940, 106.9123, 0.50], [-6.2676, 106.8489, 0.58], [-6.2789, 106.8612, 0.52],
    // ===== JAKARTA UTARA — Medium =====
    [-6.1245, 106.7983, 0.72], [-6.1176, 106.8007, 0.68], [-6.1098, 106.7876, 0.65],
    [-6.1540, 106.9012, 0.76], [-6.1623, 106.9089, 0.73], [-6.1467, 106.9145, 0.70],
    [-6.1312, 106.8756, 0.65], [-6.1412, 106.8820, 0.62], [-6.1087, 106.8820, 0.55],
    [-6.1012, 106.8901, 0.52], [-6.1098, 106.9289, 0.40], [-6.1176, 106.9367, 0.38],
    [-6.1312, 106.8513, 0.62], [-6.1390, 106.8576, 0.60], [-6.1176, 106.8989, 0.50],
    [-6.1254, 106.9056, 0.48],
];

function toggleHeatmap() {
    const btn    = document.getElementById('heatmapToggle');
    const legend = document.getElementById('heatmapLegend');

    if (!heatLayer) {
        heatLayer = L.heatLayer(HEATMAP_DATA, {
            radius:  38,
            blur:    28,
            maxZoom: 15,
            max:     1.0,
            gradient: {
                0.00: '#00d4ff',
                0.35: '#10b981',
                0.65: '#f59e0b',
                1.00: '#ef4444'
            }
        });
    }

    heatmapVisible = !heatmapVisible;

    if (heatmapVisible) {
        heatLayer.addTo(map);
        btn?.classList.add('active');
        legend?.classList.add('visible');
    } else {
        map.removeLayer(heatLayer);
        btn?.classList.remove('active');
        legend?.classList.remove('visible');
    }
}