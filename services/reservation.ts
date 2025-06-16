import { getTodayLocalDate } from "@/utils/dateUtils";
import { gql } from "@apollo/client";
import { apolloClient } from '../config/apollo';
import { CreateReservationInput, Reservation } from '../types';

// =============================================================================
// GRAPHQL QUERIES & MUTATIONS
// =============================================================================

const CREATE_RESERVATION = gql`
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

const GET_STADIUM_RESERVATIONS = gql`
  query GetStadiumReservations($stadiumId: Int!, $date: String!) {
    stadiumReservations(stadiumId: $stadiumId, date: $date) {
      id
      userId
      stadiumId
      courtNumber
      date
      startTime
      endTime
      status
      sport
      courtType
      totalPrice
      createdAt
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
        fields {
          id
          fieldName
        }
      }
    }
  }
`;

const GET_USER_RESERVATIONS = gql`
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
      stadium {
        id
        name
        phone
        email
      }
    }
  }
`;

const GET_OWNER_STADIUM_RESERVATIONS = gql`
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

const GET_USER_RESERVATIONS_BY_DATE_RANGE = gql`
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
      stadium {
        id
        name
      }
      user {
        id
        phoneNumber
        fullName
        email
        avatar {
          url
        }
      }
    }
  }
`;

const GET_OWNER_STADIUM_RESERVATIONS_BY_DATE_RANGE = gql`
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
      }
      stadium {
        id
        name
      }
    }
  }
`;

const UPDATE_RESERVATION_STATUS = gql`
  mutation UpdateReservationStatus($id: Int!, $status: String!) {
    updateReservationStatus(id: $id, status: $status) {
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
      }
      stadium {
        id
        name
        phone
        email
        fields {
          id
          fieldName
        }
      }
    }
  }
`;

// =============================================================================
// RESERVATION API FUNCTIONS
// =============================================================================

/**
 * Create a new reservation
 */
export const createReservation = async (input: CreateReservationInput): Promise<Reservation> => {
  try {
    console.log('Creating reservation:', input);
    
    const { data } = await apolloClient.mutate({
      mutation: CREATE_RESERVATION,
      variables: { createReservationInput: input },
      errorPolicy: 'all'
    });
    
    console.log('✅ Reservation created:', data.createReservation);
    return data.createReservation;
  } catch (error) {
    console.error('💥 Error creating reservation:', error);
    throw error;
  }
};

/**
 * Get reservations for a specific stadium on a specific date
 */
export const getStadiumReservations = async (stadiumId: number, date: string, forceRefresh: boolean = false): Promise<Reservation[]> => {
  try {
    console.log('Fetching stadium reservations for:', { stadiumId, date, forceRefresh });
    
    const { data } = await apolloClient.query({
      query: GET_STADIUM_RESERVATIONS,
      variables: { stadiumId, date },
      fetchPolicy: forceRefresh ? 'network-only' : 'cache-first',
      errorPolicy: 'all'
    });
    
    console.log('✅ Stadium reservations fetched:', data.stadiumReservations?.length || 0);
    return data.stadiumReservations || [];
  } catch (error) {
    console.error('💥 Error fetching stadium reservations:', error);
    throw error;
  }
};

/**
 * Get all reservations for a specific user (customer)
 */
export const getUserReservations = async (userId: number, forceRefresh: boolean = false): Promise<Reservation[]> => {
  try {
    console.log('Fetching user reservations for userId:', userId, 'forceRefresh:', forceRefresh);
    
    const { data } = await apolloClient.query({
      query: GET_USER_RESERVATIONS,
      variables: { userId },
      fetchPolicy: forceRefresh ? 'network-only' : 'cache-first',
      errorPolicy: 'all'
    });
    return data.userReservations || [];
  } catch (error) {
    console.error('💥 Error fetching user reservations:', error);
    throw error;
  }
};

/**
 * Get all reservations for stadiums owned by a specific owner
 */
export const getOwnerStadiumReservations = async (ownerId: number, forceRefresh: boolean = false): Promise<Reservation[]> => {
  try {    
    const { data } = await apolloClient.query({
      query: GET_OWNER_STADIUM_RESERVATIONS,
      variables: { ownerId },
      fetchPolicy: forceRefresh ? 'network-only' : 'cache-first',
      errorPolicy: 'all'
    });
    
    return data.ownerStadiumReservations || [];
  } catch (error) {
    console.error('💥 Error fetching owner stadium reservations:', error);
    throw error;
  }
};

/**
 * Get user reservations within a date range
 */
