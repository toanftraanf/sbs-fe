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
  mutation CheckExistingUser($phoneNumber: String!) {
    checkExistingUser(phoneNumber: $phoneNumber) {
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
      otherPayments
      pricingImages
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
      otherPayments
      pricingImages
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
    sports(ownerId: $ownerId) {
      id
      name
      location
    }
  }
`;

export const ADD_STADIUM = gql`
  mutation AddStadium($input: CreateStadiumInput!) {
    createStadium(createStadiumInput: $input) {
      id
      name
      location
    }
  }
`; 