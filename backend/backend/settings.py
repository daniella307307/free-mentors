from pathlib import Path
import os
import sys

import mongoengine  # type: ignore
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load backend/.env (and repo-root .env) so MONGODB_URI etc. apply when you run manage.py.
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "your-secret-keySOMETHIGNRANDOMANDHASMYNAMEGANZAINIT1005",
)
DEBUG = os.getenv("DEBUG", "true").lower() in ("1", "true", "yes")

_default_hosts = "localhost,127.0.0.1"
ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv("ALLOWED_HOSTS", _default_hosts).split(",")
    if h.strip()
]

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

_mongo_db = os.getenv("MONGODB_DB", "free_mentors")

if "test" in sys.argv or USE_MOCK_DB:
    import mongomock

    _mock_uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
    mongoengine.connect(
        db=_mongo_db,
        host=_mock_uri,
        mongo_client_class=mongomock.MongoClient,
        alias="default",
    )
else:
    _mongo_uri = os.getenv("MONGODB_URI")
    if not _mongo_uri:
        raise RuntimeError(
            "Set MONGODB_URI in backend/.env (loaded automatically) or in the environment."
        )
    mongoengine.connect(db=_mongo_db, host=_mongo_uri, alias="default")
    

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