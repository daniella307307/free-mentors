from django.test import TestCase
from django.conf import settings
import jwt  # type: ignore

from backend.schema import schema
from users.models import MentorReview, MentorshipSession, User


class _Context:
    """Minimal request-like object for GraphQL tests (Authorization in headers dict)."""

    def __init__(self, headers=None):
        self.headers = headers or {}


class FreeMentorsGraphQLTests(TestCase):
    def execute(self, query, token=None):
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return schema.execute(query, context_value=_Context(headers=headers))

    def create_user(self, username, email, password, role="user"):
        mapping = {"user": User.Role.USER, "mentor": User.Role.MENTOR, "admin": User.Role.ADMIN}
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=mapping.get(role, User.Role.USER),
        )

    def token_for(self, user):
        payload = {"user_id": str(user.pk), "email": user.email, "role": user.role}
        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    def test_register_user(self):
        query = """
        mutation {
          registerUser(username: "alice", email: "alice@example.com", password: "pass123") {
            success
            message
            user {
              username
              email
              role
            }
          }
        }
        """
        result = self.execute(query)
        self.assertIsNone(result.errors)
        data = result.data["registerUser"]
        self.assertTrue(data["success"])
        self.assertEqual(data["user"]["email"], "alice@example.com")
        self.assertEqual(data["user"]["role"], "user")

    def test_login_user_returns_token(self):
        self.create_user("bob", "bob@example.com", "pass123", role="user")
        query = """
        mutation {
          loginUser(email: "bob@example.com", password: "pass123") {
            success
            message
            token
            user {
              email
              role
            }
          }
        }
        """
        result = self.execute(query)
        self.assertIsNone(result.errors)
        data = result.data["loginUser"]
        self.assertTrue(data["success"])
        self.assertIsNotNone(data["token"])
        self.assertEqual(data["user"]["email"], "bob@example.com")

    def test_admin_can_change_user_to_mentor(self):
        admin = self.create_user("admin1", "admin1@example.com", "pass123", role="admin")
        target_user = self.create_user("charlie", "charlie@example.com", "pass123", role="user")
        token = self.token_for(admin)
        query = f"""
        mutation {{
          changeUserToMentor(userId: "{target_user.pk}") {{
            success
            message
            user {{
              id
              role
            }}
          }}
        }}
        """
        result = self.execute(query, token=token)
        self.assertIsNone(result.errors)
        data = result.data["changeUserToMentor"]
        self.assertTrue(data["success"])
        self.assertEqual(data["user"]["role"], "mentor")

    def test_promote_user_to_admin_requires_admin(self):
        u = self.create_user("u1", "u1@example.com", "pass123", role="user")
        target = self.create_user("u2", "u2@example.com", "pass123", role="user")
        query = f"""
        mutation {{
          promoteUserToAdmin(userId: "{target.pk}") {{ user {{ id role }} }}
        }}
        """
        result = self.execute(query, token=self.token_for(u))
        self.assertIsNotNone(result.errors)

    def test_promote_user_to_admin_succeeds(self):
        admin = self.create_user("adm", "adm@example.com", "pass123", role="admin")
        target = self.create_user("tgt", "tgt@example.com", "pass123", role="user")
        query = f"""
        mutation {{
          promoteUserToAdmin(userId: "{target.pk}") {{ user {{ id role }} }}
        }}
        """
        result = self.execute(query, token=self.token_for(admin))
        self.assertIsNone(result.errors)
        self.assertEqual(result.data["promoteUserToAdmin"]["user"]["role"], "admin")
        target.refresh_from_db()
        self.assertTrue(target.is_staff)

    def test_all_users_requires_admin(self):
        user = self.create_user("plain", "plain@example.com", "pass123", role="user")
        self.create_user("other", "other@example.com", "pass123", role="user")
        query = """
        query {
          allUsers { id email }
        }
        """
        result = self.execute(query, token=self.token_for(user))
        self.assertIsNotNone(result.errors)

    def test_admin_can_list_all_users(self):
        admin = self.create_user("admin2", "admin2@example.com", "pass123", role="admin")
        self.create_user("u3", "u3@example.com", "pass123", role="user")
        query = """
        query {
          allUsers { id email role }
        }
        """
        result = self.execute(query, token=self.token_for(admin))
        self.assertIsNone(result.errors)
        users = result.data["allUsers"]
        self.assertEqual(len(users), 2)

    def test_admin_can_set_user_role(self):
        admin = self.create_user("admin3", "admin3@example.com", "pass123", role="admin")
        target = self.create_user("tom", "tom@example.com", "pass123", role="user")
        token = self.token_for(admin)
        query = f"""
        mutation {{
          adminSetUserRole(userId: "{target.pk}", role: "mentor") {{
            success
            message
            user {{ id role }}
          }}
        }}
        """
        result = self.execute(query, token=token)
        self.assertIsNone(result.errors)
        data = result.data["adminSetUserRole"]
        self.assertTrue(data["success"])
        self.assertEqual(data["user"]["role"], "mentor")

    def test_can_get_mentors_and_specific_mentor(self):
        mentor = self.create_user("mentor1", "mentor1@example.com", "pass123", role="mentor")
        self.create_user("user1", "user1@example.com", "pass123", role="user")

        mentors_query = """
        query {
          mentors {
            id
            email
            role
          }
        }
        """
        mentors_result = self.execute(mentors_query)
        self.assertIsNone(mentors_result.errors)
        mentors = mentors_result.data["mentors"]
        self.assertEqual(len(mentors), 1)
        self.assertEqual(mentors[0]["role"], "mentor")

        mentor_query = f"""
        query {{
          mentor(mentorId: "{mentor.pk}") {{
            id
            email
            role
          }}
        }}
        """
        mentor_result = self.execute(mentor_query)
        self.assertIsNone(mentor_result.errors)
        mentor_data = mentor_result.data["mentor"]
        self.assertEqual(mentor_data["id"], str(mentor.pk))
        self.assertEqual(mentor_data["role"], "mentor")

    def test_user_can_create_mentorship_session_request(self):
        mentee = self.create_user("mentee1", "mentee1@example.com", "pass123", role="user")
        mentor = self.create_user("mentor2", "mentor2@example.com", "pass123", role="mentor")
        token = self.token_for(mentee)
        query = f"""
        mutation {{
          createMentorshipSessionRequest(
            mentorId: "{mentor.pk}",
            sessionDate: "2030-01-10",
            sessionTime: "09:00-10:00",
            sessionSlot: "09:00-10:00",
            questions: ["Career advice?", "How to grow skills?"]
          ) {{
            success
            mentorshipSession {{
              status
              sessionDate
              sessionTime
              sessionSlot
              mentor {{ id }}
              mentee {{ id }}
            }}
          }}
        }}
        """
        result = self.execute(query, token=token)
        self.assertIsNone(result.errors)
        data = result.data["createMentorshipSessionRequest"]
        self.assertTrue(data["success"])
        self.assertEqual(data["mentorshipSession"]["status"], "pending")
        self.assertEqual(data["mentorshipSession"]["sessionDate"], "2030-01-10")
        self.assertEqual(data["mentorshipSession"]["sessionTime"], "09:00-10:00")
        self.assertEqual(data["mentorshipSession"]["sessionSlot"], "09:00-10:00")
        self.assertEqual(data["mentorshipSession"]["mentor"]["id"], str(mentor.pk))
        self.assertEqual(data["mentorshipSession"]["mentee"]["id"], str(mentee.pk))

    def test_user_cannot_book_same_date_and_time_twice(self):
        mentee = self.create_user("mentee_dup", "mentee_dup@example.com", "pass123", role="user")
        mentor_a = self.create_user("mentor_dup_a", "mentor_dup_a@example.com", "pass123", role="mentor")
        mentor_b = self.create_user("mentor_dup_b", "mentor_dup_b@example.com", "pass123", role="mentor")
        token = self.token_for(mentee)

        first_query = f"""
        mutation {{
          createMentorshipSessionRequest(
            mentorId: "{mentor_a.pk}",
            sessionDate: "2030-02-15",
            sessionTime: "10:00-11:00",
            sessionSlot: "2030-02-15 10:00-11:00",
            questions: ["First request"]
          ) {{
            success
          }}
        }}
        """
        first_result = self.execute(first_query, token=token)
        self.assertIsNone(first_result.errors)
        self.assertTrue(first_result.data["createMentorshipSessionRequest"]["success"])

        duplicate_query = f"""
        mutation {{
          createMentorshipSessionRequest(
            mentorId: "{mentor_b.pk}",
            sessionDate: "2030-02-15",
            sessionTime: "10:00-11:00",
            sessionSlot: "2030-02-15 10:00-11:00",
            questions: ["Duplicate request"]
          ) {{
            success
            message
            mentorshipSession {{ id }}
          }}
        }}
        """
        duplicate_result = self.execute(duplicate_query, token=token)
        self.assertIsNone(duplicate_result.errors)
        payload = duplicate_result.data["createMentorshipSessionRequest"]
        self.assertFalse(payload["success"])
        self.assertEqual(
            payload["message"],
            "You already have a mentorship request for this date and time slot.",
        )
        self.assertIsNone(payload["mentorshipSession"])

    def test_mentor_can_accept_and_decline_mentorship_requests(self):
        mentor = self.create_user("mentor3", "mentor3@example.com", "pass123", role="mentor")
        mentee = self.create_user("mentee2", "mentee2@example.com", "pass123", role="user")
        session = MentorshipSession.objects.create(
            mentor=mentor,
            mentee=mentee,
            session_date="2030-01-12",
            session_time="14:00-15:00",
            session_slot="14:00-15:00",
            questions=["Help"],
            status=MentorshipSession.Status.PENDING,
        )
        token = self.token_for(mentor)

        accept_query = f"""
        mutation {{
          acceptMentorshipSessionRequest(sessionId: "{session.pk}") {{
            success
            mentorshipSession {{
              id
              status
            }}
          }}
        }}
        """
        accept_result = self.execute(accept_query, token=token)
        self.assertIsNone(accept_result.errors)
        self.assertTrue(accept_result.data["acceptMentorshipSessionRequest"]["success"])
        self.assertEqual(
            accept_result.data["acceptMentorshipSessionRequest"]["mentorshipSession"]["status"],
            "accepted",
        )

        session.status = MentorshipSession.Status.PENDING
        session.save(update_fields=["status", "updated_at"])
        decline_query = f"""
        mutation {{
          declineMentorshipSessionRequest(sessionId: "{session.pk}") {{
            success
            mentorshipSession {{
              id
              status
            }}
          }}
        }}
        """
        decline_result = self.execute(decline_query, token=token)
        self.assertIsNone(decline_result.errors)
        self.assertTrue(decline_result.data["declineMentorshipSessionRequest"]["success"])
        self.assertEqual(
            decline_result.data["declineMentorshipSessionRequest"]["mentorshipSession"]["status"],
            "declined",
        )

    def test_user_can_create_and_update_mentor_review_after_completed_session(self):
        mentor = self.create_user("mentor4", "mentor4@example.com", "pass123", role="mentor")
        mentee = self.create_user("mentee4", "mentee4@example.com", "pass123", role="user")
        MentorshipSession.objects.create(
            mentor=mentor,
            mentee=mentee,
            session_date="2020-01-01",
            session_time="11:00-12:00",
            session_slot="11:00-12:00",
            questions=["Help"],
            status=MentorshipSession.Status.ACCEPTED,
        )
        token = self.token_for(mentee)

        create_query = f"""
        mutation {{
          createMentorReview(mentorId: "{mentor.pk}", rating: 5, comment: "Very helpful mentor") {{
            success
            message
            review {{
              rating
              comment
              reviewer {{ id }}
              mentor {{ id }}
            }}
          }}
        }}
        """
        create_result = self.execute(create_query, token=token)
        self.assertIsNone(create_result.errors)
        self.assertTrue(create_result.data["createMentorReview"]["success"])
        self.assertEqual(create_result.data["createMentorReview"]["review"]["rating"], 5)

        update_query = f"""
        mutation {{
          createMentorReview(mentorId: "{mentor.pk}", rating: 4, comment: "Updated review") {{
            success
            message
            review {{
              rating
              comment
            }}
          }}
        }}
        """
        update_result = self.execute(update_query, token=token)
        self.assertIsNone(update_result.errors)
        self.assertTrue(update_result.data["createMentorReview"]["success"])
        self.assertEqual(update_result.data["createMentorReview"]["review"]["rating"], 4)
        self.assertEqual(MentorReview.objects.filter(mentor=mentor, reviewer=mentee).count(), 1)

    def test_user_cannot_review_without_accepted_session(self):
        mentor = self.create_user("mentor5", "mentor5@example.com", "pass123", role="mentor")
        mentee = self.create_user("mentee5", "mentee5@example.com", "pass123", role="user")
        token = self.token_for(mentee)
        query = f"""
        mutation {{
          createMentorReview(mentorId: "{mentor.pk}", rating: 5, comment: "Great") {{
            success
            message
            review {{ id }}
          }}
        }}
        """
        result = self.execute(query, token=token)
        self.assertIsNone(result.errors)
        self.assertFalse(result.data["createMentorReview"]["success"])
        self.assertIsNone(result.data["createMentorReview"]["review"])
        self.assertEqual(
            result.data["createMentorReview"]["message"],
            "You can only review mentors after a completed session.",
        )

    def test_recent_reviews_query_returns_latest_reviews(self):
        mentor = self.create_user("mentor6", "mentor6@example.com", "pass123", role="mentor")
        reviewer1 = self.create_user("reviewer1", "reviewer1@example.com", "pass123", role="user")
        reviewer2 = self.create_user("reviewer2", "reviewer2@example.com", "pass123", role="user")

        MentorReview.objects.create(mentor=mentor, reviewer=reviewer1, rating=4, comment="Helpful")
        MentorReview.objects.create(mentor=mentor, reviewer=reviewer2, rating=5, comment="Excellent")

        query = """
        query {
          recentReviews(limit: 2) {
            rating
            comment
            mentor { id }
            reviewer { id }
          }
        }
        """
        result = self.execute(query)
        self.assertIsNone(result.errors)
        reviews = result.data["recentReviews"]
        self.assertEqual(len(reviews), 2)
        self.assertEqual(reviews[0]["comment"], "Excellent")

    def test_my_sessions_marks_accepted_session_as_completed_when_time_has_passed(self):
        mentor = self.create_user("mentor7", "mentor7@example.com", "pass123", role="mentor")
        mentee = self.create_user("mentee7", "mentee7@example.com", "pass123", role="user")
        session = MentorshipSession.objects.create(
            mentor=mentor,
            mentee=mentee,
            session_date="2020-01-01",
            session_time="09:00-10:00",
            session_slot="2020-01-01 09:00-10:00",
            questions=["Session completion check"],
            status=MentorshipSession.Status.ACCEPTED,
        )

        query = """
        query {
          myMentorshipSessions {
            id
            status
          }
        }
        """
        result = self.execute(query, token=self.token_for(mentee))
        self.assertIsNone(result.errors)
        self.assertEqual(result.data["myMentorshipSessions"][0]["status"], "completed")

        refreshed = MentorshipSession.objects.filter(pk=session.pk).first()
        self.assertIsNotNone(refreshed)
        self.assertEqual(refreshed.status, MentorshipSession.Status.COMPLETED)

    def test_user_cannot_review_before_session_end_time(self):
        mentor = self.create_user("mentor8", "mentor8@example.com", "pass123", role="mentor")
        mentee = self.create_user("mentee8", "mentee8@example.com", "pass123", role="user")
        MentorshipSession.objects.create(
            mentor=mentor,
            mentee=mentee,
            session_date="2099-01-01",
            session_time="09:00-10:00",
            session_slot="2099-01-01 09:00-10:00",
            questions=["Future session"],
            status=MentorshipSession.Status.ACCEPTED,
        )

        mutation = f"""
        mutation {{
          createMentorReview(mentorId: "{mentor.pk}", rating: 5, comment: "Too early") {{
            success
            message
            review {{ id }}
          }}
        }}
        """
        result = self.execute(mutation, token=self.token_for(mentee))
        self.assertIsNone(result.errors)
        self.assertFalse(result.data["createMentorReview"]["success"])
        self.assertEqual(
            result.data["createMentorReview"]["message"],
            "You can only review mentors after a completed session.",
        )

    def test_non_user_cannot_request_mentorship_session(self):
        mentor = self.create_user("mentor9", "mentor9@example.com", "pass123", role="mentor")
        admin = self.create_user("admin9", "admin9@example.com", "pass123", role="admin")
        mutation = f"""
        mutation {{
          createMentorshipSessionRequest(
            mentorId: "{mentor.pk}",
            sessionDate: "2030-03-01",
            sessionTime: "11:00-12:00",
            sessionSlot: "2030-03-01 11:00-12:00",
            questions: ["Hi"]
          ) {{
            success
            message
          }}
        }}
        """
        mentor_result = self.execute(mutation, token=self.token_for(mentor))
        self.assertIsNone(mentor_result.errors)
        self.assertFalse(mentor_result.data["createMentorshipSessionRequest"]["success"])
        self.assertEqual(
            mentor_result.data["createMentorshipSessionRequest"]["message"],
            "Only mentee accounts can request mentorship sessions.",
        )
        admin_result = self.execute(mutation, token=self.token_for(admin))
        self.assertIsNone(admin_result.errors)
        self.assertFalse(admin_result.data["createMentorshipSessionRequest"]["success"])

    def test_blocks_request_when_mentor_has_accepted_session_same_slot(self):
        mentor = self.create_user("mentor10", "mentor10@example.com", "pass123", role="mentor")
        mentee_a = self.create_user("mentee_a", "mentee_a@example.com", "pass123", role="user")
        mentee_b = self.create_user("mentee_b", "mentee_b@example.com", "pass123", role="user")
        MentorshipSession.objects.create(
            mentor=mentor,
            mentee=mentee_a,
            session_date="2030-04-01",
            session_time="15:00-16:00",
            session_slot="2030-04-01 15:00-16:00",
            questions=["First"],
            status=MentorshipSession.Status.ACCEPTED,
        )

        mutation = f"""
        mutation {{
          createMentorshipSessionRequest(
            mentorId: "{mentor.pk}",
            sessionDate: "2030-04-01",
            sessionTime: "15:00-16:00",
            sessionSlot: "2030-04-01 15:00-16:00",
            questions: ["Second"]
          ) {{
            success
            message
          }}
        }}
        """
        result = self.execute(mutation, token=self.token_for(mentee_b))
        self.assertIsNone(result.errors)
        self.assertFalse(result.data["createMentorshipSessionRequest"]["success"])
        self.assertEqual(
            result.data["createMentorshipSessionRequest"]["message"],
            "This time slot is no longer available.",
        )

    def test_hidden_reviews_excluded_from_public_mentor_reviews(self):
        mentor = self.create_user("mentor11", "mentor11@example.com", "pass123", role="mentor")
        reviewer_a = self.create_user("rev11a", "rev11a@example.com", "pass123", role="user")
        reviewer_b = self.create_user("rev11b", "rev11b@example.com", "pass123", role="user")
        MentorReview.objects.create(mentor=mentor, reviewer=reviewer_a, rating=5, comment="Public", hidden=False)
        MentorReview.objects.create(mentor=mentor, reviewer=reviewer_b, rating=2, comment="Hidden", hidden=True)

        query = f"""
        query {{
          mentorReviews(mentorId: "{mentor.pk}") {{
            id
            comment
            hidden
          }}
        }}
        """
        result = self.execute(query)
        self.assertIsNone(result.errors)
        comments = {r["comment"] for r in result.data["mentorReviews"]}
        self.assertIn("Public", comments)
        self.assertNotIn("Hidden", comments)

    def test_admin_sees_hidden_reviews_on_mentor_profile(self):
        mentor = self.create_user("mentor12", "mentor12@example.com", "pass123", role="mentor")
        reviewer = self.create_user("rev12", "rev12@example.com", "pass123", role="user")
        admin = self.create_user("admin12", "admin12@example.com", "pass123", role="admin")
        MentorReview.objects.create(mentor=mentor, reviewer=reviewer, rating=3, comment="Secret", hidden=True)

        query = f"""
        query {{
          mentorReviews(mentorId: "{mentor.pk}") {{
            id
            comment
            hidden
          }}
        }}
        """
        result = self.execute(query, token=self.token_for(admin))
        self.assertIsNone(result.errors)
        self.assertEqual(len(result.data["mentorReviews"]), 1)
        self.assertEqual(result.data["mentorReviews"][0]["comment"], "Secret")

    def test_mentor_can_flag_review(self):
        mentor = self.create_user("mentor13", "mentor13@example.com", "pass123", role="mentor")
        reviewer = self.create_user("rev13", "rev13@example.com", "pass123", role="user")
        review = MentorReview.objects.create(mentor=mentor, reviewer=reviewer, rating=4, comment="Ok", flagged=False)

        mutation = f"""
        mutation {{
          flagMentorReview(reviewId: "{review.pk}") {{
            success
            review {{ id flagged }}
          }}
        }}
        """
        result = self.execute(mutation, token=self.token_for(mentor))
        self.assertIsNone(result.errors)
        self.assertTrue(result.data["flagMentorReview"]["success"])
        self.assertTrue(result.data["flagMentorReview"]["review"]["flagged"])

    def test_admin_can_hide_flagged_review(self):
        mentor = self.create_user("mentor14", "mentor14@example.com", "pass123", role="mentor")
        reviewer = self.create_user("rev14", "rev14@example.com", "pass123", role="user")
        admin = self.create_user("admin14", "admin14@example.com", "pass123", role="admin")
        review = MentorReview.objects.create(
            mentor=mentor, reviewer=reviewer, rating=5, comment="Spam", flagged=True, hidden=False
        )

        mutation = f"""
        mutation {{
          adminSetMentorReviewHidden(reviewId: "{review.pk}", hidden: true) {{
            success
            review {{ id hidden }}
          }}
        }}
        """
        result = self.execute(mutation, token=self.token_for(admin))
        self.assertIsNone(result.errors)
        self.assertTrue(result.data["adminSetMentorReviewHidden"]["success"])
        self.assertTrue(result.data["adminSetMentorReviewHidden"]["review"]["hidden"])
