document.addEventListener('DOMContentLoaded', () => {
    initMap();
    document.getElementById('calculateBtn').addEventListener('click', calculatePrice);
    initHeroParticles();
    initScrollReveal();
});

// ============================================================
// GLOBAL CANVAS PARTICLES (fullscreen, follows mouse anywhere)
// ============================================================
function initHeroParticles() {
    const canvas = document.getElementById('globalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const count = 100;

    // Mouse tracking — global, follows cursor across entire page
    const mouse = { x: -9999, y: -9999, active: false };
    const MOUSE_RADIUS   = 180;
    const REPULSE_RADIUS = 90;
    const REPULSE_FORCE  = 3.5;

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    window.addEventListener('mouseleave', () => {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawnParticle() {
        return {
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            r:     Math.random() * 1.8 + 0.5,
            dx:    (Math.random() - 0.5) * 0.5,
            dy:    (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.4 + 0.15
        };
    }

    for (let i = 0; i < count; i++) particles.push(spawnParticle());

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Update & draw particles ---
        particles.forEach(p => {
            // Repulsion from mouse
            const mdx   = p.x - mouse.x;
            const mdy   = p.y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mouse.active && mdist < REPULSE_RADIUS && mdist > 0) {
                const force = (REPULSE_RADIUS - mdist) / REPULSE_RADIUS * REPULSE_FORCE;
                p.x += (mdx / mdist) * force;
                p.y += (mdy / mdist) * force;
            }

            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,212,255,${p.alpha})`;
            ctx.fill();
        });

        // --- Connections between particles ---
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,212,255,${0.07 * (1 - dist / 130)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // --- Mouse interactions ---
        if (mouse.active) {
            particles.forEach(p => {
                const dx   = p.x - mouse.x;
                const dy   = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS) {
                    const strength = 1 - dist / MOUSE_RADIUS;

                    // Gradient line: mouse → particle
                    const grad = ctx.createLinearGradient(mouse.x, mouse.y, p.x, p.y);
                    grad.addColorStop(0, `rgba(0,212,255,${0.6 * strength})`);
                    grad.addColorStop(1, `rgba(124,58,237,${0.15 * strength})`);

                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth   = 1.3 * strength;
                    ctx.stroke();

                    // Bright glow on close particles
                    if (dist < 55) {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(0,212,255,${0.65 * strength})`;
                        ctx.fill();
                    }
                }
            });

            // Glowing aura around cursor
            const aura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 22);
            aura.addColorStop(0,   'rgba(0,212,255,0.50)');
            aura.addColorStop(0.4, 'rgba(0,212,255,0.15)');
            aura.addColorStop(1,   'rgba(0,212,255,0)');
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
            ctx.fillStyle = aura;
            ctx.fill();

            // Core cursor dot
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,212,255,0.95)';
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    draw();
}

// ============================================================
// SCROLL REVEAL
// ============================================================
function initScrollReveal() {
    const els = document.querySelectorAll('.feature-card, .section-header, .steps-bar, .calc-content');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        obs.observe(el);
    });
}

// ============================================================
// HITUNG HARGA
// ============================================================
async function calculatePrice() {
    const button = document.getElementById('calculateBtn');
    showLoading(button);

    try {
        const landArea = parseFloat(document.getElementById('landArea').value);

        if (!landArea || landArea <= 0) {
            alert('Masukkan luas tanah yang valid (lebih dari 0 m²)');
            hideLoading(button);
            return;
        }

        if (!userLatLng) {
            alert('Pilih lokasi di peta terlebih dahulu');
            hideLoading(button);
            return;
        }

        const [lat, lng] = userLatLng;

        // Reverse geocoding via Nominatim
        const wilayah = await reverseGeocode(lat, lng);

        // Bangun payload AI dari data lokasi strategis nyata
        const payload = {
            kota:             wilayah.kota,
            kecamatan:        wilayah.kecamatan,
            kelurahan:        wilayah.kelurahan,
            luas:             landArea,
            rumah_sakit:      strategicLocations['rumah_sakit']?.distance ?? 5,
            sekolah:          strategicLocations['sekolah']?.distance     ?? 5,
            mall:             strategicLocations['mall']?.distance         ?? 5,
            polisi:           strategicLocations['polisi']?.distance       ?? 5,
            ibadah:           strategicLocations['ibadah']?.distance       ?? 5,
            toll:             strategicLocations['toll']?.distance         ?? 5,
            jarak_pusat_kota: strategicLocations.jarak_pusat_kota         ?? 10,
        };

        const result = await predictLandPrice(payload);
        displayPriceResult(result, strategicLocations, landArea);

        // Simpan data untuk ekspor PDF
        window._kepoPdfData = { result, strategic: strategicLocations, landArea };

    } catch (err) {
        console.error('[Calculate] Error:', err);
        alert('Terjadi kesalahan: ' + err.message);
    }

    hideLoading(button);
}