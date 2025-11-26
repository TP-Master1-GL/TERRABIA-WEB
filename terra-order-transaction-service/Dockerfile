FROM python:3.11-slim

# Pour éviter les prompts debconf
ENV DEBIAN_FRONTEND=noninteractive

# Optimisation Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=terra_orders.settings

WORKDIR /app

# Installer uniquement ce qui est nécessaire pour psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Installation rapide sans cache
# Mise à jour pip + timeout augmenté
RUN pip install --upgrade pip --no-cache-dir \
    && pip install --default-timeout=200 --retries=5 --no-cache-dir -r requirements.txt


COPY . .

CMD ["gunicorn", "terra_orders.wsgi:application", "--bind", "0.0.0.0:8086"]
