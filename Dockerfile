FROM python:3.9

WORKDIR /code

# Salin requirements dan instal library
COPY backend/requirements.txt /code/backend/requirements.txt
RUN pip install --no-cache-dir -r /code/backend/requirements.txt

# Salin seluruh isi project ke server
COPY . /code

# Masuk ke folder backend untuk mengeksekusi Flask
WORKDIR /code/backend

# Hugging Face Spaces mewajibkan aplikasi berjalan di port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]