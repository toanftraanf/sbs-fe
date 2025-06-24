import { gql } from "@apollo/client";

// =============================================================================
// AUTH QUERIES & MUTATIONS
// =============================================================================

export const GET_GOOGLE_AUTH_URL = gql`
  query {
    googleAuthUrl
  }
`;

export const GOOGLE_AUTH_MOBILE = gql`
  mutation GoogleAuthMobile($idToken: String!) {
    googleAuthMobile(idToken: $idToken) {
      id
      email
      phoneNumber
      status
      isVerified
    }
  }
`;

export const CHECK_EXISTING_USER = gql`
  mutation CheckExistingUser($phoneNumber: String!, $userRole: UserRole!) {
    checkExistingUser(phoneNumber: $phoneNumber, userRole: $userRole) {
      id
      phoneNumber
      status
      isVerified
    }
  }
`;

export const AUTHENTICATE = gql`
  mutation Authenticate($phoneNumber: String!, $otp: String!) {
    authenticate(phoneNumber: $phoneNumber, otp: $otp) {
      user {
        id
        phoneNumber
        status
        isVerified
        role
      }
      accessToken
      refreshToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout($accessToken: String!, $refreshToken: String) {
    logout(accessToken: $accessToken, refreshToken: $refreshToken)
  }
`;

export const RESET_OTP = gql`
  mutation ResetOTP($phoneNumber: String!) {
    resetOTP(phoneNumber: $phoneNumber)
  }
`;

export const REGISTER_OWNER = gql`
  mutation RegisterOwner($phoneNumber: String!, $fullName: String!) {
    registerOwner(phoneNumber: $phoneNumber, fullName: $fullName) {
      id
      phoneNumber
      fullName
      status
      isVerified
      role
    }
  }
`;

// TODO: Add proper REGISTER_CUSTOMER mutation in backend
export const REGISTER_CUSTOMER = gql`
  mutation RegisterCustomer($phoneNumber: String!, $fullName: String!) {
    registerCustomer(phoneNumber: $phoneNumber, fullName: $fullName) {
      id
      phoneNumber
      fullName
      status
      isVerified
      role
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      fullName
      dob
      sex
      address
      userType
      level
      email
      phoneNumber
      role
      status
      isVerified
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      phoneNumber
      role
      fullName
      email
      dob
      sex
      address
      latitude
      longitude
      userType
      level
      status
      isVerified
    }
  }
`;

// =============================================================================
// EVENTS QUERIES & MUTATIONS
// =============================================================================

export const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: String!) {
    joinEvent(eventId: $eventId) {
      id
      status
      joinedAt
      user {
        id
        fullName
        phoneNumber
      }
    }
  }
`;

export const LEAVE_EVENT = gql`
  mutation LeaveEvent($eventId: String!) {
    leaveEvent(eventId: $eventId)
  }
`;

// =============================================================================
// COACHES QUERIES
// =============================================================================

// Fragment for safe favorite sports fetching
const FAVORITE_SPORTS_FRAGMENT = gql`
  fragment FavoriteSportsFragment on User {
    favoriteSports {
      sport {
        id
        name
      }
    }
  }
`;

export const GET_ALL_COACHES = gql`
  ${FAVORITE_SPORTS_FRAGMENT}
  query GetAllCoach {
    coaches {
      id
      fullName
      rating
      avatar {
        url
      }
      ...FavoriteSportsFragment
      coachProfile {
        id
        hourlyRate
        isAvailable
        bio
      }
    }
  }
`;

export const GET_COACH_PROFILE_MOBILE = gql`
  ${FAVORITE_SPORTS_FRAGMENT}
  query GetCoachProfileMobile($coachProfileId: Int!) {
    coachProfile(id: $coachProfileId) {
      id
      bio
      hourlyRate
      isAvailable
      yearsOfExperience
      
      user {
        id
        fullName
        rating
        avatar {
          url
        }
        ...FavoriteSportsFragment
      }
    }
    
    coachReviewStats(coachProfileId: $coachProfileId) {
      averageRating
      totalReviews
    }
  }
