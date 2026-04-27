from datetime import datetime, timedelta, timezone

import bcrypt  # type: ignore
import graphene  # type: ignore
import jwt  # type: ignore
from django.conf import settings
from graphql import GraphQLError  # type: ignore
from mongoengine.queryset.visitor import Q  # type: ignore

from .models import MentorshipSession, User


# ── Output Types ──────────────────────────────────────────────────────────────
class UserType(graphene.ObjectType):
    id             = graphene.String()
    username       = graphene.String()
    email          = graphene.String()
    role           = graphene.String()
    firstName      = graphene.String()
    lastName       = graphene.String()
    address        = graphene.String()
    bio            = graphene.String()
    occupation     = graphene.String()
    expertise      = graphene.String()
    profilePicture = graphene.String()
    createdAt      = graphene.String()
    updatedAt      = graphene.String()


class MentorshipSessionType(graphene.ObjectType):
    id = graphene.String()
    mentor = graphene.Field(UserType)
    mentee = graphene.Field(UserType)
    questions = graphene.List(graphene.String)
    status = graphene.String()
    createdAt = graphene.String()
    updatedAt = graphene.String()


def user_to_type(user):
    return UserType(
        id=str(user.id),
        username=user.username,
        email=user.email,
        role=user.role,
        firstName=user.firstName,
        lastName=user.lastName,
        address=user.address,
        bio=user.bio,
        occupation=user.occupation,
        expertise=user.expertise,
        profilePicture=user.profilePicture,
        createdAt=user.createdAt.isoformat() if user.createdAt else None,
        updatedAt=user.updatedAt.isoformat() if user.updatedAt else None,
    )


def session_to_type(session):
    return MentorshipSessionType(
        id=str(session.id),
        mentor=user_to_type(session.mentor),
        mentee=user_to_type(session.mentee),
        questions=session.questions,
        status=session.status,
        createdAt=session.createdAt.isoformat() if session.createdAt else None,
        updatedAt=session.updatedAt.isoformat() if session.updatedAt else None,
    )


def get_auth_user(info):
    request = info.context
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None

    return User.objects(id=payload.get("user_id")).first()


class RegisterUser(graphene.Mutation):
    class Arguments:
        username  = graphene.String(required=True)
        email     = graphene.String(required=True)
        password  = graphene.String(required=True)
        firstName = graphene.String()
        lastName  = graphene.String()
        address   = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()
    user    = graphene.Field(UserType)

    def mutate(self, info, username, email, password, firstName=None, lastName=None, address=None):
        if User.objects(email=email).first():
            return RegisterUser(success=False, message="Email already in use.", user=None)

        if User.objects(username=username).first():
            return RegisterUser(success=False, message="Username already taken.", user=None)

        hashed_password = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        user = User(
            username  = username,
            email     = email,
            password  = hashed_password,
            firstName = firstName,
            lastName  = lastName,
            address   = address,
            role      = "user",
            createdAt = datetime.utcnow(),
            updatedAt = datetime.utcnow(),
        )
        user.save()
        return RegisterUser(
            success=True,
            message="User is successfully logged in.",
            user=user_to_type(user),
        )


# ── Login Mutation ────────────────────────────────────────────────────────────
class LoginUser(graphene.Mutation):
    class Arguments:
        email    = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    token   = graphene.String()   # JWT token
    user    = graphene.Field(UserType)

    def mutate(self, info, email, password):
        # Find user by email
        user = User.objects(email=email).first()

        if not user:
            return LoginUser(success=False, message="Invalid email or password.", token=None, user=None)

        # Verify password
        is_valid = bcrypt.checkpw(
            password.encode('utf-8'),
            user.password.encode('utf-8')
        )

        if not is_valid:
            return LoginUser(success=False, message="Invalid email or password.", token=None, user=None)

        # Generate JWT token
        payload = {
            'user_id'  : str(user.id),
            'email'    : user.email,
            'role'     : user.role,
            'exp'      : datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS),
            'iat'      : datetime.now(timezone.utc),
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        return LoginUser(
            success=True,
            message="User is successfully logged in.",
            token=token,
            user=user_to_type(user),
        )


class ChangeUserToMentor(graphene.Mutation):
    class Arguments:
        userId = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, userId):
        auth_user = get_auth_user(info)
        if not auth_user or auth_user.role != "admin":
            return ChangeUserToMentor(success=False, message="Admin access required.", user=None)

        user = User.objects(id=userId).first()
        if not user:
            return ChangeUserToMentor(success=False, message="User not found.", user=None)

        user.role = "mentor"
        user.save()
        return ChangeUserToMentor(success=True, message="User updated to mentor.", user=user_to_type(user))


class AdminSetUserRole(graphene.Mutation):
    """Set a user's role (admin only). Prefer this over pasting raw user IDs in a separate form."""

    class Arguments:
        user_id = graphene.String(required=True)
        role = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, user_id, role):
        auth_user = get_auth_user(info)
        if not auth_user or auth_user.role != "admin":
            return AdminSetUserRole(success=False, message="Admin access required.", user=None)

        if role not in User.ROLE_CHOICES:
            return AdminSetUserRole(success=False, message=f"Invalid role. Use one of: {User.ROLE_CHOICES}.", user=None)

        target = User.objects(id=user_id).first()
        if not target:
            return AdminSetUserRole(success=False, message="User not found.", user=None)

        if str(target.id) == str(auth_user.id) and role != "admin":
            return AdminSetUserRole(
                success=False,
                message="You cannot remove your own admin role.",
                user=None,
            )

        target.role = role
        target.save()
        return AdminSetUserRole(
            success=True,
            message="User role updated.",
            user=user_to_type(target),
        )


