from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import requests
import math
import time
import threading
import webbrowser

import os

# Set static folder to the frontend folder
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

# ============================================================
# LOAD MODEL & ENCODER
# ============================================================
model       = joblib.load("model/model_faktor_strategis.pkl")
le_kota     = joblib.load("model/encoder_kota.pkl")
le_kecamatan = joblib.load("model/encoder_kecamatan.pkl")
le_kelurahan = joblib.load("model/encoder_kelurahan.pkl")

# ============================================================
# LOAD DATASET NJOP
# ============================================================
df = pd.read_csv("DataSetTraining.csv", sep=';')
df['NilaiNJOP2025'] = (
    df['NilaiNJOP2025']
    .astype(str)
    .str.replace(',', '.', regex=False)
    .astype(float)
)

# ============================================================
# KONSTANTA
# ============================================================
OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
OVERPASS_TIMEOUT = 45       # detik per request
OVERPASS_RETRY_DELAY = 2    # detik jeda antar mirror
MONAS_LAT      = -6.1754
MONAS_LON      = 106.8272
SEARCH_RADIUS  = 5000  # 5 km (lebih kecil = lebih cepat)

CATEGORIES_INFO = {
    'rumah_sakit': {'name': 'Rumah Sakit & Medis',       'icon': '🏥'},
    'mall':        {'name': 'Pusat Belanja & Pasar',      'icon': '🛒'},
    'polisi':      {'name': 'Keamanan & Layanan Publik',  'icon': '🚓'},
    'ibadah':      {'name': 'Tempat Ibadah',              'icon': '🕌'},
    'toll':        {'name': 'Akses Jalan Tol',            'icon': '🚗'},
    'sekolah':     {'name': 'Pendidikan',                 'icon': '🏫'},
}

AMENITY_MAP = {
    'hospital': 'rumah_sakit', 'clinic': 'rumah_sakit',
    'police':   'polisi',
    'place_of_worship': 'ibadah',
    'school': 'sekolah', 'university': 'sekolah', 'college': 'sekolah',
}
SHOP_MAP = {
    'mall': 'mall', 'supermarket': 'mall', 'department_store': 'mall',
}

# ============================================================
# HELPER: Haversine
# ============================================================
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a  = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(a))

# ============================================================
# CACHE & ENDPOINT: /strategic-locations
# ============================================================
strategic_cache = {}
geocode_cache = {}

