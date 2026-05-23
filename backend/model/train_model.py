import pandas as pd
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder

print("PROGRAM BERJALAN")

# =========================
# LOAD DATASET
# =========================

df = pd.read_csv("../DataSetTraining.csv", sep=';')

print("DATASET BERHASIL DIBACA")
print(df.head())

# =========================
# KONVERSI FORMAT ANGKA
# =========================

numeric_columns = [
    'NilaiNJOP2025',
    'JarakPusatKota',
    'LuasTanah',
    'RumahSakit',
    'Sekolah',
    'Mall',
    'Polisi',
    'Ibadah',
    'Toll'
]

for col in numeric_columns:
    df[col] = (
        df[col]
        .astype(str)
        .str.replace(',', '.', regex=False)
        .astype(float)
    )

print("\nDATASET SETELAH KONVERSI:")
print(df[numeric_columns].head())

# =========================
# ENCODING DATA TEKS
# =========================

print("\nMELAKUKAN LABEL ENCODING...")

le_kota = LabelEncoder()
le_kecamatan = LabelEncoder()
le_kelurahan = LabelEncoder()

df['Kota_Encoded'] = le_kota.fit_transform(df['Kota'])
df['Kecamatan_Encoded'] = le_kecamatan.fit_transform(df['Kecamatan'])
df['Kelurahan_Encoded'] = le_kelurahan.fit_transform(df['Kelurahan'])

print("ENCODING BERHASIL")

# =========================
# MEMBUAT TARGET AI
# =========================
# AI hanya belajar faktor kenaikan harga
# BUKAN harga total tanah

print("\nMEMBUAT TARGET FAKTOR STRATEGIS...")
pusat_factor = (1 / (df['JarakPusatKota'] + 1)) * 0.25
mall_factor = (1 / (df['Mall'] + 1)) * 0.20
toll_factor = (1 / (df['Toll'] + 1)) * 0.25
rs_factor = (1 / (df['RumahSakit'] + 1)) * 0.10
school_factor = (1 / (df['Sekolah'] + 1)) * 0.10
police_factor = (1 / (df['Polisi'] + 1)) * 0.05
ibadah_factor = (1 / (df['Ibadah'] + 1)) * 0.05

# TARGET AI

df['FaktorStrategis'] = (
    1
    + pusat_factor
    + mall_factor
    + toll_factor
    + rs_factor
    + school_factor
    + police_factor
    + ibadah_factor
)

print("\nCONTOH TARGET AI:")
print(df['FaktorStrategis'].head())

# =========================
# FITUR (INPUT)
# =========================

X = df[[
    'Kota_Encoded',
    'Kecamatan_Encoded',
    'Kelurahan_Encoded',
    'LuasTanah',
    'JarakPusatKota',
    'RumahSakit',
    'Sekolah',
    'Mall',
    'Polisi',
    'Ibadah',
    'Toll'
]]

# =========================
# TARGET (OUTPUT)
# =========================
# AI belajar faktor strategis

y = df['FaktorStrategis']

# =========================
# SPLIT DATA
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nJUMLAH DATA TRAINING:", len(X_train))
print("JUMLAH DATA TESTING :", len(X_test))

# =========================
# RANDOM FOREST MODEL
# =========================

model = RandomForestRegressor(
    n_estimators=500,
    max_depth=25,
    min_samples_split=3,
    min_samples_leaf=1,
    random_state=42,
    n_jobs=-1
)

# =========================
# TRAINING MODEL
# =========================

print("\nMODEL SEDANG DITRAINING...")
model.fit(X_train, y_train)
print("MODEL BERHASIL DITRAINING")

# =========================
# PREDIKSI
# =========================

predictions = model.predict(X_test)

# =========================
# EVALUASI MODEL
# =========================

mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)
average_factor = y.mean()
percentage_error = (mae / average_factor) * 100

# =========================
# HASIL EVALUASI
# =========================

print("\n========== HASIL EVALUASI ==========")

print(f"MAE                  : {mae:.4f}")

print(f"R2 Score             : {r2:.4f}")

print(f"Rata-rata Faktor     : {average_factor:.4f}")

print(f"Persentase Error     : {percentage_error:.2f}%")

print("====================================")

# =========================
# FEATURE IMPORTANCE
# =========================

feature_importance = pd.DataFrame({
    'Fitur': X.columns,
    'Importance': model.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by='Importance',
    ascending=False
)

print("\nTINGKAT PENGARUH FITUR:")
print(feature_importance)

# =========================
# SIMPAN MODEL
# =========================

joblib.dump(model, "model_faktor_strategis.pkl")
print("\nMODEL BERHASIL DISIMPAN")

# =========================
# SIMPAN ENCODER
# =========================
joblib.dump(le_kota, "encoder_kota.pkl")
joblib.dump(le_kecamatan, "encoder_kecamatan.pkl")
joblib.dump(le_kelurahan, "encoder_kelurahan.pkl")

print("ENCODER BERHASIL DISIMPAN")
print("\nDone")