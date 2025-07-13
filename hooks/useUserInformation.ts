import { FAKE_USER, USER_LEVEL_OPTIONS } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth";
import { gql, useMutation } from "@apollo/client";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export type UserInformationStep = 1 | 2 | 3;

interface UseUserInformationOptions {
  useFakeData?: boolean;
}

// Đặt mutation giống hệt backend schema của bạn
const CREATE_COACH_PROFILE = gql`
  mutation CreateCoachProfile($input: CreateCoachProfileInput!) {
    createCoachProfile(input: $input) {
      id
      userId
      bio
      sports
      rates {
        sport
        price
      }
      location
      phone
      avatarUrl
      coachImages
      isAvailable
      yearsOfExperience
      certifications
      minSessionDuration
      maxSessionDuration
      createdAt
      updatedAt
    }
  }
`;

export const useUserInformation = (
  initialStep: UserInformationStep = 1,
  options: UseUserInformationOptions = {}
) => {
  const { user, setUser } = useAuth();
  const { useFakeData = false } = options;
  const isDevelopment = __DEV__;
  const shouldUseFakeData = isDevelopment && useFakeData;
 const [createCoachProfile] = useMutation(CREATE_COACH_PROFILE);
  // ─── Step management ─────────────────────────────
  const [currentStep, setCurrentStep] = useState<UserInformationStep>(initialStep);

  // ─── Personal state ──────────────────────────────
  const [fullName, setFullName] = useState<string>(
    shouldUseFakeData ? FAKE_USER.fullName : ""
  );
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

  // ─── Coach-specific state ────────────────────────
  const [bio, setBio] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [rates, setRates] = useState<Record<number, string>>({});
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("");
  const [certifications, setCertifications] = useState<string>("");
  const [minSessionDuration, setMinSessionDuration] = useState<string>("");
  const [maxSessionDuration, setMaxSessionDuration] = useState<string>("");
  const [availability, setAvailability] = useState<boolean>(true);

  // ─── UI state ────────────────────────────────────
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ─── Development helpers ─────────────────────────
  const loadFakeData = () => {
    if (!isDevelopment) return;
    // personal
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
    // coach
    setBio("");
    setPhone("");
    setRates({});
    setYearsOfExperience("");
    setCertifications("");
    setMinSessionDuration("");
    setMaxSessionDuration("");
    setAvailability(true);
    setErrors({});
  };
  const clearAllData = () => {
    setFullName("");
    setDateOfBirth(null);
    setGender(null);
    setLocation(null);
    setRole("player");
    setLevel(null);
    setSelectedSports([]);
    setBio("");
    setPhone("");
    setRates({});
    setYearsOfExperience("");
    setCertifications("");
    setMinSessionDuration("");
    setMaxSessionDuration("");
    setAvailability(true);
    setErrors({});
  };

  // ─── Validation ─────────────────────────────────
  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Vui lòng nhập tên người dùng";
    if (!dateOfBirth) e.dateOfBirth = "Vui lòng chọn ngày sinh";
    if (!gender) e.gender = "Vui lòng chọn giới tính";
    if (!location) e.location = "Vui lòng chọn vị trí của bạn";
    if (!level) e.level = "Vui lòng chọn trình độ";
    if (selectedSports.length === 0)
      e.sports = "Vui lòng chọn ít nhất một môn thể thao";
    setErrors(e);
    if (Object.keys(e).length) {
      Alert.alert("Thông tin chưa hợp lệ", Object.values(e)[0]);
      return false;
    }
    return true;
  };
  const validateCoachInfo = (): boolean => {
    const e: Record<string, string> = {};
    if (!bio.trim()) e.bio = "Nhập phần giới thiệu";
    if (!phone.trim()) e.phone = "Nhập số điện thoại";
    if (selectedSports.length === 0)
      e.selectedSports = "Chọn ít nhất 1 môn huấn luyện";
    selectedSports.forEach((sid) => {
      const v = rates[sid];
      if (!v || isNaN(Number(v)) || Number(v) <= 0) {
        e[`rate_${sid}`] = "Giá phải > 0";
      }
    });
    if (!yearsOfExperience || isNaN(Number(yearsOfExperience)))
      e.yearsOfExperience = "Nhập năm kinh nghiệm";
    if (!minSessionDuration || isNaN(Number(minSessionDuration)))
      e.minSessionDuration = "Nhập thời gian tối thiểu";
    if (!maxSessionDuration || isNaN(Number(maxSessionDuration)))
      e.maxSessionDuration = "Nhập thời gian tối đa";
    setErrors(e);
    if (Object.keys(e).length) {
      Alert.alert("Thông tin huấn luyện viên chưa hợp lệ", Object.values(e)[0]);
      return false;
    }
    return true;
  };

  // ─── Handlers Step 1 ────────────────────────────
  const handleFullNameChange = (t: string) => {
    setFullName(t);
    if (errors.fullName) {
      const o = { ...errors };
      delete o.fullName;
      setErrors(o);
    }
  };
  const handleDateOfBirthChange = (d: Date | null) => {
    setDateOfBirth(d);
    if (errors.dateOfBirth) {
      const o = { ...errors };
      delete o.dateOfBirth;
      setErrors(o);
    }
  };
  const handleGenderChange = (g: string | null) => {
    setGender(g);
    if (errors.gender) {
      const o = { ...errors };
      delete o.gender;
      setErrors(o);
    }
  };
  const handleLocationSelect = (l: LocationData) => {
    setLocation(l);
    if (errors.location) {
      const o = { ...errors };
      delete o.location;
      setErrors(o);
    }
  };
  const handleLevelChange = (l: string | null) => {
    setLevel(l);
    if (errors.level) {
      const o = { ...errors };
      delete o.level;
      setErrors(o);
    }
  };
  const handleSportsChange = (s: number[]) => {
    setSelectedSports(s);
    if (errors.sports) {
      const o = { ...errors };
      delete o.sports;
      setErrors(o);
    }
  };
  const handleShowLocationPicker = () => setShowLocationPicker(true);
  const handleCloseLocationPicker = () => setShowLocationPicker(false);

  // ─── Navigation ─────────────────────────────────
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(role === "coach" ? 2 : 3);
      }
    } else if (currentStep === 2 && role === "coach") {
      if (validateCoachInfo()) {
        setCurrentStep(3);
      }
    }
  };
  const goToPreviousStep = () => {
    if (currentStep === 3 && role === "coach") {
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep(1);
    }
  };

  // ─── Summary helpers ────────────────────────────
  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString("vi-VN") : "Chưa chọn";
  const getGenderLabel = (g: string | null) => {
    const m: Record<string, string> = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return g ? m[g] || g : "Chưa chọn";
  };
  const getRoleLabel = (r: "player" | "coach") =>
    r === "coach" ? "Huấn luyện viên" : "Người chơi";
  const getSportsLabels = (ids: number[]) => {
    const m: Record<number, string> = {
      1: "Cầu lông",
      2: "Quần vợt",
      3: "Bóng bàn",
      4: "Pickleball",
    };
    return ids.length ? ids.map((i) => m[i] || `Sport ${i}`).join(", ") : "Chưa chọn";
  };
  const getLevelLabel = (l: string | null) => {
    if (!l) return "Chưa chọn";
    return USER_LEVEL_OPTIONS.find((o) => o.value === l)?.label || l;
  };
