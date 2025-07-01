import coachService from "@/services/coach";
import eventService from "@/services/event";
import { getStadiumById } from "@/services/stadium";
import { Coach, EventFormData, Stadium } from "@/types";
import { useCallback, useState } from "react";



interface EventFormErrors {
  [key: string]: string;
}

interface CreateEventInput {
  title: string;
  sports: number[];
  date: Date;
  startTime: string;
  endTime: string;
  stadiumId: number;
  coachId?: string;
  maxParticipants: number;
  description?: string;
  additionalNotes?: string;
  isSharedCost: boolean;
  isPrivate: boolean;
}

export const useEvent = () => {
  const [formData, setFormData] = useState<EventFormData>({
    eventTitle: "",
    selectedSports: [],
    eventDate: null,
    startTime: null,
    endTime: null,
    selectedStadium: null,
    selectedCoach: null,
    maxParticipants: "",
    description: "",
    additionalNotes: "",
    isSharedCost: false,
    isPrivate: false,
  });

  const [errors, setErrors] = useState<EventFormErrors>({});
  const [isCreating, setIsCreating] = useState(false);

  // Update form field
  const updateField = useCallback((field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Format time helper
  const formatTime = useCallback((date: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, []);

  // Format date helper
  const formatDate = useCallback((date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("vi-VN");
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: EventFormErrors = {};

    if (!formData.eventTitle.trim()) {
      newErrors.eventTitle = "Vui lòng nhập tên sự kiện";
    }

    if (formData.selectedSports.length === 0) {
      newErrors.sports = "Vui lòng chọn ít nhất một môn thể thao";
    }

    if (!formData.eventDate) {
      newErrors.eventDate = "Vui lòng chọn ngày";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Vui lòng chọn giờ bắt đầu";
    }

    if (!formData.endTime) {
      newErrors.endTime = "Vui lòng chọn giờ kết thúc";
    }

    // Validate time logic
    if (formData.startTime && formData.endTime) {
      if (formData.endTime <= formData.startTime) {
        newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
      }
    }

    // Validate date is not in the past
    if (formData.eventDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (formData.eventDate < today) {
        newErrors.eventDate = "Ngày tổ chức không thể là ngày trong quá khứ";
      }
    }

    if (!formData.selectedStadium) {
      newErrors.stadium = "Vui lòng chọn sân tập";
    }

    if (!formData.maxParticipants.trim()) {
      newErrors.maxParticipants = "Vui lòng nhập số người tham gia";
    } else {
      const participants = parseInt(formData.maxParticipants);
      if (isNaN(participants) || participants <= 0) {
        newErrors.maxParticipants = "Số người tham gia phải là số dương";
      } else if (participants < 2) {
        newErrors.maxParticipants = "Số người tham gia phải ít nhất 2 người";
      } else if (participants > 100) {
        newErrors.maxParticipants = "Số người tham gia không được quá 100 người";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Create event
  const createEvent = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsCreating(true);
    try {
      const eventInput: CreateEventInput = {
        title: formData.eventTitle.trim(),
        sports: formData.selectedSports,
        date: formData.eventDate!,
        startTime: formatTime(formData.startTime),
        endTime: formatTime(formData.endTime),
        stadiumId: formData.selectedStadium!.id,
        coachId: formData.selectedCoach?.id,
        maxParticipants: parseInt(formData.maxParticipants),
        description: formData.description.trim() || undefined,
        additionalNotes: formData.additionalNotes.trim() || undefined,
        isSharedCost: formData.isSharedCost,
        isPrivate: formData.isPrivate,
      };

      // TODO: Call API to create event
      console.log("Creating event with data:", eventInput);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful creation
      resetForm();
      
      return true;
    } catch (error) {
      console.error("Error creating event:", error);
      setErrors({ general: "Có lỗi xảy ra khi tạo sự kiện. Vui lòng thử lại." });
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [formData, validateForm, formatTime]);

  // Create event with provided data (for preview screen)
  const createEventWithData = useCallback(async (eventData: EventFormData): Promise<boolean> => {
    try {
      // Call the real event service to create the event
      const response = await eventService.createEvent(eventData);
      
      if (response?.createEvent?.id) {
        console.log("✅ Event created successfully with ID:", response.createEvent.id);
        return true;
      } else {
        throw new Error("Invalid response from event creation");
      }
    } catch (error) {
      console.error("❌ Error creating event with data:", error);
      throw error;
    }
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      eventTitle: "",
      selectedSports: [],
      eventDate: null,
      startTime: null,
      endTime: null,
      selectedStadium: null,
      selectedCoach: null,
      maxParticipants: "",
      description: "",
      additionalNotes: "",
      isSharedCost: false,
      isPrivate: false,
    });
    setErrors({});
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Helper functions for date/time handling
  const handleDateConfirm = useCallback((date: Date) => {
    updateField("eventDate", date);
  }, [updateField]);

  const handleStartTimeConfirm = useCallback((time: Date) => {
    updateField("startTime", time);
  }, [updateField]);

  const handleEndTimeConfirm = useCallback((time: Date) => {
    updateField("endTime", time);
  }, [updateField]);

  const handleStadiumSelect = useCallback((stadium: Stadium) => {
    updateField("selectedStadium", stadium);
  }, [updateField]);

  const handleCoachSelect = useCallback((coach: Coach) => {
    updateField("selectedCoach", coach);
  }, [updateField]);

  // Development helper - Load fake data for testing
  const loadFakeData = useCallback(async () => {
    if (!__DEV__) {
      console.warn("loadFakeData() can only be used in development environment");
      return;
    }

    try {
      // Sample event data for testing - set to 3 days from now at midnight
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      futureDate.setHours(0, 0, 0, 0); // Set to midnight
      
      const startTime = new Date();
      startTime.setHours(14, 0, 0, 0); // 2:00 PM
      
      const endTime = new Date();
      endTime.setHours(16, 0, 0, 0); // 4:00 PM

      const realStadium = await getStadiumById(5);
      console.log("✅ Stadium fetched:", realStadium);

      // Fetch available coaches and pick the first one
      console.log("🏃‍♂️ Fetching available coaches...");
      const allCoaches = await coachService.getCoachByProfileId(1);

      // Set all the fake data using real data from services
      setFormData({
        eventTitle: "Giải cầu lông cuối tuần",
        selectedSports: [1, 2], // Badminton and Tennis
        eventDate: futureDate,
        startTime: startTime,
        endTime: endTime,
        selectedStadium: realStadium, // Use real stadium from service
        selectedCoach: allCoaches, // Test without coach to isolate auth issue
        maxParticipants: "8",
        description: "Giải cầu lông thân thiện cho người mới bắt đầu. Mang theo vợt và giày thể thao.",
        additionalNotes: "Sẽ có nước uống miễn phí. Tập trung tại cổng chính lúc 13:45.",
        isSharedCost: true,
        isPrivate: false,
      });

      // Clear any existing errors
      setErrors({});
      
      console.log("🎯 Fake event data loaded with real stadium (no coach for testing)");
      console.log("📋 Form coach value:", formData.selectedCoach?.fullName || "null");
    } catch (error) {
      console.error("❌ Error loading fake data:", error);
      // Fallback to sample data if services fail
      const fallbackStadium = {
        id: 5,
        name: "Sân thể thao ABC (Fallback)",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        latitude: 10.762622,
        longitude: 106.660172,
        phone: "0901234567",
        email: "santheothaoabc@gmail.com",
        description: "Sân thể thao hiện đại với nhiều môn thể thao",
        startTime: "06:00",
        endTime: "22:00",
        sports: ["Cầu lông", "Tennis", "Bóng bàn"],
        numberOfFields: 5,
        price: 150000,
        fields: [
          { id: 1, fieldName: "Sân 1" },
          { id: 2, fieldName: "Sân 2" },
          { id: 3, fieldName: "Sân 3" },
        ],
        avatarUrl: "",
        bannerUrl: "",
        galleryUrls: [],
        otherContacts: [],
        otherInfo: "",
        website: "",
        googleMap: "",
        bank: "",
        accountName: "",
        accountNumber: "",
      };

      const fallbackCoach: Coach = {
        id: "1",
        fullName: "Nguyễn Văn An (Fallback)",
        rating: 4.5,
        avatar: {
          url: "https://via.placeholder.com/100",
        },
        favoriteSports: [
          {
            id: 1,
            userId: 1,
            sportId: 1,
            sport: { id: 1, name: "Cầu lông", createdAt: new Date().toISOString() },
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            userId: 1,
            sportId: 2,
            sport: { id: 2, name: "Tennis", createdAt: new Date().toISOString() },
            createdAt: new Date().toISOString(),
          },
        ],
        coachProfile: {
          id: "1",
          hourlyRate: 200000,
          isAvailable: true,
          bio: "Huấn luyện viên giàu kinh nghiệm với 5 năm trong nghề",
          yearsOfExperience: 5,
        },
      };
      
      updateField("selectedStadium", fallbackStadium);
      updateField("selectedCoach", fallbackCoach);
      console.log("⚠️ Used fallback stadium and coach due to service errors");
    }
  }, []);

  // Development helper - Clear all data
  const clearAllData = useCallback(() => {
    resetForm();
    console.log("🧹 All event form data cleared");
  }, [resetForm]);

  return {
    // Form data
    formData,
    errors,
    isCreating,
    
    // Actions
    updateField,
    createEvent,
    createEventWithData,
    resetForm,
    clearErrors,
    validateForm,
    
    // Helpers
    formatTime,
    formatDate,
    
    // Specific handlers
    handleDateConfirm,
    handleStartTimeConfirm,
    handleEndTimeConfirm,
    handleStadiumSelect,
    handleCoachSelect,

    // Development helpers (conditionally available)
    ...__DEV__ && {
      loadFakeData,
      clearAllData,
      isDevelopment: __DEV__,
    },
  };
};
