from django.contrib.auth.models import AbstractUser
from django.db import models

# user model with role field to differentiate between users, mentors and admins
class User(AbstractUser):
    ROLE_CHOICES =(
        ('user', 'User'),
        ('mentor', 'Mentor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
