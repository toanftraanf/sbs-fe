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
  mutation CheckExistingUser($phoneNumber: String!, $userRole: String!) {
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
// FILE UPLOAD QUERIES & MUTATIONS
// =============================================================================

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($uploadInput: DirectUploadInput!) {
    uploadImage(uploadInput: $uploadInput)
  }
`;

export const CREATE_STADIUM_WITH_STEPS = gql`
  mutation CreateStadiumWithSteps($createStadiumStepsInput: CreateStadiumStepsInput!) {
    createStadiumWithSteps(createStadiumStepsInput: $createStadiumStepsInput) {
      id
      name
      email
      phone
      googleMap
      address
      latitude
      longitude
      startTime
      endTime
      description
      website
      otherInfo
      avatarUrl
      bannerUrl
      galleryUrls
      bank
      accountName
      accountNumber
      createdAt
    }
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
// STADIUM QUERIES & MUTATIONS
// =============================================================================

export const GET_STADIUMS_BY_USER = gql`
  query GetStadiumsByUser($userId: Int!) {
    stadiumsByUser(userId: $userId) {
      id
      name
      googleMap
      phone
      email
      website
      otherContacts
      description
      startTime
      endTime
      otherInfo
      sports
      bank
      accountName
      accountNumber
      avatarUrl
      bannerUrl
      galleryUrls
    }
  }
`;

export const GET_STADIUM_STEP1 = gql`
  query GetStadiumStep1($id: Int!) {
    stadiumsByUser(userId: $id) {
      id
      name
      googleMap
      phone
      email
      website
      otherContacts
      description
      startTime
      endTime
      otherInfo
      sports
    }
  }
`;

export const GET_STADIUM_STEP2 = gql`
  query GetStadiumStep2($id: Int!) {
    stadiumsByUser(userId: $id) {
      id
      bank
      accountName
      accountNumber
    }
  }
`;

export const GET_STADIUM_STEP3 = gql`
  query GetStadiumStep3($id: Int!) {
    stadiumsByUser(userId: $id) {
      id
      avatarUrl
      bannerUrl
      galleryUrls
    }
  }
`;

export const CREATE_STADIUM = gql`
  mutation CreateStadium($createStadiumInput: CreateStadiumInput!) {
    createStadium(createStadiumInput: $createStadiumInput) {
      id
    }
  }
`;

export const UPDATE_STADIUM_BANK = gql`
  mutation UpdateStadiumStep2($id: Int!, $input: UpdateStadiumBankInput!) {
    updateStadiumBank(id: $id, input: $input) {
      id
    }
  }
`;

export const UPDATE_STADIUM_IMAGES = gql`
  mutation UpdateStadiumImages($id: Int!, $input: UpdateStadiumImagesInput!) {
    updateStadiumImages(id: $id, input: $input) {
      id
      avatarUrl
      bannerUrl
      galleryUrls
    }
  }
`;

// Stadium Status (different from above)
export const GET_OWNER_STADIUMS = gql`
  query GetStadiumsByUser($ownerId: Int!) {
    stadiumsByUser(userId: $ownerId) {
      id
      name
      googleMap
      phone
      email
      avatarUrl
      description
    }
  }
`;

export const ADD_STADIUM = gql`
  mutation AddStadium($input: CreateStadiumInput!) {
    createStadium(createStadiumInput: $input) {
      id
      name
    }
  }
`;

export const GET_STADIUM_BY_ID = gql`
  query Stadium($id: Int!) {
    stadium(id: $id) {
      id
      name
      phone
      email
      website
      googleMap
      description
      startTime
      endTime
      otherInfo
      avatarUrl
      bannerUrl
      galleryUrls
      sports
      rating
      price
      numberOfFields
      bank
      accountName
      accountNumber
      otherContacts
      fields {
        id
        fieldName
      }
      createdAt
      user {
        id
        email
        fullName
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