@app.route('/strategic-locations', methods=['GET'])
def strategic_locations():
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lng'))
    except (TypeError, ValueError):
        return jsonify({'error': 'lat dan lng harus berupa angka'}), 400

    cache_key = f"{round(lat, 3)}_{round(lon, 3)}"
    if cache_key in strategic_cache:
        print(f"[Cache] Hit for strategic locations: {cache_key}")
        return jsonify(strategic_cache[cache_key])

    jarak_pusat_kota = haversine(lat, lon, MONAS_LAT, MONAS_LON)

    query = f"""
    [out:json][timeout:{OVERPASS_TIMEOUT}];
    (
      node["amenity"~"^(hospital|clinic|police|place_of_worship|school|university|college)$"](around:{SEARCH_RADIUS},{lat},{lon});
      way["amenity"~"^(hospital|clinic|police|place_of_worship|school|university|college)$"](around:{SEARCH_RADIUS},{lat},{lon});
      node["shop"~"^(mall|supermarket|department_store)$"](around:{SEARCH_RADIUS},{lat},{lon});
      way["shop"~"^(mall|supermarket|department_store)$"](around:{SEARCH_RADIUS},{lat},{lon});
      node["highway"="motorway_junction"](around:{SEARCH_RADIUS},{lat},{lon});
      node["barrier"="toll_booth"](around:{SEARCH_RADIUS},{lat},{lon});
      way["barrier"="toll_booth"](around:{SEARCH_RADIUS},{lat},{lon});
    );
    out center qt;
    """

    nearest = {k: {'distance': float('inf'), 'name': '', 'lat': None, 'lon': None}
               for k in CATEGORIES_INFO}

    # ---- Query Overpass (coba tiap mirror sampai berhasil, dengan retry) ----
    elements = None
    headers = {'User-Agent': 'KepoLahanApp/1.4 (contact@kepolahan.com)'}
    
    for attempt in range(2):  # 2 putaran retry
        for mirror_url in OVERPASS_MIRRORS:
            try:
                print(f"[Overpass] Attempt {attempt+1}, trying {mirror_url}...")
                resp = requests.post(
                    mirror_url,
                    data={'data': query},
                    headers=headers,
                    timeout=OVERPASS_TIMEOUT
                )
                # Pastikan respons adalah JSON valid (bukan HTML error)
                ct = resp.headers.get('Content-Type', '')
                if resp.status_code == 429:
                    print(f"[Overpass] {mirror_url} -> Rate limited (429), waiting...")
                    time.sleep(OVERPASS_RETRY_DELAY * 2)
                    continue
                if resp.status_code != 200 or 'html' in ct.lower():
                    print(f"[Overpass] {mirror_url} -> HTTP {resp.status_code}, skip")
                    continue
                data = resp.json()
                elements = data.get('elements', [])
                print(f"[Overpass] {mirror_url} -> OK, {len(elements)} elemen")
                break
            except requests.exceptions.Timeout:
                print(f"[Overpass] {mirror_url} -> TIMEOUT after {OVERPASS_TIMEOUT}s")
                continue
            except Exception as e:
                print(f"[Overpass] {mirror_url} -> ERROR: {e}")
                continue
        
        if elements is not None:
            break
        
        # Jeda sebelum retry putaran berikutnya
        if attempt < 1:
            print(f"[Overpass] All mirrors failed, retrying in {OVERPASS_RETRY_DELAY}s...")
            time.sleep(OVERPASS_RETRY_DELAY)

    # ---- Fallback jika semua mirror gagal: gunakan estimasi default ----
    fallback_used = False
    if elements is None:
        print("[Overpass] All mirrors failed. Using fallback default distances.")
        elements = []  # proses dengan data kosong → semua jarak jadi default 10 km
        fallback_used = True

    # ---- Proses semua elemen yang ditemukan ----
    for el in elements:
        tags    = el.get('tags', {})
        el_lat  = el.get('lat') or el.get('center', {}).get('lat')
        el_lon  = el.get('lon') or el.get('center', {}).get('lon')
        if not el_lat or not el_lon:
            continue

        d   = haversine(lat, lon, el_lat, el_lon)
        cat = None

        amenity = tags.get('amenity', '')
        shop    = tags.get('shop', '')
        highway = tags.get('highway', '')
        barrier = tags.get('barrier', '')

        if amenity in AMENITY_MAP:
            cat = AMENITY_MAP[amenity]
        elif shop in SHOP_MAP:
            cat = SHOP_MAP[shop]
        elif highway == 'motorway_junction' or barrier == 'toll_booth':
            cat = 'toll'

        if cat and d < nearest[cat]['distance']:
            nearest[cat] = {
                'distance': d,
                'name':     tags.get('name', '') or CATEGORIES_INFO[cat]['name'],
                'lat':      el_lat,
                'lon':      el_lon,
            }

    result = {'jarak_pusat_kota': round(jarak_pusat_kota, 2), 'fallback': fallback_used}
    for key, info in CATEGORIES_INFO.items():
        item = nearest[key]
        dist = item['distance'] if item['distance'] != float('inf') else 10.0
        result[key] = {
            'distance':      round(dist, 2),
            'name':          item['name'] or info['name'],
            'lat':           item['lat'],
            'lon':           item['lon'],
            'category_name': info['name'],
            'icon':          info['icon'],
        }

    strategic_cache[cache_key] = result
    return jsonify(result)

