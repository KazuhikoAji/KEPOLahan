// ============================================================
// CHART INSTANCE
// ============================================================
let strategicChart = null;

// ============================================================
// STEP INDICATOR
// ============================================================
function setStep(n) {
    document.querySelectorAll('.dash-step .step-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i + 1 === n);
    });
}

// ============================================================
// LOADING STATE - TOMBOL
// ============================================================
function showLoading(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
}

function hideLoading(button) {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-calculator"></i> Hitung Estimasi<div class="btn-shine"></div>';
}

// ============================================================
// PANEL LOKASI STRATEGIS - SKELETON LOADING
// ============================================================
function showStrategicLoading() {
    const panel = document.getElementById('strategicPanel');
    panel.style.display = 'block';

    const skCards = Array(6).fill(0).map(() => `
        <div class="sp-card">
            <div class="skeleton-box" style="width:36px;height:36px;border-radius:8px;flex-shrink:0"></div>
            <div class="sp-info" style="flex:1;display:flex;flex-direction:column;gap:6px">
                <div class="skeleton-line" style="width:55%;height:9px"></div>
                <div class="skeleton-line" style="width:80%;height:9px"></div>
                <div class="skeleton-line" style="width:38%;height:11px"></div>
            </div>
        </div>`).join('');

    panel.innerHTML = `
        <div class="sp-header" style="gap:0.7rem;margin-bottom:1.2rem;display:flex;align-items:center">
            <div class="skeleton-box" style="width:22px;height:22px;border-radius:50%"></div>
            <div class="skeleton-line" style="width:210px;height:15px;border-radius:8px"></div>
        </div>
        <div class="skeleton-line" style="width:250px;height:28px;border-radius:30px;margin-bottom:1rem"></div>
        <div class="sp-grid">${skCards}</div>
        <div class="skeleton-line" style="width:100%;height:10px;margin-top:1.2rem;border-radius:5px;opacity:0.5"></div>
    `;
}

