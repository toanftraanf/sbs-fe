// =============================================================================
// AUTH TYPES
// =============================================================================

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export type UserRole = "OWNER" | "CUSTOMER";

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  fullName?: string;
  email?: string;
  dob?: string;
  sex?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  userType?: "PLAYER" | "COACH";
  level?: string;
  status?: string;
  isVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface UpdateUserInput {
  id: number;
  fullName?: string;
  email?: string;
  dob?: string;
  sex?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  userType?: "PLAYER" | "COACH";
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";
}

// =============================================================================
// SPORTS TYPES
// =============================================================================

export interface Sport {
  id: number;
  name: string;
  createdAt: string;
  userCount?: number;
}

export interface UserFavoriteSport {
  id: number;
  userId: number;
  sportId: number;
  sport: Sport;
  createdAt: string;
}

// =============================================================================
// STADIUM TYPES
// =============================================================================

export interface StadiumField {
  id: number;
  fieldName: string;
}

export interface Stadium {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  googleMap?: string; // Keep for backward compatibility
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  startTime?: string;
  endTime?: string;
  otherInfo?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  galleryUrls?: string[];
  sports?: string[];
  rating?: number;
  price?: number;
  area?: number;
  numberOfFields?: number;
  fields?: StadiumField[];
  bank?: string;
  accountName?: string;
  accountNumber?: string;
  otherPayments?: string[];
  otherContacts?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StadiumStep1Data {
  id: number;
  name: string;
  googleMap?: string; // Keep for backward compatibility
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  otherContacts: string[];
  description: string;
  startTime: string;
  endTime: string;
  otherInfo: string;
  sports: string[];
  fields: string[];
}

export interface StadiumStep2Data {
  id: number;
  bank: string;
  accountName: string;
  accountNumber: string;
  price?: number;
  otherPayments: string[];
  pricingImages: string[];
}

export interface StadiumStep3Data {
  id: number;
  avatarUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface PickerOption {
  label: string;
  value: string;
}

export interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  containerClassName?: string;
}

// =============================================================================
// ENUM TYPES
// =============================================================================

export enum UserLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PRO = 'pro',
}

// =============================================================================
// RESERVATION TYPES
// =============================================================================

export interface Reservation {
  id: number;
  userId: number;
  stadiumId: number;
  sport: string;
  courtType: string;
  courtNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    phoneNumber: string;
    fullName?: string;
    email?: string;
    avatarId?: string;
    avatar?: {
      id: string;
      url: string;
    };
  };
  stadium?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    fields?: StadiumField[];
  };
}

export interface CreateReservationInput {
  userId: number;
  stadiumId: number;
  sport: string;
  courtType: string;
  courtNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status?: string;
}

export interface Review {
  id: number;
  reservationId: number;
  stadiumId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    avatarId?: string;
    avatar?: {
      id: string;
      url: string;
    };
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    star1: number;
    star2: number;
    star3: number;
    star4: number;
    star5: number;
  };
}

export interface CreateReviewInput {
  reservationId: number;
  stadiumId: number;
  userId: number;
  rating: number;
  comment: string;
} 