class UpdateMyProfile(graphene.Mutation):
    class Arguments:
        firstName = graphene.String()
        lastName = graphene.String()
        address = graphene.String()
        bio = graphene.String()
        occupation = graphene.String()
        expertise = graphene.String()
        profilePicture = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(
        self,
        info,
        firstName=None,
        lastName=None,
        address=None,
        bio=None,
        occupation=None,
        expertise=None,
        profilePicture=None,
    ):
        auth_user = get_auth_user(info)
        if not auth_user:
            return UpdateMyProfile(success=False, message="Authentication required.", user=None)

        updates = {
            "firstName": firstName,
            "lastName": lastName,
            "address": address,
            "bio": bio,
            "occupation": occupation,
            "expertise": expertise,
            "profilePicture": profilePicture,
        }
        for field, value in updates.items():
            if value is not None:
                setattr(auth_user, field, value)

        auth_user.save()
        return UpdateMyProfile(
            success=True,
            message="Profile updated successfully.",
            user=user_to_type(auth_user),
        )


class CreateMentorshipSessionRequest(graphene.Mutation):
    class Arguments:
        mentorId = graphene.String(required=True)
        questions = graphene.List(graphene.String)

    success = graphene.Boolean()
    message = graphene.String()
    mentorshipSession = graphene.Field(MentorshipSessionType)

    def mutate(self, info, mentorId, questions=None):
        auth_user = get_auth_user(info)
        if not auth_user:
            return CreateMentorshipSessionRequest(success=False, message="Authentication required.", mentorshipSession=None)

        mentor = User.objects(id=mentorId, role="mentor").first()
        if not mentor:
            return CreateMentorshipSessionRequest(success=False, message="Mentor not found.", mentorshipSession=None)

        session = MentorshipSession(
            mentor=mentor,
            mentee=auth_user,
            questions=questions or [],
            status="pending",
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
        )
        session.save()

        return CreateMentorshipSessionRequest(
            success=True,
            message="Mentorship session request created.",
            mentorshipSession=session_to_type(session),
        )


class AcceptMentorshipSessionRequest(graphene.Mutation):
    class Arguments:
        sessionId = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    mentorshipSession = graphene.Field(MentorshipSessionType)

    def mutate(self, info, sessionId):
        auth_user = get_auth_user(info)
        if not auth_user or auth_user.role != "mentor":
            return AcceptMentorshipSessionRequest(success=False, message="Mentor access required.", mentorshipSession=None)

        session = MentorshipSession.objects(id=sessionId, mentor=auth_user).first()
        if not session:
            return AcceptMentorshipSessionRequest(success=False, message="Session not found.", mentorshipSession=None)

        session.status = "accepted"
        session.save()
        return AcceptMentorshipSessionRequest(success=True, message="Session accepted.", mentorshipSession=session_to_type(session))


class DeclineMentorshipSessionRequest(graphene.Mutation):
    class Arguments:
        sessionId = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    mentorshipSession = graphene.Field(MentorshipSessionType)

    def mutate(self, info, sessionId):
        auth_user = get_auth_user(info)
        if not auth_user or auth_user.role != "mentor":
            return DeclineMentorshipSessionRequest(success=False, message="Mentor access required.", mentorshipSession=None)

        session = MentorshipSession.objects(id=sessionId, mentor=auth_user).first()
        if not session:
            return DeclineMentorshipSessionRequest(success=False, message="Session not found.", mentorshipSession=None)

        session.status = "declined"
        session.save()
        return DeclineMentorshipSessionRequest(success=True, message="Session declined.", mentorshipSession=session_to_type(session))


# ── Query ─────────────────────────────────────────────────────────────────────
class Query(graphene.ObjectType):
    all_users = graphene.List(UserType)
    mentors = graphene.List(UserType)
    mentor = graphene.Field(UserType, mentorId=graphene.String(required=True))
    my_mentorship_sessions = graphene.List(MentorshipSessionType)

    def resolve_all_users(self, info):
        auth_user = get_auth_user(info)
        if not auth_user or auth_user.role != "admin":
            raise GraphQLError("Admin access required.")
        return [user_to_type(u) for u in User.objects.order_by("-createdAt")]

    def resolve_mentors(self, info):
        return [user_to_type(u) for u in User.objects(role="mentor")]

    def resolve_mentor(self, info, mentorId):
        mentor = User.objects(id=mentorId, role="mentor").first()
        return user_to_type(mentor) if mentor else None

    def resolve_my_mentorship_sessions(self, info):
        auth_user = get_auth_user(info)
        if not auth_user:
            return []

        sessions = MentorshipSession.objects(Q(mentor=auth_user) | Q(mentee=auth_user))
        return [session_to_type(s) for s in sessions]


# ── Mutations ─────────────────────────────────────────────────────────────────
class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user    = LoginUser.Field()
    change_user_to_mentor = ChangeUserToMentor.Field()
    admin_set_user_role = AdminSetUserRole.Field()
    update_my_profile = UpdateMyProfile.Field()
    create_mentorship_session_request = CreateMentorshipSessionRequest.Field()
    accept_mentorship_session_request = AcceptMentorshipSessionRequest.Field()
    decline_mentorship_session_request = DeclineMentorshipSessionRequest.Field()