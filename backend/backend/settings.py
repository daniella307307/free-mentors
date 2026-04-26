from pathlib import Path
import os
import sys

import mongoengine  # type: ignore

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "your-secret-keySOMETHIGNRANDOMANDHASMYNAMEGANZAINIT1005"
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    "django.contrib.auth",          # ← required by graphene_django
    "django.contrib.contenttypes",  # ← required by django.contrib.auth
    "django.contrib.staticfiles",
    "corsheaders",
    "graphene_django",
    "users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# MongoDB connection (use in-memory mock during tests or when explicitly enabled)
USE_MOCK_DB = os.getenv("USE_MOCK_DB", "false").lower() == "true"

if "test" in sys.argv or USE_MOCK_DB:
    import mongomock  # type: ignore

    mongoengine.connect(
        db="free_mentors_test" if "test" in sys.argv else "free_mentors_dev",
        host="mongodb://localhost",
        mongo_client_class=mongomock.MongoClient,
        alias="default",
    )
else:
    mongoengine.connect(
        db="free_mentors",
        host="mongodb+srv://root:root@cluster0.bydvtkw.mongodb.net/?appName=Cluster0",
        alias="default",
    )

GRAPHENE = {"SCHEMA": "backend.schema.schema"}
JWT_EXPIRY_HOURS = 24
STATIC_URL = 'static/'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Allow local frontend dev servers even when Vite picks a different port.
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]