`;

export const GET_COACH_PROFILE_FALLBACK = gql`
  query GetCoachProfileMobileFallback($coachProfileId: Int!) {
    coachProfile(id: $coachProfileId) {
      id
      bio
      hourlyRate
      isAvailable
      yearsOfExperience
      
      user {
        id
        fullName
        rating
        avatar {
          url
        }
      }
    }
    
    coachReviewStats(coachProfileId: $coachProfileId) {
      averageRating
      totalReviews
    }
  }
`;

// =============================================================================
// SPORTS QUERIES & MUTATIONS
// =============================================================================

export const GET_ALL_SPORTS = gql`
  query GetAllSports {
    sports {
      id
      name
      createdAt
    }
  }
`;

export const GET_USER_FAVORITE_SPORTS = gql`
  query GetUserFavoriteSports($userId: Int!) {
    userFavoriteSports(userId: $userId) {
      id
      sportId
      sport {
        id
        name
        createdAt
      }
      createdAt
    }
  }
`;

export const ADD_FAVORITE_SPORT = gql`
  mutation AddFavoriteSport($addFavoriteSportInput: AddFavoriteSportInput!) {
    addFavoriteSport(addFavoriteSportInput: $addFavoriteSportInput) {
      id
      userId
      sportId
      createdAt
    }
  }
`;

export const REMOVE_FAVORITE_SPORT = gql`
  mutation RemoveFavoriteSport($userId: Int!, $sportId: Int!) {
    removeFavoriteSport(userId: $userId, sportId: $sportId)
  }
`;

// =============================================================================
// STADIUM QUERIES & MUTATIONS
// =============================================================================

// Stadium fragment for reusability
const STADIUM_FRAGMENT = gql`
  fragment StadiumFields on Stadium {
    id
    name
    googleMap
    address
    latitude
    longitude
    phone
    email
    website
    otherContacts
    description
    startTime
    endTime
    otherInfo
    sports
    numberOfFields
    fields {
      id
      fieldName
    }
    bank
    accountName
    accountNumber
    price
    avatarUrl
    bannerUrl
    galleryUrls
  }
