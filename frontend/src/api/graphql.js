import { gql } from 'graphql-request'

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    registerUser(username: $username, email: $email, password: $password) {
      success
      message
      user { id username email role }
    }
  }
`

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      success
      message
      token
      user { id username email role }
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $firstName: String
    $lastName: String
    $address: String
    $bio: String
    $occupation: String
    $expertise: String
    $profilePicture: String
  ) {
    updateMyProfile(
      firstName: $firstName
      lastName: $lastName
      address: $address
      bio: $bio
      occupation: $occupation
      expertise: $expertise
      profilePicture: $profilePicture
    ) {
      success
      message
      user {
        id
        username
        email
        role
        firstName
        lastName
        address
        bio
        occupation
        expertise
        profilePicture
      }
    }
  }
`

export const MENTORS = gql`
  query {
    mentors {
      id
      username
      email
      role
      bio
      occupation
      expertise
      profilePicture
    }
  }
`

export const MENTOR = gql`
  query Mentor($mentorId: String!) {
    mentor(mentorId: $mentorId) {
      id
      username
      email
      bio
      occupation
      expertise
      role
      profilePicture
      averageRating
      reviewsCount
    }
  }
`

export const MENTOR_REVIEWS = gql`
  query MentorReviews($mentorId: String!) {
    mentorReviews(mentorId: $mentorId) {
      id
      rating
      comment
      flagged
      hidden
      createdAt
      reviewer { id username }
    }
  }
`

export const RECENT_REVIEWS = gql`
  query RecentReviews($limit: Int) {
    recentReviews(limit: $limit) {
      id
      rating
      comment
      flagged
      hidden
      createdAt
      mentor { id username }
      reviewer { id username }
    }
  }
`

export const FLAGGED_MENTOR_REVIEWS = gql`
  query FlaggedMentorReviews {
    flaggedMentorReviews {
      id
      rating
      comment
      flagged
      hidden
      createdAt
      mentor { id username }
      reviewer { id username }
    }
  }
`

export const CREATE_MENTOR_REVIEW = gql`
  mutation CreateMentorReview($mentorId: String!, $rating: Int!, $comment: String) {
    createMentorReview(mentorId: $mentorId, rating: $rating, comment: $comment) {
      success
      message
      review { id rating comment flagged hidden createdAt reviewer { id username } }
    }
  }
`

export const FLAG_MENTOR_REVIEW = gql`
  mutation FlagMentorReview($reviewId: String!) {
    flagMentorReview(reviewId: $reviewId) {
      success
      message
      review { id flagged hidden }
    }
  }
`

export const ADMIN_SET_MENTOR_REVIEW_HIDDEN = gql`
  mutation AdminSetMentorReviewHidden($reviewId: String!, $hidden: Boolean!) {
    adminSetMentorReviewHidden(reviewId: $reviewId, hidden: $hidden) {
      success
      message
      review { id flagged hidden }
    }
  }
`

export const CREATE_SESSION = gql`
  mutation Create($mentorId: String!, $sessionDate: String!, $sessionTime: String!, $sessionSlot: String!, $questions: [String]) {
    createMentorshipSessionRequest(
      mentorId: $mentorId
      sessionDate: $sessionDate
      sessionTime: $sessionTime
      sessionSlot: $sessionSlot
      questions: $questions
    ) {
      success
      message
      mentorshipSession { id status sessionDate sessionTime sessionSlot mentor { id username } mentee { id username } }
    }
  }
`

export const MY_SESSIONS = gql`
  query {
    myMentorshipSessions {
      id
      status
      mentor { id username }
      mentee { id username }
      sessionDate
      sessionTime
      sessionSlot
      questions
      createdAt
    }
  }
`

export const ALL_USERS = gql`
  query AllUsers {
    allUsers {
      id
      username
      email
      role
      createdAt
    }
  }
`

export const ADMIN_SET_USER_ROLE = gql`
  mutation AdminSetUserRole($userId: String!, $role: String!) {
    adminSetUserRole(userId: $userId, role: $role) {
      success
      message
      user { id username email role }
    }
  }
`

export const ACCEPT_SESSION = gql`
  mutation Accept($sessionId: String!) {
    acceptMentorshipSessionRequest(sessionId: $sessionId) {
      success
      message
      mentorshipSession { id status }
    }
  }
`

export const DECLINE_SESSION = gql`
  mutation Decline($sessionId: String!) {
    declineMentorshipSessionRequest(sessionId: $sessionId) {
      success
      message
      mentorshipSession { id status }
    }
  }
`