# ============================================================
# ENDPOINT: /reverse-geocode
# ============================================================
@app.route('/reverse-geocode', methods=['GET'])
def reverse_geocode():
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lng'))
    except (TypeError, ValueError):
        return jsonify({'kota': 'Unknown', 'kecamatan': 'Unknown', 'kelurahan': 'Unknown'})

    cache_key = f"{round(lat, 3)}_{round(lon, 3)}"
    if cache_key in geocode_cache:
        print(f"[Cache] Hit for reverse geocode: {cache_key}")
        return jsonify(geocode_cache[cache_key])

    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    headers = {
        'User-Agent': 'KepoLahanApp/1.4 (contact@kepolahan.com)'
    }
    
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        data = resp.json()
        address = data.get('address', {})
        result = {
            'kota': (address.get('city') or address.get('county') or 
                     address.get('state_district') or address.get('town') or 'Tidak Diketahui'),
            
            'kecamatan': (address.get('suburb') or address.get('city_district') or 
                          address.get('district') or address.get('borough') or 'Tidak Diketahui'),
            
            'kelurahan': (address.get('village') or address.get('neighbourhood') or 
                          address.get('quarter') or address.get('hamlet') or 
                          address.get('residential') or 'Tidak Diketahui')
        }
        geocode_cache[cache_key] = result
        return jsonify(result)
    except Exception as e:
        print(f"[Nominatim] ERROR: {e}")
        return jsonify({'kota': 'Unknown', 'kecamatan': 'Unknown', 'kelurahan': 'Unknown'})

# ============================================================
# ENDPOINT: /predict
# ============================================================
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    kota        = data['kota']
    kecamatan   = data['kecamatan']
    kelurahan   = data['kelurahan']
    luas        = float(data['luas'])
    rumah_sakit = float(data['rumah_sakit'])
    sekolah     = float(data['sekolah'])
    mall        = float(data['mall'])
    polisi      = float(data['polisi'])
    ibadah      = float(data['ibadah'])
    toll        = float(data['toll'])
    jarak_pusat_kota = float(data['jarak_pusat_kota'])

    # ---- Cari NJOP (berjenjang dari kelurahan -> kecamatan -> kota) ----
    njop = float('nan')

    # 1. Level Kelurahan (harus cocok kota, kecamatan, kelurahan)
    mask_kel = (
        (df['Kota'].astype(str).str.strip().str.lower() == kota.strip().lower()) &
        (df['Kecamatan'].astype(str).str.strip().str.lower() == kecamatan.strip().lower()) &
        (df['Kelurahan'].astype(str).str.strip().str.lower() == kelurahan.strip().lower())
    )
    njop = df[mask_kel]['NilaiNJOP2025'].mean()

    # 2. Level Kecamatan (harus cocok kota, kecamatan)
    if pd.isna(njop):
        mask_kec = (
            (df['Kota'].astype(str).str.strip().str.lower() == kota.strip().lower()) &
            (df['Kecamatan'].astype(str).str.strip().str.lower() == kecamatan.strip().lower())
        )
        njop = df[mask_kec]['NilaiNJOP2025'].mean()

    # 3. Level Kota
    if pd.isna(njop):
        mask_kota = (df['Kota'].astype(str).str.strip().str.lower() == kota.strip().lower())
        njop = df[mask_kota]['NilaiNJOP2025'].mean()

    # 4. Fallback Default
    if pd.isna(njop):
        njop = 5_000_000

    # ---- Encoding (fallback 0 jika label tidak dikenal) ----
    def safe_encode(encoder, value):
        try:
            return encoder.transform([value])[0]
        except Exception:
            return 0

    kota_encoded       = safe_encode(le_kota,       kota)
    kecamatan_encoded  = safe_encode(le_kecamatan,  kecamatan)
    kelurahan_encoded  = safe_encode(le_kelurahan,  kelurahan)

    # ---- Prediksi ----
    X = [[kota_encoded, kecamatan_encoded, kelurahan_encoded,
          luas, jarak_pusat_kota,
          rumah_sakit, sekolah, mall, polisi, ibadah, toll]]

    faktor_ai   = model.predict(X)[0]
    base_price  = njop * luas
    final_price = base_price * faktor_ai

    return jsonify({
        'njop':        round(njop),
        'faktor_ai':   round(faktor_ai, 3),
        'base_price':  round(base_price),
        'final_price': round(final_price),
        'kota':        kota,
        'kecamatan':   kecamatan,
        'kelurahan':   kelurahan,
    })

# ============================================================
if __name__ == '__main__':
    url = 'http://127.0.0.1:5000'
    # Buka browser 1.5 detik setelah server mulai (beri waktu Flask bind port)
    threading.Timer(1.5, lambda: webbrowser.open(url)).start()
    print(f"\n🚀 Server berjalan → membuka browser ke {url} ...\n")
    app.run(debug=True, use_reloader=False)