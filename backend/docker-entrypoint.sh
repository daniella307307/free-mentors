#!/bin/sh
set -e
cd /app/backend
python manage.py migrate --noinput
exec gunicorn backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-2}" \
  --timeout 120
