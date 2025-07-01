import { FAKE_USER, USER_LEVEL_OPTIONS } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export type UserInformationStep = 1 | 2;

interface UseUserInformationOptions {
  useFakeData?: boolean;
}

export const useUserInformation = (
  initialStep: UserInformationStep = 1,
  options: UseUserInformationOptions = {}
) => {
  const { user, setUser } = useAuth();
  const { useFakeData = false } = options;
  
  // Check if we're in development environment
  const isDevelopment = __DEV__;
  const shouldUseFakeData = isDevelopment && useFakeData;
  
  // Step management
  const [currentStep, setCurrentStep] = useState<UserInformationStep>(initialStep);

  // Form data state - empty by default, fake data only in dev if requested
  const [fullName, setFullName] = useState(shouldUseFakeData ? FAKE_USER.fullName : "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    shouldUseFakeData ? FAKE_USER.dateOfBirth : null
  );
  const [gender, setGender] = useState<string | null>(
    shouldUseFakeData ? FAKE_USER.gender : null
  );
  const [location, setLocation] = useState<LocationData | null>(
    shouldUseFakeData && FAKE_USER.address
      ? {
          latitude: 10.852909,
          longitude: 106.789989,
          address: FAKE_USER.address,
        }
      : null
  );
  const [role, setRole] = useState<"player" | "coach">(
    shouldUseFakeData ? FAKE_USER.role : "player"
  );
  const [level, setLevel] = useState<string | null>(
    shouldUseFakeData ? FAKE_USER.level : null
  );
  const [selectedSports, setSelectedSports] = useState<number[]>(
    shouldUseFakeData ? FAKE_USER.sports : []
  );

  // UI state
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Development helper functions
  const loadFakeData = () => {
    if (!isDevelopment) {
      console.warn("loadFakeData() can only be used in development environment");
      return;
    }
    
    setFullName(FAKE_USER.fullName);
    setDateOfBirth(FAKE_USER.dateOfBirth);
    setGender(FAKE_USER.gender);
    setLocation(
      FAKE_USER.address
        ? {
            latitude: 21.067202382989908, 
            longitude: 105.88560925379234,
            address: FAKE_USER.address,
          }
        : null
    );
    setRole(FAKE_USER.role);
    setLevel(FAKE_USER.level);
    setSelectedSports(FAKE_USER.sports);
    
    // Clear any existing errors
    setErrors({});
    
    console.log("Fake data loaded for development");
  };

  const clearAllData = () => {
    setFullName("");
    setDateOfBirth(null);
    setGender(null);
    setLocation(null);
    setRole("player");
    setLevel(null);
    setSelectedSports([]);
    setErrors({});
    
    console.log("All form data cleared");
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName || fullName.trim() === "") {
      newErrors.fullName = "Vui lòng nhập tên người dùng";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Tên phải có ít nhất 2 ký tự";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    } else {
      const age = new Date().getFullYear() - dateOfBirth.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = "Bạn phải từ 13 tuổi trở lên";
      } else if (age > 100) {
        newErrors.dateOfBirth = "Vui lòng nhập ngày sinh hợp lệ";
      }
    }

    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    if (!location) {
      newErrors.location = "Vui lòng chọn vị trí của bạn";
    }

    if (!level) {
      newErrors.level = "Vui lòng chọn trình độ";
    }

    if (selectedSports.length === 0) {
      newErrors.sports = "Vui lòng chọn ít nhất một môn thể thao";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  // Event handlers for Step 1
  const handleFullNameChange = (text: string) => {
    setFullName(text);
    clearFieldError("fullName");
  };

  const handleDateOfBirthChange = (date: Date | null) => {
    setDateOfBirth(date);
    clearFieldError("dateOfBirth");
  };

  const handleGenderChange = (value: string | null) => {
    setGender(value);
    clearFieldError("gender");
  };

  const handleLocationSelect = (selectedLocation: LocationData) => {
    setLocation(selectedLocation);
    clearFieldError("location");
  };

  const handleLevelChange = (value: string | null) => {
    setLevel(value);
    clearFieldError("level");
  };

  const handleSportsChange = (sports: number[]) => {
    setSelectedSports(sports);
    clearFieldError("sports");
  };

  const handleShowLocationPicker = () => setShowLocationPicker(true);
  const handleCloseLocationPicker = () => setShowLocationPicker(false);

  // Step navigation
  const goToNextStep = () => {
    if (currentStep === 1) {
      console.log("validateStep1", validateStep1());
      if (validateStep1()) {
        setCurrentStep(2);
      } else {
        const firstError = Object.values(errors)[0];
        Alert.alert("Thông tin không hợp lệ", firstError);
      }
    }
  };

  const goToPreviousStep = () => {
    console.log("goToPreviousStep called, currentStep:", currentStep);
    if (currentStep === 2) {
      console.log("Switching from step 2 to step 1");
      setCurrentStep(1);
    } else if (currentStep === 1) {
      console.log("Already on step 1, no navigation needed");
      // When using unified component, step 1 doesn't need to go anywhere
      // The component itself handles the overall navigation flow
    }
  };

  // Formatting functions for Step 2
  const formatDate = (date: Date | null) => {
    if (!date) return "Chưa chọn";
    return date.toLocaleDateString("vi-VN");
  };

  const getGenderLabel = (genderValue: string | null) => {
    const labels: { [key: string]: string } = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return genderValue ? labels[genderValue] || genderValue : "Chưa chọn";
  };

  const getRoleLabel = (roleValue: "player" | "coach") => {
    const labels = {
      player: "Người chơi",
      coach: "Huấn luyện viên",
    };
    return labels[roleValue];
  };

  const getSportsLabels = (sportIds: number[]) => {
    const sportsMap: { [key: number]: string } = {
      1: "Cầu lông",
      2: "Quần vợt",
      3: "Bóng bàn",
      4: "Pickleball",
    };
    if (sportIds.length === 0) return "Chưa chọn";
    return sportIds.map((id) => sportsMap[id] || `Sport ${id}`).join(", ");
  };

  const getLevelLabel = (levelValue: string | null) => {
    if (!levelValue) return "Chưa chọn";
    const levelOption = USER_LEVEL_OPTIONS.find(option => option.value === levelValue);
    return levelOption?.label || levelValue;
  };

  // Final submission for Step 2
  const handleComplete = async () => {
    if (!user?.id) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Convert data to backend format
      const sexMapping: { [key: string]: "MALE" | "FEMALE" | "OTHER" } = {
        male: "MALE",
        female: "FEMALE",
        other: "OTHER",
      };

      const userTypeMapping: { [key: string]: "PLAYER" | "COACH" } = {
        player: "PLAYER",
        coach: "COACH",
      };

      const levelMapping: { [key: string]: string } = {
        beginner: "BEGINNER",
        intermediate: "INTERMEDIATE",
        advanced: "ADVANCED",
        pro: "PRO",
      };

      // Save user information to backend
      const updatedUser = await authService.updateUserProfileWithSports({
        userId: parseInt(user.id),
        fullName: fullName.trim(),
        dob: new Date(dateOfBirth!).toISOString().split("T")[0],
        sex: sexMapping[gender!] || "OTHER",
        address: location!.address.trim(),
        latitude: location!.latitude,
        longitude: location!.longitude,
        userType: userTypeMapping[role] || "PLAYER",
        level: levelMapping[level!] || "BEGINNER",
        sportIds: selectedSports,
      });

      // Update user context with new data
      setUser({
        ...user,
        fullName: updatedUser.fullName,
        dob: updatedUser.dob,
        sex: updatedUser.sex,
        address: updatedUser.address,
        userType: updatedUser.userType,
        level: updatedUser.level,
      });

      Alert.alert(
        "Thành công",
        "Thông tin cá nhân đã được cập nhật thành công!",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate based on user role
              if (user.role === "OWNER") {
                router.push("/(auth)/stadium-information-step1");
              } else {
                router.push("/(tabs)");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error saving user information:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Step management
    currentStep,
    setCurrentStep,

    // Form data state
    fullName,
    dateOfBirth,
    gender,
    location,
    role,
    level,
    selectedSports,

    // UI state
    showLocationPicker,
    errors,
    isLoading,

    // Constants
    userLevelOptions: USER_LEVEL_OPTIONS,

    // Step 1 handlers
    handleFullNameChange,
    handleDateOfBirthChange,
    handleGenderChange,
    handleLocationSelect,
    setRole,
    handleLevelChange,
    handleSportsChange,
    handleShowLocationPicker,
    handleCloseLocationPicker,

    // Navigation
    goToNextStep,
    goToPreviousStep,

    // Step 2 formatting
    formatDate,
    getGenderLabel,
    getRoleLabel,
    getSportsLabels,
    getLevelLabel,

    // Final submission
    handleComplete,

    // Computed values for Step 2
    formattedData: {
      fullName: fullName || "Chưa nhập",
      dateOfBirth: formatDate(dateOfBirth),
      gender: getGenderLabel(gender),
      address: location?.address || "Chưa nhập",
      role: getRoleLabel(role),
      level: getLevelLabel(level),
      sports: getSportsLabels(selectedSports),
    },

    // Development helpers (only available in development)
    ...(isDevelopment && {
      loadFakeData,
      clearAllData,
      isDevelopment,
      useFakeData: shouldUseFakeData,
    }),
  };
}; 