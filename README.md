# INDONESIA
# KEPOLAHAN 2.0 (Estimasi Harga Lahan Berbasis Spasial)

KEPOLAHAN adalah sebuah aplikasi web interaktif yang memadukan Sistem Informasi Geografis (GIS) dengan *Machine Learning*. Aplikasi ini dirancang untuk memprediksi dan mengestimasi harga lahan di suatu wilayah secara cerdas berdasarkan data spasial dan faktor strategis lainnya.

## 🚀 Fitur Utama
* **Peta Interaktif:** Visualisasi lokasi lahan menggunakan Leaflet.js yang responsif.
* **Prediksi Cerdas:** Memanfaatkan algoritma **Random Forest** untuk memberikan estimasi harga tanah yang akurat berdasarkan *dataset* historis.
* **Arsitektur Terpisah:** Menggunakan pendekatan *Client-Server* dengan pemisahan antara antarmuka (*Frontend*) dan logika pemrosesan data (*Backend*).

## 🛠️ Teknologi yang Digunakan
**Frontend:**
* HTML5, CSS3, JavaScript
* API Integrations (Fetch API)
* Spatial Mapping (Leaflet.js / Overpass API)

**Backend & Machine Learning:**
* Python
* Flask / Web Framework (sebagai penghubung API)
* Scikit-Learn (Random Forest Regressor)
* Pandas & NumPy (Pemrosesan Dataset)

## 📁 Struktur Direktori
Project ini dibagi menjadi dua bagian utama agar lebih terorganisir:
* `/backend` - Berisi logika server, pemrosesan *dataset* (CSV), model *Machine Learning* (.pkl), dan skrip *training*.
* `/frontend` - Berisi aset visual, tata letak antarmuka (HTML/CSS), dan skrip interaksi peta (JavaScript).

## 💻 Cara Menjalankan Aplikasi Secara Lokal

Cara menggunakan:
1. buka file app.py
2. buka terminal -> install flask-CORS pada terminal. ketik:
   pip install flask-cors
3. pindah directory ke backend. ketik:
   cd backend
   pip install -r requirements.txt
4. jalankan app.py di terminal. ketik:
   python app.py
   Server backend akan berjalan, biasanya di http://localhost:5000

1. **Clone Repository**

```bash

git clone [https://github.com/KazuhikoAji/KEPOLahan.git](https://github.com/KazuhikoAji/KEPOLahan.git)
cd KEPOLahan

📌 Status Project
Project ini dikembangkan sebagai pemenuhan Tugas Akhir / UAS Kecerdasan Buatan dan akan terus disempurnakan.

Dibuat dengan html, css, javascript dan Python.

#ENGLISH
#KEPOLAHAN 2.0 (Spatial-Based Land Price Estimation)

KEPOLAHAN is an interactive web application that combines Geographic Information Systems (GIS) with Machine Learning. This application is designed to intelligently predict and estimate land prices in an area based on spatial data and other strategic factors.

## 🚀 Key Features
* Interactive Map: Visualizes land locations using responsive Leaflet.js.
* Intelligent Prediction: Utilizes the Random Forest algorithm to provide accurate land price estimates based on historical datasets.
* Split Architecture: Utilizes a Client-Server approach with a separation between the interface (Frontend) and data processing logic (Backend).

## 🛠️ Technologies Used
**Frontend:**
* HTML5, CSS3, JavaScript
* API Integrations (Fetch API)
* Spatial Mapping (Leaflet.js / Overpass API)

**Backend & Machine Learning:**
* Python
* Flask / Web Framework (as API interface)
* Scikit-Learn (Random Forest Regressor)
* Pandas & NumPy (Dataset Processing)

## 📁 Directory Structure
This project is divided into two main sections for better organization:
* `/backend` - Contains server logic, dataset (CSV) processing, Machine Learning models (.pkl), and training scripts.
* `/frontend` - Contains visual assets, interface layout (HTML/CSS), and map interaction scripts (JavaScript).

## 💻 How to Run the Application Locally

How to use:
1. Open the app.py file
2. Open a terminal -> install flask-CORS in the terminal. Type:
   pip install flask-cors
3. Change directory to the backend. Type:
   cd backend
   pip install -r requirements.txt
4. Run app.py in the terminal. Type:
   python app.py
   The backend server will be running, usually at http://localhost:5000

1. **Clone Repository**

```bash

git clone [https://github.com/KazuhikoAji/KEPOLahan.git](https://github.com/KazuhikoAji/KEPOLahan.git)
cd KEPOLahan

📌 Project Status
This project was developed to fulfill the Artificial Intelligence Final Assignment and will continue to be refined.

It was created using HTML, CSS, JavaScript, and Python.