export const getUserReservationsByDateRange = async (
  userId: number,
  startDate: string,
  endDate: string,
  forceRefresh: boolean = false
): Promise<Reservation[]> => {
  try {
    console.log('Fetching user reservations by date range:', { userId, startDate, endDate, forceRefresh });
    
    const { data } = await apolloClient.query({
      query: GET_USER_RESERVATIONS_BY_DATE_RANGE,
      variables: { userId },
      fetchPolicy: forceRefresh ? 'network-only' : 'cache-first',
      errorPolicy: 'all'
    });
    
    const allReservations = data.userReservations || [];
    console.log('✅ All user reservations fetched:', allReservations.length);
    
    // Filter by date range on client side
    const filteredReservations = allReservations.filter((reservation: Reservation) => {
      return reservation.date >= startDate && reservation.date <= endDate;
    });
    
    console.log('✅ Filtered reservations by date range:', filteredReservations.length, 'between', startDate, 'and', endDate);
    return filteredReservations;
  } catch (error) {
    console.error('💥 Error fetching user reservations by date range:', error);
    throw error;
  }
};

/**
 * Get owner stadium reservations within a date range
 */
export const getOwnerStadiumReservationsByDateRange = async (
  ownerId: number,
  startDate: string,
  endDate: string,
  forceRefresh: boolean = false
): Promise<Reservation[]> => {
  try {
    console.log('Fetching owner stadium reservations by date range:', { ownerId, startDate, endDate, forceRefresh });
    
    const { data } = await apolloClient.query({
      query: GET_OWNER_STADIUM_RESERVATIONS_BY_DATE_RANGE,
      variables: { ownerId, startDate, endDate },
      fetchPolicy: forceRefresh ? 'network-only' : 'cache-first',
      errorPolicy: 'all'
    });
    
    console.log('✅ Owner stadium reservations by date range fetched:', data.ownerStadiumReservationsByDateRange?.length || 0);
    return data.ownerStadiumReservationsByDateRange || [];
  } catch (error) {
    console.error('💥 Error fetching owner stadium reservations by date range:', error);
    throw error;
  }
};

/**
 * Update reservation status
 */
export const updateReservationStatus = async (
  reservationId: number,
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
): Promise<Reservation> => {
  try {
    console.log('🔄 Updating reservation status:', { 
      reservationId, 
      status,
      reservationIdType: typeof reservationId,
      statusType: typeof status 
    });
    
    // Validate inputs
    if (!reservationId || reservationId <= 0) {
      throw new Error(`Invalid reservation ID: ${reservationId}`);
    }
    
    if (!status || !['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    // Ensure ID is a number for GraphQL Int! type
    const numericId = typeof reservationId === 'string' ? parseInt(reservationId, 10) : reservationId;
    if (isNaN(numericId)) {
      throw new Error(`Invalid reservation ID format: ${reservationId}`);
    }
    
    const variables = { id: numericId, status };
    console.log('📤 Sending mutation variables:', variables);
    
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_RESERVATION_STATUS,
      variables,
      errorPolicy: 'all'
    });
    
    console.log('✅ Reservation status updated:', data.updateReservationStatus);
    return data.updateReservationStatus;
  } catch (error: any) {
    console.error('💥 Error updating reservation status:', error);
    
    // Log more details about the error
    if (error.networkError) {
      console.error('🌐 Network error details:', error.networkError);
      console.error('🌐 Network error message:', error.networkError.message);
      if (error.networkError.result) {
        console.error('🌐 Network error result:', error.networkError.result);
      }
    }
    
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      console.error('🔥 GraphQL errors:', error.graphQLErrors);
      error.graphQLErrors.forEach((gqlError: any, index: number) => {
        console.error(`🔥 GraphQL error ${index + 1}:`, gqlError.message);
        if (gqlError.extensions) {
          console.error(`🔥 GraphQL error ${index + 1} extensions:`, gqlError.extensions);
        }
      });
    }
    
    throw error;
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get current week date range (timezone-aware)
 */
export const getCurrentWeekDateRange = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  // Use timezone-aware formatting instead of toISOString()
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    startDate: formatLocalDate(startOfWeek),
    endDate: formatLocalDate(endOfWeek),
  };
};

/**
 * Get today's date in YYYY-MM-DD format (timezone-aware)
 */
export const getTodayDate = (): string => {
  return getTodayLocalDate();
};

/**
 * Filter reservations by date
 */
export const filterReservationsByDate = (reservations: Reservation[], date: string): Reservation[] => {
  return reservations.filter(reservation => reservation.date === date);
};

/**
 * Filter reservations by status
 */
export const filterReservationsByStatus = (
  reservations: Reservation[],
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
): Reservation[] => {
  return reservations.filter(reservation => reservation.status === status);
};

/**
 * Get reservations count by date
 */
export const getReservationsCountByDate = (reservations: Reservation[], date: string): number => {
  return filterReservationsByDate(reservations, date).length;
};

/**
 * Check if there are any reservations on a specific date
 */
export const hasReservationsOnDate = (reservations: Reservation[], date: string): boolean => {
  return getReservationsCountByDate(reservations, date) > 0;
}; 