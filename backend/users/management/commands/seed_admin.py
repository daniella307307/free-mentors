import os

from django.core.management.base import BaseCommand

from users.models import User


class Command(BaseCommand):
    help = (
        "Create an initial admin user from ADMIN_EMAIL and ADMIN_PASSWORD when no admin exists. "
        "Optional: ADMIN_USERNAME (default: admin). Password is hashed via Django (never logged)."
    )

    def handle(self, *args, **options):
        if User.objects.filter(role=User.Role.ADMIN).exists():
            self.stdout.write(self.style.WARNING("An admin user already exists; skipping seed."))
            return

        email = os.environ.get("ADMIN_EMAIL", "").strip()
        password = os.environ.get("ADMIN_PASSWORD", "")
        username = os.environ.get("ADMIN_USERNAME", "admin").strip() or "admin"

        if not email or not password:
            self.stdout.write(
                self.style.ERROR(
                    "Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment to seed an admin."
                )
            )
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f"A user with email {email} already exists."))
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            role=User.Role.ADMIN,
        )
        self.stdout.write(self.style.SUCCESS(f"Created admin user {email} (username={username})."))
