from datetime import datetime, timedelta, timezone
import re

import graphene  # type: ignore
import jwt  # type: ignore
from django.conf import settings
from django.db.models import Q
from graphql import GraphQLError  # type: ignore

from .graphql_auth import get_auth_user
from .models import MentorReview, MentorshipSession, User
from .permissions import is_admin, is_mentor, is_user_role, require_admin, require_authenticated


class UserType(graphene.ObjectType):
    id = graphene.String()
    username = graphene.String()
    email = graphene.String()
    role = graphene.String()
    firstName = graphene.String()
    lastName = graphene.String()
    address = graphene.String()
    bio = graphene.String()
    occupation = graphene.String()
    expertise = graphene.String()
    profilePicture = graphene.String()
    createdAt = graphene.String()
    updatedAt = graphene.String()
    averageRating = graphene.Float()
    reviewsCount = graphene.Int()


class MentorshipSessionType(graphene.ObjectType):
    id = graphene.String()
    mentor = graphene.Field(UserType)
    mentee = graphene.Field(UserType)
    sessionDate = graphene.String()
    sessionTime = graphene.String()
    sessionSlot = graphene.String()
    questions = graphene.List(graphene.String)
    status = graphene.String()
    createdAt = graphene.String()
    updatedAt = graphene.String()


class MentorReviewType(graphene.ObjectType):
    id = graphene.String()
    mentor = graphene.Field(UserType)
    reviewer = graphene.Field(UserType)
    rating = graphene.Int()
    comment = graphene.String()
    flagged = graphene.Boolean()
    hidden = graphene.Boolean()
    createdAt = graphene.String()
    updatedAt = graphene.String()


def user_to_type(user):
    reviews = MentorReview.objects.filter(mentor=user, hidden=False)
    reviews_count = reviews.count()
    average_rating = (
        sum(r.rating for r in reviews) / reviews_count if reviews_count else None
    )
    return UserType(
        id=str(user.pk),
        username=user.username,
        email=user.email,
        role=user.role,
        firstName=user.first_name or "",
        lastName=user.last_name or "",
        address=user.address or "",
        bio=user.bio or "",
        occupation=user.occupation or "",
        expertise=user.expertise or "",
        profilePicture=user.profile_picture or "",
        createdAt=user.date_joined.isoformat() if user.date_joined else None,
        updatedAt=user.updated_at.isoformat() if user.updated_at else None,
        averageRating=average_rating,
        reviewsCount=reviews_count,
    )


def session_to_type(session):
    return MentorshipSessionType(
        id=str(session.pk),
        mentor=user_to_type(session.mentor),
        mentee=user_to_type(session.mentee),
        sessionDate=session.session_date,
        sessionTime=session.session_time,
        sessionSlot=session.session_slot,
        questions=session.questions or [],
        status=session.status,
        createdAt=session.created_at.isoformat() if session.created_at else None,
        updatedAt=session.updated_at.isoformat() if session.updated_at else None,
    )


def review_to_type(review):
    return MentorReviewType(
        id=str(review.pk),
        mentor=user_to_type(review.mentor),
        reviewer=user_to_type(review.reviewer),
        rating=review.rating,
        comment=review.comment or "",
        flagged=bool(review.flagged),
        hidden=bool(review.hidden),
        createdAt=review.created_at.isoformat() if review.created_at else None,
        updatedAt=review.updated_at.isoformat() if review.updated_at else None,
    )


def _parse_session_end(session):
    if not session.session_date or not session.session_time:
        return None
    parts = (session.session_time or "").split("-")
    if len(parts) != 2:
        return None
    end_time = parts[1].strip()
    try:
        return datetime.strptime(
            f"{session.session_date} {end_time}",
            "%Y-%m-%d %H:%M",
        ).replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def _mark_completed_if_past(session):
    if session.status != MentorshipSession.Status.ACCEPTED:
        return
    session_end = _parse_session_end(session)
    if session_end and datetime.now(timezone.utc) >= session_end:
        session.status = MentorshipSession.Status.COMPLETED
        session.save(update_fields=["status", "updated_at"])


class RegisterUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        firstName = graphene.String()
        lastName = graphene.String()
        address = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, username, email, password, firstName=None, lastName=None, address=None):
        if User.objects.filter(email=email).exists():
            return RegisterUser(success=False, message="Email already in use.", user=None)

        if User.objects.filter(username=username).exists():
            return RegisterUser(success=False, message="Username already taken.", user=None)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=firstName or "",
            last_name=lastName or "",
            address=address or "",
            role=User.Role.USER,
        )
        return RegisterUser(
            success=True,
            message="User is successfully logged in.",
            user=user_to_type(user),
        )


class LoginUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, email, password):
        user = User.objects.filter(email=email).first()

        if not user or not user.check_password(password):
            return LoginUser(success=False, message="Invalid email or password.", token=None, user=None)

        payload = {
            "user_id": str(user.pk),
            "email": user.email,
            "role": user.role,
            "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS),
            "iat": datetime.now(timezone.utc),
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

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
        if not auth_user or not is_admin(auth_user):
            return ChangeUserToMentor(success=False, message="Admin access required.", user=None)

        target = User.objects.filter(pk=userId).first()
        if not target:
            return ChangeUserToMentor(success=False, message="User not found.", user=None)

        target.role = User.Role.MENTOR
        target.save(update_fields=["role", "updated_at"])
        return ChangeUserToMentor(success=True, message="User updated to mentor.", user=user_to_type(target))


class AdminSetUserRole(graphene.Mutation):
    class Arguments:
        user_id = graphene.String(required=True)
        role = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(UserType)

    def mutate(self, info, user_id, role):
        auth_user = get_auth_user(info)
        if not auth_user or not is_admin(auth_user):
            return AdminSetUserRole(success=False, message="Admin access required.", user=None)

        if role not in User.role_values():
            return AdminSetUserRole(
                success=False,
                message=f"Invalid role. Use one of: {User.role_values()}.",
                user=None,
            )

        target = User.objects.filter(pk=user_id).first()
        if not target:
            return AdminSetUserRole(success=False, message="User not found.", user=None)

        if str(target.pk) == str(auth_user.pk) and role != User.Role.ADMIN:
            return AdminSetUserRole(
                success=False,
                message="You cannot remove your own admin role.",
                user=None,
            )

        target.role = role
        if role == User.Role.ADMIN:
            target.is_staff = True
        target.save(update_fields=["role", "is_staff", "updated_at"])
        return AdminSetUserRole(
            success=True,
            message="User role updated.",
            user=user_to_type(target),
        )


class PromoteUserToAdmin(graphene.Mutation):
    """Admin-only: set application role to admin and grant Django staff (for /admin access)."""

    class Arguments:
        user_id = graphene.String(required=True)

    user = graphene.Field(UserType)

    def mutate(self, info, user_id):
        require_admin(info)
        target = User.objects.filter(pk=user_id).first()
        if not target:
            raise GraphQLError("User not found.")
        target.role = User.Role.ADMIN
        target.is_staff = True
        target.save(update_fields=["role", "is_staff", "updated_at"])
        return PromoteUserToAdmin(user=user_to_type(target))


class PromoteUserToMentor(graphene.Mutation):
    """Admin-only: set application role to mentor."""

    class Arguments:
        user_id = graphene.String(required=True)

    user = graphene.Field(UserType)

    def mutate(self, info, user_id):
        require_admin(info)
        target = User.objects.filter(pk=user_id).first()
        if not target:
            raise GraphQLError("User not found.")
        target.role = User.Role.MENTOR
        target.save(update_fields=["role", "updated_at"])
        return PromoteUserToMentor(user=user_to_type(target))


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

        if firstName is not None:
            auth_user.first_name = firstName
        if lastName is not None:
            auth_user.last_name = lastName
        if address is not None:
            auth_user.address = address
        if bio is not None:
            auth_user.bio = bio
        if occupation is not None:
            auth_user.occupation = occupation
        if expertise is not None:
            auth_user.expertise = expertise
        if profilePicture is not None:
            auth_user.profile_picture = profilePicture

        auth_user.save()
        return UpdateMyProfile(
            success=True,
            message="Profile updated successfully.",
            user=user_to_type(auth_user),
        )


class CreateMentorshipSessionRequest(graphene.Mutation):
    class Arguments:
        mentorId = graphene.String(required=True)
        sessionDate = graphene.String(required=True)
        sessionTime = graphene.String(required=True)
        sessionSlot = graphene.String(required=True)
        questions = graphene.List(graphene.String)

    success = graphene.Boolean()
    message = graphene.String()
    mentorshipSession = graphene.Field(MentorshipSessionType)

    def mutate(self, info, mentorId, sessionDate, sessionTime, sessionSlot, questions=None):
        auth_user = get_auth_user(info)
        if not auth_user:
            return CreateMentorshipSessionRequest(
                success=False, message="Authentication required.", mentorshipSession=None
            )

        if not is_user_role(auth_user):
            return CreateMentorshipSessionRequest(
                success=False,
                message="Only mentee accounts can request mentorship sessions.",
                mentorshipSession=None,
            )

        mentor = User.objects.filter(pk=mentorId, role=User.Role.MENTOR).first()
        if not mentor:
            return CreateMentorshipSessionRequest(success=False, message="Mentor not found.", mentorshipSession=None)

        if str(mentor.pk) == str(auth_user.pk):
            return CreateMentorshipSessionRequest(
                success=False,
                message="You cannot request a session with yourself.",
                mentorshipSession=None,
            )

        cleaned_slot = (sessionSlot or "").strip()
        if not cleaned_slot:
            return CreateMentorshipSessionRequest(
                success=False,
                message="Session slot is required.",
                mentorshipSession=None,
            )

        cleaned_date = (sessionDate or "").strip()
        cleaned_time = (sessionTime or "").strip()
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", cleaned_date):
            return CreateMentorshipSessionRequest(
                success=False,
                message="Session date must be in YYYY-MM-DD format.",
                mentorshipSession=None,
            )
        if not re.fullmatch(r"\d{2}:\d{2}\s*-\s*\d{2}:\d{2}", cleaned_time):
            return CreateMentorshipSessionRequest(
                success=False,
                message="Session time must be in HH:MM-HH:MM format.",
                mentorshipSession=None,
            )
        try:
            start_value, end_value = [part.strip() for part in cleaned_time.split("-", 1)]
            start_dt = datetime.strptime(f"{cleaned_date} {start_value}", "%Y-%m-%d %H:%M")
            end_dt = datetime.strptime(f"{cleaned_date} {end_value}", "%Y-%m-%d %H:%M")
            if end_dt <= start_dt:
                raise ValueError
        except ValueError:
            return CreateMentorshipSessionRequest(
                success=False,
                message="Session time range is invalid.",
                mentorshipSession=None,
            )

        blocked = (
            MentorshipSession.Status.PENDING,
            MentorshipSession.Status.ACCEPTED,
            MentorshipSession.Status.COMPLETED,
        )
        if MentorshipSession.objects.filter(
            mentee=auth_user,
            session_date=cleaned_date,
            session_time=cleaned_time,
            status__in=blocked,
        ).exists():
            return CreateMentorshipSessionRequest(
                success=False,
                message="You already have a mentorship request for this date and time slot.",
                mentorshipSession=None,
            )

        if MentorshipSession.objects.filter(
            mentor=mentor,
            session_date=cleaned_date,
            session_time=cleaned_time,
            status=MentorshipSession.Status.ACCEPTED,
        ).exists():
            return CreateMentorshipSessionRequest(
                success=False,
                message="This time slot is no longer available.",
                mentorshipSession=None,
            )

        session = MentorshipSession.objects.create(
            mentor=mentor,
            mentee=auth_user,
            session_date=cleaned_date,
            session_time=cleaned_time,
            session_slot=cleaned_slot,
            questions=list(questions or []),
            status=MentorshipSession.Status.PENDING,
        )

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
        if not auth_user or not is_mentor(auth_user):
            return AcceptMentorshipSessionRequest(success=False, message="Mentor access required.", mentorshipSession=None)

        session = MentorshipSession.objects.filter(pk=sessionId, mentor=auth_user).first()
        if not session:
            return AcceptMentorshipSessionRequest(success=False, message="Session not found.", mentorshipSession=None)

        conflict = MentorshipSession.objects.filter(
            mentor=session.mentor,
            session_date=session.session_date,
            session_time=session.session_time,
            status=MentorshipSession.Status.ACCEPTED,
        ).exclude(pk=session.pk).exists()
        if conflict:
            return AcceptMentorshipSessionRequest(
                success=False,
                message="This time slot is no longer available.",
                mentorshipSession=None,
            )

        session.status = MentorshipSession.Status.ACCEPTED
        session.save(update_fields=["status", "updated_at"])
        _mark_completed_if_past(session)
        session.refresh_from_db()
        return AcceptMentorshipSessionRequest(success=True, message="Session accepted.", mentorshipSession=session_to_type(session))


class DeclineMentorshipSessionRequest(graphene.Mutation):
    class Arguments:
        sessionId = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    mentorshipSession = graphene.Field(MentorshipSessionType)

    def mutate(self, info, sessionId):
        auth_user = get_auth_user(info)
        if not auth_user or not is_mentor(auth_user):
            return DeclineMentorshipSessionRequest(success=False, message="Mentor access required.", mentorshipSession=None)

        session = MentorshipSession.objects.filter(pk=sessionId, mentor=auth_user).first()
        if not session:
            return DeclineMentorshipSessionRequest(success=False, message="Session not found.", mentorshipSession=None)

        session.status = MentorshipSession.Status.DECLINED
        session.save(update_fields=["status", "updated_at"])
        return DeclineMentorshipSessionRequest(success=True, message="Session declined.", mentorshipSession=session_to_type(session))


class CreateMentorReview(graphene.Mutation):
    class Arguments:
        mentorId = graphene.String(required=True)
        rating = graphene.Int(required=True)
        comment = graphene.String()

    success = graphene.Boolean()
    message = graphene.String()
    review = graphene.Field(MentorReviewType)

    def mutate(self, info, mentorId, rating, comment=None):
        auth_user = get_auth_user(info)
        if not auth_user:
            return CreateMentorReview(success=False, message="Authentication required.", review=None)

        mentor = User.objects.filter(pk=mentorId, role=User.Role.MENTOR).first()
        if not mentor:
            return CreateMentorReview(success=False, message="Mentor not found.", review=None)

        if rating < 1 or rating > 5:
            return CreateMentorReview(success=False, message="Rating must be between 1 and 5.", review=None)

        candidate_sessions = MentorshipSession.objects.filter(
            mentor=mentor,
            mentee=auth_user,
            status__in=[MentorshipSession.Status.ACCEPTED, MentorshipSession.Status.COMPLETED],
        )
        has_completed_session = False
        for s in candidate_sessions:
            _mark_completed_if_past(s)
            s.refresh_from_db()
            if s.status == MentorshipSession.Status.COMPLETED:
                has_completed_session = True
                break
        if not has_completed_session:
            return CreateMentorReview(
                success=False,
                message="You can only review mentors after a completed session.",
                review=None,
            )

        cleaned_comment = (comment or "").strip()
        review, _created = MentorReview.objects.update_or_create(
            mentor=mentor,
            reviewer=auth_user,
            defaults={
                "rating": rating,
                "comment": cleaned_comment,
            },
        )
        return CreateMentorReview(
            success=True,
            message="Review submitted." if _created else "Review updated.",
            review=review_to_type(review),
        )


class FlagMentorReview(graphene.Mutation):
    class Arguments:
        reviewId = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    review = graphene.Field(MentorReviewType)

    def mutate(self, info, reviewId):
        auth_user = get_auth_user(info)
        if not auth_user:
            return FlagMentorReview(success=False, message="Authentication required.", review=None)

        review = MentorReview.objects.filter(pk=reviewId).select_related("mentor").first()
        if not review:
            return FlagMentorReview(success=False, message="Review not found.", review=None)

        if str(review.mentor_id) != str(auth_user.pk) or not is_mentor(auth_user):
            return FlagMentorReview(success=False, message="Only the reviewed mentor can flag reviews.", review=None)

        review.flagged = True
        review.save(update_fields=["flagged", "updated_at"])
        return FlagMentorReview(success=True, message="Review flagged for moderation.", review=review_to_type(review))


class AdminSetMentorReviewHidden(graphene.Mutation):
    class Arguments:
        reviewId = graphene.String(required=True)
        hidden = graphene.Boolean(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    review = graphene.Field(MentorReviewType)

    def mutate(self, info, reviewId, hidden):
        auth_user = get_auth_user(info)
        if not auth_user or not is_admin(auth_user):
            return AdminSetMentorReviewHidden(success=False, message="Admin access required.", review=None)

        review = MentorReview.objects.filter(pk=reviewId).first()
        if not review:
            return AdminSetMentorReviewHidden(success=False, message="Review not found.", review=None)

        review.hidden = hidden
        review.save(update_fields=["hidden", "updated_at"])
        return AdminSetMentorReviewHidden(
            success=True,
            message="Review visibility updated." if not hidden else "Review hidden from public listings.",
            review=review_to_type(review),
        )


class Query(graphene.ObjectType):
    all_users = graphene.List(UserType)
    mentors = graphene.List(UserType)
    mentor = graphene.Field(UserType, mentorId=graphene.String(required=True))
    my_mentorship_sessions = graphene.List(MentorshipSessionType)
    mentor_reviews = graphene.List(MentorReviewType, mentorId=graphene.String(required=True))
    recent_reviews = graphene.List(MentorReviewType, limit=graphene.Int())
    flagged_mentor_reviews = graphene.List(MentorReviewType)

    def resolve_all_users(self, info):
        require_admin(info)
        return [user_to_type(u) for u in User.objects.order_by("-date_joined")]

    def resolve_mentors(self, info):
        return [user_to_type(u) for u in User.objects.filter(role=User.Role.MENTOR)]

    def resolve_mentor(self, info, mentorId):
        mentor = User.objects.filter(pk=mentorId, role=User.Role.MENTOR).first()
        return user_to_type(mentor) if mentor else None

    def resolve_my_mentorship_sessions(self, info):
        auth_user = get_auth_user(info)
        if not auth_user:
            return []

        sessions = MentorshipSession.objects.filter(Q(mentor=auth_user) | Q(mentee=auth_user))
        for session in sessions:
            _mark_completed_if_past(session)
        sessions = MentorshipSession.objects.filter(Q(mentor=auth_user) | Q(mentee=auth_user)).order_by("-created_at")
        return [session_to_type(s) for s in sessions]

    def resolve_mentor_reviews(self, info, mentorId):
        mentor = User.objects.filter(pk=mentorId, role=User.Role.MENTOR).first()
        if not mentor:
            return []
        auth_user = get_auth_user(info)
        if auth_user and is_admin(auth_user):
            reviews = MentorReview.objects.filter(mentor=mentor).order_by("-created_at")
        else:
            reviews = MentorReview.objects.filter(mentor=mentor, hidden=False).order_by("-created_at")
        return [review_to_type(r) for r in reviews]

    def resolve_recent_reviews(self, info, limit=6):
        safe_limit = max(1, min(limit or 6, 20))
        reviews = MentorReview.objects.filter(hidden=False).order_by("-created_at")[:safe_limit]
        return [review_to_type(r) for r in reviews]

    def resolve_flagged_mentor_reviews(self, info):
        require_admin(info)
        reviews = MentorReview.objects.filter(flagged=True).order_by("-updated_at")
        return [review_to_type(r) for r in reviews]


class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    change_user_to_mentor = ChangeUserToMentor.Field()
    admin_set_user_role = AdminSetUserRole.Field()
    promote_user_to_admin = PromoteUserToAdmin.Field()
    promote_user_to_mentor = PromoteUserToMentor.Field()
    update_my_profile = UpdateMyProfile.Field()
    create_mentorship_session_request = CreateMentorshipSessionRequest.Field()
    accept_mentorship_session_request = AcceptMentorshipSessionRequest.Field()
    decline_mentorship_session_request = DeclineMentorshipSessionRequest.Field()
    create_mentor_review = CreateMentorReview.Field()
    flag_mentor_review = FlagMentorReview.Field()
    admin_set_mentor_review_hidden = AdminSetMentorReviewHidden.Field()
