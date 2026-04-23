from django.test import TestCase
from django.conf import settings
import bcrypt  # type: ignore
import jwt  # type: ignore

from backend.schema import schema
from users.models import MentorshipSession, User


class _Context:
    def __init__(self, headers=None):
        self.headers = headers or {}


class FreeMentorsGraphQLTests(TestCase):
    def setUp(self):
        User.drop_collection()
        MentorshipSession.drop_collection()

    def tearDown(self):
        User.drop_collection()
        MentorshipSession.drop_collection()

    def execute(self, query, token=None):
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return schema.execute(query, context_value=_Context(headers=headers))

    def create_user(self, username, email, password, role="user"):
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user = User(username=username, email=email, password=hashed_password, role=role)
        user.save()
        return user

    def token_for(self, user):
        payload = {"user_id": str(user.id), "email": user.email, "role": user.role}
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
          changeUserToMentor(userId: "{str(target_user.id)}") {{
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
          mentor(mentorId: "{str(mentor.id)}") {{
            id
            email
            role
          }}
        }}
        """
        mentor_result = self.execute(mentor_query)
        self.assertIsNone(mentor_result.errors)
        mentor_data = mentor_result.data["mentor"]
        self.assertEqual(mentor_data["id"], str(mentor.id))
        self.assertEqual(mentor_data["role"], "mentor")

    def test_user_can_create_mentorship_session_request(self):
        mentee = self.create_user("mentee1", "mentee1@example.com", "pass123", role="user")
        mentor = self.create_user("mentor2", "mentor2@example.com", "pass123", role="mentor")
        token = self.token_for(mentee)
        query = f"""
        mutation {{
          createMentorshipSessionRequest(
            mentorId: "{str(mentor.id)}",
            questions: ["Career advice?", "How to grow skills?"]
          ) {{
            success
            mentorshipSession {{
              status
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
        self.assertEqual(data["mentorshipSession"]["mentor"]["id"], str(mentor.id))
        self.assertEqual(data["mentorshipSession"]["mentee"]["id"], str(mentee.id))

    def test_mentor_can_accept_and_decline_mentorship_requests(self):
        mentor = self.create_user("mentor3", "mentor3@example.com", "pass123", role="mentor")
        mentee = self.create_user("mentee2", "mentee2@example.com", "pass123", role="user")
        session = MentorshipSession(mentor=mentor, mentee=mentee, questions=["Help"], status="pending")
        session.save()
        token = self.token_for(mentor)

        accept_query = f"""
        mutation {{
          acceptMentorshipSessionRequest(sessionId: "{str(session.id)}") {{
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

        session.status = "pending"
        session.save()
        decline_query = f"""
        mutation {{
          declineMentorshipSessionRequest(sessionId: "{str(session.id)}") {{
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
