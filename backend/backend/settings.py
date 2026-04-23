from pathlib import Path
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
    "graphene_django",
    "users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
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

# MongoDB connection (use in-memory mock during tests)
if "test" in sys.argv:
    import mongomock  # type: ignore

    mongoengine.connect(
        db="free_mentors_test",
        host="mongodb://localhost",
        mongo_client_class=mongomock.MongoClient,
        alias="default",
    )
else:
    mongoengine.connect(
        db="free_mentors",
        host="mongodb://localhost:27017",
        alias="default",
    )

GRAPHENE = {"SCHEMA": "backend.schema.schema"}
JWT_EXPIRY_HOURS = 24
STATIC_URL = 'static/'