const levelMapping: Record<string, "BEGINNER"|"INTERMEDIATE"|"ADVANCED"|"PRO"> = {
  beginner: "BEGINNER",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED",
  pro: "PRO",
};
  // ─── Final submission ────────────────────────────
  const handleComplete = async () => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
      return;
    }
    setIsLoading(true);
     try {
    if (role === 'coach') {
      const updated = await authService.updateUserProfileWithSports({
        userId: +user.id,
        fullName: fullName.trim(),
        dob: dateOfBirth!.toISOString().slice(0, 10),
        sex:
          gender === 'male'
            ? 'MALE'
            : gender === 'female'
            ? 'FEMALE'
            : 'OTHER',
        address: location!.address,
        latitude: location!.latitude,
        longitude: location!.longitude,
        userType: 'PLAYER',
        level: levelMapping[level!] || 'BEGINNER',
        sportIds: selectedSports,
      });
      setUser({ ...user, ...updated });

      router.push('/coach-information');
     
    } else {
      // Nhánh cho player giữ nguyên
      const updated = await authService.updateUserProfileWithSports({
        userId: +user.id,
        fullName: fullName.trim(),
        dob: dateOfBirth!.toISOString().slice(0, 10),
        sex:
          gender === 'male'
            ? 'MALE'
            : gender === 'female'
            ? 'FEMALE'
            : 'OTHER',
        address: location!.address,
        latitude: location!.latitude,
        longitude: location!.longitude,
        userType: 'PLAYER',
        level: levelMapping[level!] || 'BEGINNER',
        sportIds: selectedSports,
      });
      setUser({ ...user, ...updated });
      if (user.role === 'OWNER') {
        router.push('/(auth)/stadium-information-step1');
      } else {
        router.push('/(tabs)');
      }
    }

    // Sau cả hai nhánh đều hiện thông báo thành công
    Alert.alert('Thành công', 'Đã lưu thông tin', [{ text: 'OK' }]);
  } catch (error) {
    console.error(error);
    Alert.alert('Lỗi', 'Không thể lưu, vui lòng thử lại sau');
  } finally {
    setIsLoading(false);
  }
  };

  return {
    // navigation
    currentStep,
    goToNextStep,
    goToPreviousStep,
    // personal
    fullName,
    dateOfBirth,
    gender,
    location,
    role,
    level,
    selectedSports,
    // coach
    bio,
    setBio,
    phone,
    setPhone,
    rates,
    setRates,
    yearsOfExperience,
    setYearsOfExperience,
    certifications,
    setCertifications,
    minSessionDuration,
    setMinSessionDuration,
    maxSessionDuration,
    setMaxSessionDuration,
    availability,
    setAvailability,
    // UI
    showLocationPicker,
    errors,
    isLoading,
    // constants
    userLevelOptions: USER_LEVEL_OPTIONS,
    // handlers step1
    handleFullNameChange,
    handleDateOfBirthChange,
    handleGenderChange,
    handleLocationSelect,
    setRole,
    handleLevelChange,
    handleSportsChange,
    handleShowLocationPicker,
    validateStep1,
    user,
    handleCloseLocationPicker,
    // dev
    ...(isDevelopment && { loadFakeData, clearAllData, isDevelopment }),
    // summary
    formattedData: {
      fullName: fullName || "Chưa nhập",
      dateOfBirth: formatDate(dateOfBirth),
      gender: getGenderLabel(gender),
      address: location?.address || "Chưa nhập",
      role: getRoleLabel(role),
      level: getLevelLabel(level),
      sports: getSportsLabels(selectedSports),
    },
    // final
    handleComplete,
  };
};
