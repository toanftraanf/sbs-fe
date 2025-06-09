export const LEFT_AREA_WIDTH_INPUT = 40;

export const images = {
  sportnowLogo: require("../assets/images/sportnow_logo.png"),
  onboardingBg: require("../assets/images/onboarding_bg.png"),
  badminton: require("../assets/images/badminton.png"),
  tennis: require("../assets/images/tennis.png"),
  tabletennis: require("../assets/images/table-tennis.png"),
  pickleball: require("../assets/images/pickleball.png"),
};

export const icons = {
  arrow_right: require("../assets/icons/right_line.png"),
  arrow_down: require("../assets/icons/down_line.png"),
  arrow_left_circle: require("../assets/icons/arrow_left_circle_line.png"),
  google: require("../assets/icons/google_icon.png"),
};

export const VERIFY_OTP_TIME = 60;

export enum UserLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PRO = 'pro',
}

export const USER_LEVEL_OPTIONS = [
  { label: 'Người mới bắt đầu', value: UserLevel.BEGINNER },
  { label: 'Trung bình', value: UserLevel.INTERMEDIATE },
  { label: 'Nâng cao', value: UserLevel.ADVANCED },
  { label: 'Chuyên nghiệp', value: UserLevel.PRO },
];

export const getUserLevelLabel = (level: UserLevel): string => {
  const option = USER_LEVEL_OPTIONS.find(opt => opt.value === level);
  return option?.label || level;
};

// Fake user data for debugging
export const FAKE_USER = {
  fullName: "Nguyễn Văn An",
  dateOfBirth: new Date(1995, 5, 15), // June 15, 1995
  gender: "male",
  address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  role: "player" as const,
  level: UserLevel.INTERMEDIATE, // Use enum value to ensure consistency
  sports: [1, 2], // Cầu lông (ID: 1) and Quần vợt (ID: 2) - backend sport IDs
};  
