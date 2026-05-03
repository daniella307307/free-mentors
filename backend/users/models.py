from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django_mongodb_backend.fields import ObjectIdAutoField


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", User.Role.USER)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    """Application user with mentorship roles (MongoDB via django-mongodb-backend)."""

    id = ObjectIdAutoField(primary_key=True)

    class Role(models.TextChoices):
        USER = "user", "User"
        MENTOR = "mentor", "Mentor"
        ADMIN = "admin", "Admin"

    email = models.EmailField("email address", unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER, db_index=True)

    address = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    occupation = models.CharField(max_length=255, blank=True)
    expertise = models.CharField(max_length=255, blank=True)
    profile_picture = models.CharField(max_length=500, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.username} ({self.role})"

    @classmethod
    def role_values(cls):
        return [c.value for c in cls.Role]


class MentorshipSession(models.Model):
    id = ObjectIdAutoField(primary_key=True)

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        COMPLETED = "completed", "Completed"
        DECLINED = "declined", "Declined"

    mentor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sessions_as_mentor",
    )
    mentee = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sessions_as_mentee",
    )
    session_date = models.CharField(max_length=10)
    session_time = models.CharField(max_length=20)
    session_slot = models.CharField(max_length=100)
    questions = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["mentor", "mentee", "status"]),
        ]

    def __str__(self):
        return f"{self.mentor_id}↔{self.mentee_id} {self.session_date}"


class MentorReview(models.Model):
    id = ObjectIdAutoField(primary_key=True)

    mentor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews_written",
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.CharField(max_length=1000, blank=True)
    flagged = models.BooleanField(default=False)
    hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["mentor", "-created_at"]),
            models.Index(fields=["flagged", "hidden"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["mentor", "reviewer"],
                name="unique_review_per_mentor_reviewer",
            ),
        ]

    def __str__(self):
        return f"Review {self.rating}★ for mentor {self.mentor_id}"
