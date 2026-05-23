// ============================================================
// PDF EXPORT — KEPOLahan  (emoji-free, ASCII-safe)
// ============================================================

// Ikon kategori sebagai kotak berwarna kecil (tidak pakai emoji)
const SKEY_COLORS = {
    rumah_sakit: [239, 68,  68],   // merah
    mall:        [124, 58,  237],  // ungu
    polisi:      [59,  130, 246],  // biru
    ibadah:      [245, 158, 11],   // amber
    toll:        [107, 114, 128],  // abu
    sekolah:     [16,  185, 129],  // hijau
};
const SKEY_ABBR = {
    rumah_sakit: 'RS',
    mall:        'MLR',
    polisi:      'POL',
    ibadah:      'IBD',
    toll:        'TOL',
    sekolah:     'SKL',
};

async function exportPDF() {
    const btn = document.getElementById('exportPdfBtn');
    if (!btn) return;
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat PDF...';
    btn.disabled = true;

    try {
        if (!window.jspdf) throw new Error('Library jsPDF belum dimuat, coba refresh halaman.');
        const { jsPDF } = window.jspdf;

        const pdfData = window._kepoPdfData;
        if (!pdfData?.result) throw new Error('Data estimasi tidak tersedia. Lakukan kalkulasi terlebih dahulu.');
        const { result, strategic, landArea } = pdfData;

        const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const PW     = 210;
        const MARGIN = 18;
        const CW     = PW - MARGIN * 2;
        let y = 0;

        // ── Gradient Header ──────────────────────────────────────
        const STEPS = 42;
        for (let i = 0; i < STEPS; i++) {
            const t = i / (STEPS - 1);
            doc.setFillColor(
                Math.round((1 - t) * 0   + t * 124),
                Math.round((1 - t) * 212 + t * 58),
                Math.round((1 - t) * 255 + t * 237)
            );
            doc.rect(i * PW / STEPS, 0, PW / STEPS + 0.5, 22, 'F');
        }
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('KEPO', MARGIN, 14);
        doc.setTextColor(200, 255, 255);
        doc.text('Lahan', MARGIN + 21, 14);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text('Laporan Estimasi Harga Tanah', PW - MARGIN, 9, { align: 'right' });
        doc.text(
            new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            PW - MARGIN, 16, { align: 'right' }
        );

        y = 30;

        // ── Location Box ─────────────────────────────────────────
        doc.setFillColor(8, 12, 28);
        doc.setDrawColor(0, 212, 255);
        doc.setLineWidth(0.4);
        doc.roundedRect(MARGIN, y, CW, 30, 3, 3, 'FD');
        doc.setFillColor(0, 212, 255);
        doc.rect(MARGIN, y, 3, 30, 'F');

        doc.setTextColor(0, 212, 255);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text('LOKASI TANAH', MARGIN + 8, y + 9);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(sanitize(result.kota || 'DKI Jakarta'), MARGIN + 8, y + 18);

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            sanitize(result.kecamatan || '-') + '  >  ' + sanitize(result.kelurahan || '-'),
            MARGIN + 8, y + 25
        );

        if (typeof userLatLng !== 'undefined' && userLatLng) {
            doc.setTextColor(71, 85, 105);
            doc.setFontSize(7);
            doc.text(
                `${userLatLng[0].toFixed(6)},  ${userLatLng[1].toFixed(6)}`,
                PW - MARGIN - 6, y + 18, { align: 'right' }
            );
            doc.setFontSize(6);
            doc.text('koordinat GPS', PW - MARGIN - 6, y + 25, { align: 'right' });
        }
        y += 38;

        // ── Big Price ─────────────────────────────────────────────
        doc.setFillColor(0, 212, 255);
        doc.rect(MARGIN, y, 3, 22, 'F');

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('ESTIMASI HARGA TOTAL', MARGIN + 8, y + 7);

        doc.setTextColor(0, 212, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(
            'Rp ' + new Intl.NumberFormat('id-ID').format(result.final_price),
            MARGIN + 8, y + 19
        );
        y += 30;

        // ── Detail Grid (3 x 2) ───────────────────────────────────
        const hargaPerM2 = landArea > 0 ? Math.round(result.final_price / landArea) : result.njop;
        const detailItems = [
            ['NJOP 2025 /m2',  'Rp ' + new Intl.NumberFormat('id-ID').format(result.njop)],
            ['Luas Tanah',     new Intl.NumberFormat('id-ID').format(landArea) + ' m2'],
            ['Harga Dasar',    'Rp ' + new Intl.NumberFormat('id-ID').format(result.base_price)],
            ['Faktor AI',      result.faktor_ai + 'x'],
            ['Harga /m2',      'Rp ' + new Intl.NumberFormat('id-ID').format(hargaPerM2)],
            ['Akurasi Model',  'R2 = 0.92 (92%)'],
        ];
        const COL3 = CW / 3;
        detailItems.forEach(([lbl, val], idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const bx  = MARGIN + col * COL3;
            const by  = y + row * 20;

            doc.setFillColor(10, 14, 32);
            doc.setDrawColor(25, 35, 65);
            doc.setLineWidth(0.3);
            doc.roundedRect(bx, by, COL3 - 2, 17, 2, 2, 'FD');

            doc.setTextColor(71, 85, 105);
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.text(lbl.toUpperCase(), bx + 4, by + 6);

            doc.setTextColor(226, 232, 240);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.text(sanitize(val), bx + 4, by + 13);
        });
        y += 46;

        // ── Strategic Distances ──────────────────────────────────
        doc.setTextColor(0, 212, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('JARAK LOKASI STRATEGIS', MARGIN, y);
        doc.setDrawColor(0, 212, 255);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, y + 2, PW - MARGIN, y + 2);
        y += 8;

        const SKEYS   = ['rumah_sakit', 'mall', 'polisi', 'ibadah', 'toll', 'sekolah'];
        const SLABELS = ['Rumah Sakit', 'Mall / Perbelanjaan', 'Polsek / Polres',
                         'Tempat Ibadah', 'Pintu Tol', 'Sekolah'];

        if (strategic) {
            const COL2 = CW / 2;
            SKEYS.forEach((key, idx) => {
                const item = strategic[key];
                if (!item) return;

                const col = idx % 2;
                const row = Math.floor(idx / 2);
                const bx  = MARGIN + col * COL2;
                const by  = y + row * 18;

                doc.setFillColor(10, 14, 32);
                doc.setDrawColor(25, 35, 65);
                doc.setLineWidth(0.3);
                doc.roundedRect(bx, by, COL2 - 3, 15, 2, 2, 'FD');

                // Kotak warna sebagai ikon pengganti emoji
                const [ir, ig, ib] = SKEY_COLORS[key] || [100, 116, 139];
                doc.setFillColor(ir, ig, ib);
                doc.roundedRect(bx + 3, by + 3.5, 8, 8, 1.5, 1.5, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(4.5);
                doc.setFont('helvetica', 'bold');
                doc.text(SKEY_ABBR[key] || '', bx + 7, by + 8.5, { align: 'center' });

                // Label kategori
                doc.setTextColor(100, 116, 139);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.text(SLABELS[idx], bx + 14, by + 7);

                // Nama tempat (jika ada)
                if (item.name && item.name !== item.category_name) {
                    doc.setTextColor(71, 85, 105);
                    doc.setFontSize(5.5);
                    const nm = sanitize(item.name.length > 30
                        ? item.name.substring(0, 30) + '...'
                        : item.name);
                    doc.text(nm, bx + 14, by + 12);
                }

                // Jarak
                const d = item.distance;
                const [cr, cg, cb] = d > 5 ? [239, 68, 68] : d > 2 ? [245, 158, 11] : [16, 185, 129];
                doc.setTextColor(cr, cg, cb);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text(d + ' km', bx + COL2 - 8, by + 10, { align: 'right' });
            });

            y += Math.ceil(SKEYS.length / 2) * 18 + 4;

            // Jarak Monas — tanpa emoji, pakai prefix teks biasa
            if (strategic.jarak_pusat_kota) {
                doc.setFillColor(0, 20, 40);
                doc.setDrawColor(0, 80, 110);
                doc.setLineWidth(0.3);
                doc.roundedRect(MARGIN, y, CW, 11, 2, 2, 'FD');

                // Ikon kotak cyan untuk Monas
                doc.setFillColor(0, 212, 255);
                doc.roundedRect(MARGIN + 3, y + 2, 8, 7, 1, 1, 'F');
                doc.setTextColor(6, 11, 24);
                doc.setFontSize(4.5);
                doc.setFont('helvetica', 'bold');
                doc.text('MON', MARGIN + 7, y + 6.5, { align: 'center' });

                doc.setTextColor(100, 116, 139);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.text('Jarak ke Pusat Kota (Monas)', MARGIN + 14, y + 7.5);

                doc.setTextColor(0, 212, 255);
                doc.setFont('helvetica', 'bold');
                doc.text(strategic.jarak_pusat_kota + ' km', PW - MARGIN - 4, y + 7.5, { align: 'right' });
                y += 17;
            }
        }

        // ── Chart Image ──────────────────────────────────────────
        const chartCanvas = document.getElementById('strategicChart');
        if (chartCanvas && chartCanvas.width > 10) {
            try {
                if (y + 55 > 278) { doc.addPage(); y = 20; }
                const chartImg = chartCanvas.toDataURL('image/png', 1.0);
                doc.addImage(chartImg, 'PNG', MARGIN, y, CW, 52);
                y += 58;
            } catch (chartErr) {
                console.warn('[PDF] Chart embed skipped:', chartErr);
            }
        }

        // ── Gradient Footer Line ──────────────────────────────────
        const FY = 284;
        for (let i = 0; i < 20; i++) {
            const t = i / 19;
            doc.setDrawColor(
                Math.round((1 - t) * 0   + t * 124),
                Math.round((1 - t) * 212 + t * 58),
                Math.round((1 - t) * 255 + t * 237)
            );
            doc.setLineWidth(0.5);
            doc.line(MARGIN + i * CW / 20, FY, MARGIN + (i + 1) * CW / 20, FY);
        }
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(
            'KEPOLahan  -  AI Random Forest (R2 0.92)  -  Data NJOP 2025 DKI Jakarta',
            PW / 2, FY + 6, { align: 'center' }
        );
        doc.text(
            'Dicetak: ' + new Date().toLocaleString('id-ID'),
            PW / 2, FY + 11, { align: 'center' }
        );

        // ── Save ─────────────────────────────────────────────────
        const kelurahan = (result.kelurahan || 'lokasi').replace(/\s+/g, '_');
        const dateStr   = new Date().toISOString().slice(0, 10);
        doc.save('KEPOLahan_' + kelurahan + '_' + dateStr + '.pdf');

    } catch (err) {
        console.error('[Export PDF]', err);
        alert('Gagal mengekspor PDF: ' + err.message);
    } finally {
        btn.innerHTML = origHTML;
        btn.disabled  = false;
    }
}

// Bersihkan karakter non-ASCII agar tidak rusak di PDF
function sanitize(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str
        .replace(/[\u2019\u2018]/g, "'")   // curly apostrophe
        .replace(/[\u201C\u201D]/g, '"')   // curly quotes
        .replace(/\u2013/g, '-')           // en-dash
        .replace(/\u2014/g, '--')          // em-dash
        .replace(/\u2026/g, '...')         // ellipsis
        .replace(/\u00D7/g, 'x')           // ×
        .replace(/\u00B2/g, '2')           // ²
        .replace(/[^\x00-\x7F]/g, '?');    // karakter lain yang tidak dikenal
}
