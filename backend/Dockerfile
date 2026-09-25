FROM python:3.11-slim

WORKDIR /app

# Install system dependencies, including Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from backend directory
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application
COPY backend/ .

# Run the application using Uvicorn with the PORT environment variable provided by Render
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
