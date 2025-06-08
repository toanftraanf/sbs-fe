// =============================================================================
// AUTH TYPES
// =============================================================================

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  role: "OWNER" | "CUSTOMER";
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

export interface Stadium {
  id: number;
  name: string;
  googleMap: string;
  phone: string;
  email: string;
  website: string;
  otherContacts: string[];
  description: string;
  startTime: string;
  endTime: string;
  otherInfo: string;
  sports: string[];
  bank: string;
  accountName: string;
  accountNumber: string;
  otherPayments: string[];
  pricingImages: string[];
  avatarUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
}

export interface StadiumStep1Data {
  id: number;
  name: string;
  googleMap: string;
  phone: string;
  email: string;
  website: string;
  otherContacts: string[];
  description: string;
  startTime: string;
  endTime: string;
  otherInfo: string;
  sports: string[];
}

export interface StadiumStep2Data {
  id: number;
  bank: string;
  accountName: string;
  accountNumber: string;
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