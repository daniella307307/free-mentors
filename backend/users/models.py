from mongoengine import (
    Document,
    DateTimeField,
    EmailField,
    ListField,
    ReferenceField,
    StringField,
)  # type: ignore
from datetime import datetime

class User(Document):
    ROLE_CHOICES = ('user', 'mentor', 'admin')

    # Auth fields
    username   = StringField(required=True, unique=True, max_length=150)
    email      = EmailField(required=True, unique=True)
    password   = StringField(required=True)  # Store hashed passwords only (bcrypt/argon2)

    # Role
    role       = StringField(required=True, choices=ROLE_CHOICES, default='user')

    # Personal info
    firstName  = StringField(max_length=30)
    lastName   = StringField(max_length=30)
    address    = StringField(max_length=255)

    # Profile
    bio            = StringField()
    occupation     = StringField(max_length=255)
    expertise      = StringField(max_length=255)
    profilePicture = StringField()  # Store image URL or file path as string

    # Timestamps
    createdAt  = DateTimeField(default=datetime.utcnow)
    updatedAt  = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'users',
        'indexes': ['email', 'username', 'role'],
        'ordering': ['-createdAt']
    }

    def save(self, *args, **kwargs):
        self.updatedAt = datetime.utcnow()
        return super().save(*args, **kwargs)

    def to_dict(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "address": self.address,
            "bio": self.bio,
            "occupation": self.occupation,
            "expertise": self.expertise,
            "profilePicture": self.profilePicture,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
            "updatedAt": self.updatedAt.isoformat() if self.updatedAt else None,
        }

    def __str__(self):
        return f"{self.username} ({self.role})"


class MentorshipSession(Document):
    STATUS_CHOICES = ("pending", "accepted", "declined")

    mentor = ReferenceField(User, required=True)
    mentee = ReferenceField(User, required=True)
    questions = ListField(StringField(), default=list)
    status = StringField(required=True, choices=STATUS_CHOICES, default="pending")
    createdAt = DateTimeField(default=datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "mentorship_sessions",
        "indexes": ["mentor", "mentee", "status"],
        "ordering": ["-createdAt"],
    }

    def save(self, *args, **kwargs):
        self.updatedAt = datetime.utcnow()
        return super().save(*args, **kwargs)