`;

// Get all stadiums
export const GET_ALL_STADIUMS = gql`
  query GetAllStadiums {
    stadiums {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Get stadium by ID
export const GET_STADIUM_BY_ID = gql`
  query GetStadium($id: Int!) {
    stadium(id: $id) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Get stadiums by user ID
export const GET_STADIUMS_BY_USER = gql`
  query GetStadiumsByUser($userId: Int!) {
    stadiumsByUser(userId: $userId) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Get stadiums by name
export const GET_STADIUMS_BY_NAME = gql`
  query GetStadiumsByName($name: String!) {
    stadiumsByName(name: $name) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Get stadiums by address
export const GET_STADIUMS_BY_ADDRESS = gql`
  query GetStadiumsByAddress($input: FindStadiumsByAddressInput!) {
    stadiumsByAddress(input: $input) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Create stadium
export const CREATE_STADIUM = gql`
  mutation CreateStadium($createStadiumInput: CreateStadiumInput!) {
    createStadium(createStadiumInput: $createStadiumInput) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Create stadium with steps
export const CREATE_STADIUM_WITH_STEPS = gql`
  mutation CreateStadiumWithSteps($createStadiumStepsInput: CreateStadiumStepsInput!) {
    createStadiumWithSteps(createStadiumStepsInput: $createStadiumStepsInput) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Update stadium
export const UPDATE_STADIUM = gql`
  mutation UpdateStadium($updateStadiumInput: UpdateStadiumInput!) {
    updateStadium(updateStadiumInput: $updateStadiumInput) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Update stadium bank info
export const UPDATE_STADIUM_BANK = gql`
  mutation UpdateStadiumBank($id: Int!, $input: UpdateStadiumBankInput!) {
    updateStadiumBank(id: $id, input: $input) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Update stadium images
export const UPDATE_STADIUM_IMAGES = gql`
  mutation UpdateStadiumImages($id: Int!, $input: UpdateStadiumImagesInput!) {
    updateStadiumImages(id: $id, input: $input) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// Delete stadium
export const DELETE_STADIUM = gql`
  mutation RemoveStadium($id: Int!) {
    removeStadium(id: $id) {
      ...StadiumFields
    }
  }
  ${STADIUM_FRAGMENT}
`;

// =============================================================================
// FILE UPLOAD QUERIES & MUTATIONS
// =============================================================================

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($uploadInput: DirectUploadInput!) {
    uploadImage(uploadInput: $uploadInput)
  }
`;

export const GET_FILES = gql`
  query GetFiles {
    files {
      id
      url
      publicId
      type
      createdAt
    }
  }
`;

export const GET_FILES_BY_TYPE = gql`
  query GetFilesByType($type: String!) {
    filesByType(type: $type) {
      id
      url
      publicId
      type
      createdAt
    }
  }
`;

// =============================================================================
// REVIEW QUERIES & MUTATIONS
// =============================================================================

export const CREATE_REVIEW = gql`
  mutation CreateReview($createReviewInput: CreateReviewInput!) {
    createReview(createReviewInput: $createReviewInput) {
      id
      reservationId
      stadiumId
      userId
      rating
      comment
      createdAt
    }
  }
`;

export const GET_STADIUM_REVIEWS = gql`
  query GetStadiumReviews($stadiumId: Int!) {
    stadiumReviews(stadiumId: $stadiumId) {
      id
      rating
      comment
      createdAt
      user {
        id
        fullName
        avatarId
        avatar {
          id
          url
        }
      }
    }
  }
`;

export const GET_REVIEW_STATS = gql`
  query GetReviewStats($stadiumId: Int!) {
    reviewStats(stadiumId: $stadiumId) {
      averageRating
      totalReviews
      ratingBreakdown {
        star1
        star2
        star3
        star4
        star5
      }
    }
  }
`;

export const GET_STADIUM_RESERVATIONS = gql`
  query GetStadiumReservations($stadiumId: Int!, $date: String!) {
    stadiumReservations(stadiumId: $stadiumId, date: $date) {
      id
      courtNumber
      date
      startTime
      endTime
      status
      sport
      courtType
    }
  }
`;

// Get all reservations for a specific user (customer)
export const GET_USER_RESERVATIONS = gql`
  query GetUserReservations($userId: Int!) {
    userReservations(userId: $userId) {
      id
      userId
      stadiumId
      sport
      courtType
      courtNumber
      date
      startTime
      endTime
      totalPrice
      status
      createdAt
      updatedAt
      user {
        id
        phoneNumber
        fullName
        email
        avatarId
        avatar {
          id
          url
        }
      }
      stadium {
        id
        name
        phone
        email
      }
    }
  }
`;

// Get all reservations for stadiums owned by a specific owner
export const GET_OWNER_STADIUM_RESERVATIONS = gql`
  query GetOwnerStadiumReservations($ownerId: Int!) {
    ownerStadiumReservations(ownerId: $ownerId) {
      id
      userId
      stadiumId
      sport
      courtType
      courtNumber
      date
      startTime
      endTime
      totalPrice
      status
      createdAt
      updatedAt
      user {
        id
        phoneNumber
        fullName
        email
      }
      stadium {
        id
        name
        phone
        email
      }
    }
  }
`;

// Get user reservations within a date range
export const GET_USER_RESERVATIONS_BY_DATE_RANGE = gql`
  query GetUserReservationsByDateRange($userId: Int!, $startDate: String!, $endDate: String!) {
    userReservationsByDateRange(userId: $userId, startDate: $startDate, endDate: $endDate) {
      id
      userId
      stadiumId
      sport
      courtType
      courtNumber
      date
      startTime
      endTime
      totalPrice
      status
      createdAt
      user {
        id
        phoneNumber
        fullName
        email
        avatarId
        avatar {
          id
          url
        }
      }
      stadium {
        id
        name
      }
    }
  }
`;

// Get owner stadium reservations within a date range  
export const GET_OWNER_STADIUM_RESERVATIONS_BY_DATE_RANGE = gql`
  query GetOwnerStadiumReservationsByDateRange($ownerId: Int!, $startDate: String!, $endDate: String!) {
    ownerStadiumReservationsByDateRange(ownerId: $ownerId, startDate: $startDate, endDate: $endDate) {
      id
      userId
      stadiumId
      sport
      courtType
      courtNumber
      date
      startTime
      endTime
      totalPrice
      status
      createdAt
      user {
        id
        phoneNumber
        fullName
        email
        avatarId
        avatar {
          id
          url
        }
      }
      stadium {
        id
        name
      }
    }
  }
`;

export const CREATE_RESERVATION = gql`
  mutation CreateReservation($createReservationInput: CreateReservationInput!) {
    createReservation(createReservationInput: $createReservationInput) {
      id
      userId
      stadiumId
      sport
      courtType
      courtNumber
      date
      startTime
      endTime
      totalPrice
      status
      createdAt
    }
  }
`;

// =============================================================================
// EVENTS QUERIES & MUTATIONS
// =============================================================================

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      additionalNotes
      eventDate
      startTime
      endTime
      maxParticipants
      isPrivate
      isSharedCost
      stadium {
        id
        name
        address
      }
      coach {
        id
        bio
        hourlyRate
        user {
          id
          fullName
          phoneNumber
        }
      }
      coachBooking {
        id
        totalPrice
        status
      }
      creator {
        id
        fullName
        phoneNumber
      }
      sports {
        id
        name
      }
      participants {
        id
        status
        joinedAt
        user {
          id
          fullName
          phoneNumber
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_EVENTS = gql`
  query GetMyEvents($userId: Int!) {
    myEvents(userId: $userId) {
      id
      title
      description
      additionalNotes
      eventDate
      startTime
      endTime
      maxParticipants
      isPrivate
      isSharedCost
      stadium {
        id
        name
        address
      }
      coach {
        id
        bio
        hourlyRate
        user {
          id
          fullName
          phoneNumber
        }
      }
      creator {
        id
        fullName
        phoneNumber
      }
      sports {
        id
        name
      }
      participants {
        id
        status
        joinedAt
        user {
          id
          fullName
          phoneNumber
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_EVENTS_BY_CREATOR = gql`
  query GetEventsByCreator($creatorId: Int!) {
    eventsByCreator(creatorId: $creatorId) {
      id
      title
      description
      additionalNotes
      eventDate
      startTime
      endTime
      maxParticipants
      isPrivate
      isSharedCost
      stadium {
        id
        name
        address
      }
      coach {
        id
        bio
        hourlyRate
        user {
          id
          fullName
          phoneNumber
        }
      }
      creator {
        id
        fullName
        phoneNumber
      }
      sports {
        id
        name
      }
      participants {
        id
        status
        joinedAt
        user {
          id
          fullName
          phoneNumber
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_EVENTS = gql`
  query GetAllEvents {
    events {
      id
      title
      description
      additionalNotes
      eventDate
      startTime
      endTime
      maxParticipants
      isPrivate
      isSharedCost
      stadium {
        id
        name
        address
        avatarUrl
      }
      coach {
        id
        bio
        hourlyRate
        user {
          id
          fullName
          phoneNumber
        }
      }
      creator {
        id
        fullName
        phoneNumber
      }
      sports {
        id
        name
      }
      participants {
        id
        status
        joinedAt
        user {
          id
          fullName
          phoneNumber
        }
      }
      createdAt
      updatedAt
    }
  }
`; 