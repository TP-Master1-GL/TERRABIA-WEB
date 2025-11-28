FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE=terra_product_service.settings
ENV PYTHONPATH=/app

WORKDIR /app

# Install system dependencies (mysqlclient + build deps)
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Remove heavy build dependencies to keep image slim
RUN apt-get purge -y gcc python3-dev pkg-config \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN mkdir -p /app/logs

EXPOSE 8083

CMD ["gunicorn", "--bind", "0.0.0.0:8083", "--workers", "3", "terra_product_service.wsgi:application"]