// ============================================================
// PANEL LOKASI STRATEGIS - HASIL
// ============================================================
function showStrategicLocations(data) {
    const panel = document.getElementById('strategicPanel');
    const keys  = ['rumah_sakit', 'mall', 'polisi', 'ibadah', 'toll', 'sekolah'];

    const cards = keys.map(key => {
        const item = data[key];
        if (!item) return '';
        const d     = item.distance;
        const isFar = d > 5;
        const color = isFar ? '#ef4444' : d > 2 ? '#f59e0b' : '#10b981';
        const label = item.name && item.name !== item.category_name
            ? `<div class="sp-place-name" title="${item.name}">${item.name}</div>`
            : '';
        return `
            <div class="sp-card ${isFar ? 'sp-card--far' : ''}">
                <div class="sp-icon">${item.icon}</div>
                <div class="sp-info">
                    <div class="sp-cat">${item.category_name}</div>
                    ${label}
                    <div class="sp-dist" style="color:${color}">
                        <i class="fas fa-route"></i> ${d} km
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const jarak = data.jarak_pusat_kota
        ? `<div class="sp-pusat">
               <i class="fas fa-city"></i>
               Jarak ke pusat kota (Monas): <strong>${data.jarak_pusat_kota} km</strong>
           </div>`
        : '';

    const fallbackWarning = data.fallback
        ? `<div class="sp-fallback-warning">
               <i class="fas fa-exclamation-triangle"></i>
               <span>Data OpenStreetMap tidak tersedia. Menggunakan estimasi default.</span>
           </div>`
        : '';

    panel.innerHTML = `
        <div class="sp-header">
            <i class="fas fa-map-marked-alt"></i>
            <h3>Lokasi Strategis Terdekat</h3>
        </div>
        ${fallbackWarning}
        ${jarak}
        <div class="sp-grid">${cards}</div>
        <p class="sp-hint"><i class="fas fa-info-circle"></i>
            ${data.fallback 
                ? 'Data menggunakan estimasi default. Klik ulang lokasi nanti untuk hasil lebih akurat.'
                : 'Data diambil dari OpenStreetMap. Isi luas tanah lalu klik <strong>Hitung Estimasi</strong>.'}
        </p>
    `;

    // Update chart
    updateStrategicChart(data);
}

// ============================================================
// CHART: Jarak Lokasi Strategis (Spline Chart - Neon Gradient)
// ============================================================
function updateStrategicChart(data) {
    const canvas = document.getElementById('strategicChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = [];
    const distances = [];

    const keys = ['rumah_sakit', 'mall', 'polisi', 'ibadah', 'toll', 'sekolah'];
    const icons = ['🏥 RS', '🛒 Mall', '🚓 Polisi', '🕌 Ibadah', '🚗 Tol', '🏫 Sekolah'];

    keys.forEach((key, i) => {
        const item = data[key];
        if (!item) return;
        labels.push(icons[i]);
        distances.push(item.distance);
    });

    if (data.jarak_pusat_kota) {
        labels.push('🏛️ Monas');
        distances.push(data.jarak_pusat_kota);
    }

    if (strategicChart) strategicChart.destroy();

    // Create neon gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.parentElement.clientHeight || 300);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.35)');
    gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.15)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.02)');

    // Create border gradient
    const borderGradient = ctx.createLinearGradient(0, 0, canvas.parentElement.clientWidth || 400, 0);
    borderGradient.addColorStop(0, '#00d4ff');
    borderGradient.addColorStop(0.5, '#7c3aed');
    borderGradient.addColorStop(1, '#06b6d4');

    // Point colors based on distance
    const pointColors = distances.map(d => {
        if (d > 5) return '#ef4444';
        if (d > 2) return '#f59e0b';
        return '#00d4ff';
    });

    strategicChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jarak (km)',
                data: distances,
                fill: true,
                backgroundColor: gradient,
                borderColor: borderGradient,
                borderWidth: 3,
                tension: 0.4,  // Spline curve
                pointBackgroundColor: pointColors,
                pointBorderColor: pointColors,
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 10,
                pointHoverBorderWidth: 3,
                pointHoverBorderColor: '#fff',
                pointStyle: 'circle',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(6,11,24,0.95)',
                    borderColor: 'rgba(0,212,255,0.4)',
                    borderWidth: 1,
                    titleColor: '#00d4ff',
                    titleFont: { weight: 700, size: 12 },
                    bodyColor: '#e2e8f0',
                    bodyFont: { size: 13, weight: 600 },
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        label: c => `📏 ${c.parsed.y.toFixed(2)} km`,
                        afterLabel: c => {
                            const d = c.parsed.y;
                            if (d > 5) return '🔴 Jauh';
                            if (d > 2) return '🟡 Sedang';
                            return '🟢 Dekat';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#64748b', font: { size: 10, weight: 600 } },
                    grid: { color: 'rgba(0,212,255,0.04)', lineWidth: 1 },
                    border: { color: 'rgba(0,212,255,0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#64748b',
                        font: { size: 10 },
                        callback: v => v + ' km',
                        stepSize: 1
                    },
                    grid: { color: 'rgba(0,212,255,0.04)', lineWidth: 1 },
                    border: { color: 'rgba(0,212,255,0.1)' }
                }
            },
            elements: {
                line: { capBezierPoints: true }
            }
        }
    });

    // Show badge
    const badge = document.getElementById('chartBadge');
    const hint = document.getElementById('chartHint');
    if (badge) badge.style.display = 'flex';
    if (hint) hint.style.display = 'none';
}

// ============================================================
// PANEL LOKASI STRATEGIS - ERROR
// ============================================================
function showStrategicError(msg) {
    const isNetworkErr = !msg || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network') || msg.includes('HTTP ');
    
    const title = isNetworkErr ? "Backend Tidak Aktif" : "Gagal Mengambil Data";
    const desc = isNetworkErr 
        ? `<p>❌ Tidak dapat terhubung ke server Flask (<code>http://127.0.0.1:5000</code>).</p>
           <p style="margin-top:0.5rem">Jalankan perintah berikut di terminal <strong>folder backend</strong>:</p>
           <pre class="sp-cmd">cd backend\npython app.py</pre>
           <p style="margin-top:0.5rem;color:#64748b;font-size:0.78rem">
               Setelah server berjalan, klik ulang lokasi di peta.
           </p>`
        : `<p>❌ ${msg}</p>`;

    const panel = document.getElementById('strategicPanel');
    panel.innerHTML = `
        <div class="sp-header">
            <i class="fas fa-exclamation-triangle" style="color:#ef4444"></i>
            <h3 style="color:#ef4444">${title}</h3>
        </div>
        <div class="sp-backend-info">
            ${desc}
        </div>
    `;
    document.getElementById('calculateBtn').disabled = true;
}

// ============================================================
// TAMPILKAN HASIL HARGA
// ============================================================
function displayPriceResult(result, strategic, landArea) {
    document.getElementById('estimatedPrice').textContent =
        `Rp ${new Intl.NumberFormat('id-ID').format(result.final_price)}`;

    document.getElementById('pricePerMeter').textContent =
        `Rp ${new Intl.NumberFormat('id-ID').format(result.njop)} /m²`;

    document.getElementById('priceRange').textContent =
        `Faktor AI: ${result.faktor_ai}x`;

    const detail = document.getElementById('calculationDetail');
    detail.innerHTML = `
        <strong>📊 Detail Kalkulasi AI</strong>
        <ul>
            <li>🏙️ Wilayah: <b>${result.kota} – ${result.kecamatan} – ${result.kelurahan}</b></li>
            <li>📋 NJOP 2025: <b>Rp ${new Intl.NumberFormat('id-ID').format(result.njop)} /m²</b></li>
            <li>📐 Luas: <b>${new Intl.NumberFormat('id-ID').format(landArea)} m²</b></li>
            <li>🏠 Harga Dasar: <b>Rp ${new Intl.NumberFormat('id-ID').format(result.base_price)}</b></li>
            <li>🤖 Faktor AI: <b>${result.faktor_ai}×</b></li>
            <li>📏 Jarak Monas: <b>${strategic?.jarak_pusat_kota ?? '-'} km</b></li>
        </ul>
    `;

    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update mini result in left panel
    const miniResult = document.getElementById('miniResult');
    if (miniResult) {
        miniResult.style.display = 'block';
        document.getElementById('miniPrice').textContent = 
            `Rp ${new Intl.NumberFormat('id-ID').format(result.final_price)}`;
        document.getElementById('miniNjop').textContent = 
            `Rp ${new Intl.NumberFormat('id-ID').format(result.njop)}/m²`;
        document.getElementById('miniFaktor').textContent = `${result.faktor_ai}×`;
    }
}