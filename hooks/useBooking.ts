import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getStadiumReservations } from "@/services/reservation";
import { getStadiumsByUser } from "@/services/stadium";
import { Reservation, Stadium } from "@/types";
import { formatPrice } from "@/utils";
import { generateTimeSlots, getTodayLocalDate, getWeekDatesForSelector } from "@/utils/dateUtils";
import { useEffect, useState } from "react";

export default function useBooking() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState<"schedule" | "today">("schedule");
  const [selectedFilter, setSelectedFilter] = useState<"outdoor" | "indoor">(
    "outdoor"
  );
  const [weekDates] = useState(getWeekDatesForSelector());
  const [selectedDate, setSelectedDate] = useState(0);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null);
  const [loadingStadiums, setLoadingStadiums] = useState(false);
  const [showStadiumDropdown, setShowStadiumDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [courts, setCourts] = useState<string[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [slotStatus, setSlotStatus] = useState<string[][]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [loadingTodayReservations, setLoadingTodayReservations] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => { fetchUserStadiums(); }, [user]);
  useEffect(() => { if (selectedStadium) { generateStadiumTimeSlots(); generateStadiumCourts(); } }, [selectedStadium, selectedFilter]);
  useEffect(() => { if (selectedStadium && weekDates[selectedDate] && timeSlots.length > 0 && courts.length > 0) { fetchReservationsForDate(); } }, [selectedStadium, selectedDate, weekDates, selectedFilter, timeSlots, courts]);
  useEffect(() => { if (selectedStadium && (activeTab === "today" || activeTab === "schedule")) { fetchTodayReservations(); } }, [selectedStadium, selectedFilter, activeTab]);

  const fetchUserStadiums = async () => {
    if (!user?.id) return;
    try {
      setLoadingStadiums(true);
      const userId = parseInt(user.id);
      const userStadiums = await getStadiumsByUser(userId);
      setStadiums(userStadiums);
      if (userStadiums.length > 0) setSelectedStadium(userStadiums[0]);
    } catch (error) {
      setStadiums([]);
    } finally {
      setLoadingStadiums(false);
    }
  };

  const generateStadiumTimeSlots = () => {
    if (!selectedStadium) return;
    const startTime = selectedStadium.startTime || "07:00";
    const endTime = selectedStadium.endTime || "22:00";
    setTimeSlots(generateTimeSlots(startTime, endTime));
  };

  const generateStadiumCourts = () => {
    if (!selectedStadium) return;
    if (selectedStadium.fields && selectedStadium.fields.length > 0) {
      setCourts(selectedStadium.fields.map((field) => field.fieldName));
    } else {
      setCourts([]);
    }
  };

  const fetchTodayReservations = async (forceRefresh: boolean = false) => {
    if (!selectedStadium) return;
    try {
      setLoadingTodayReservations(true);
      const today = getTodayLocalDate();
      const stadiumReservations = await getStadiumReservations(
        parseInt(selectedStadium.id.toString()),
        today,
        forceRefresh
      );
      const filteredTodayReservations = stadiumReservations.filter((reservation) => {
        if (!reservation.courtType) return true;
        const courtTypeLower = reservation.courtType.toLowerCase();
        if (selectedFilter === "outdoor") {
          return (
            courtTypeLower.includes("outdoor") ||
            courtTypeLower.includes("ngoài trời") ||
            courtTypeLower.includes("sân ngoài") ||
            courtTypeLower === "outdoor"
          );
        } else {
          return (
            courtTypeLower.includes("indoor") ||
            courtTypeLower.includes("trong nhà") ||
            courtTypeLower.includes("sân trong") ||
            courtTypeLower === "indoor"
          );
        }
      });
      if (filteredTodayReservations.length === 0 && stadiumReservations.length > 0) {
        setTodayReservations(stadiumReservations);
      } else {
        setTodayReservations(filteredTodayReservations);
      }
    } catch (error) {
      setTodayReservations([]);
    } finally {
      setLoadingTodayReservations(false);
    }
  };

  const fetchReservationsForDate = async (forceRefresh: boolean = false) => {
    if (!selectedStadium || !weekDates[selectedDate]) return;
    try {
      setLoadingReservations(true);
      const dateStr = weekDates[selectedDate].fullDate;
      setReservations([]);
      const stadiumReservations = await getStadiumReservations(
        parseInt(selectedStadium.id.toString()),
        dateStr,
        forceRefresh
      );
      const filteredReservations = stadiumReservations.filter((reservation) => {
        if (!reservation.courtType) return true;
        const courtTypeLower = reservation.courtType.toLowerCase();
        if (selectedFilter === "outdoor") {
          return (
            courtTypeLower.includes("outdoor") ||
            courtTypeLower.includes("ngoài trời") ||
            courtTypeLower.includes("sân ngoài") ||
            courtTypeLower === "outdoor"
          );
        } else {
          return (
            courtTypeLower.includes("indoor") ||
            courtTypeLower.includes("trong nhà") ||
            courtTypeLower.includes("sân trong") ||
            courtTypeLower === "indoor"
          );
        }
      });
      if (filteredReservations.length === 0 && stadiumReservations.length > 0) {
        setReservations(stadiumReservations);
      } else {
        setReservations(filteredReservations);
      }
      const reservationsToUse =
        filteredReservations.length === 0 && stadiumReservations.length > 0
          ? stadiumReservations
          : filteredReservations;
      updateSlotStatus(reservationsToUse);
    } catch (error) {
      setReservations([]);
      initializeEmptySlotStatus();
    } finally {
      setLoadingReservations(false);
    }
  };

  const updateSlotStatus = (reservationData: Reservation[]) => {
    if (timeSlots.length === 0 || courts.length === 0) return;
    const status: string[][] = timeSlots.map(() => courts.map(() => "available"));
    reservationData.forEach((reservation) => {
      const { courtNumber, startTime, endTime, status: reservationStatus } = reservation;
      if (reservationStatus === "CANCELLED") return;
      const courtIndex = courtNumber - 1;
      if (courtIndex < 0 || courtIndex >= courts.length) return;
      let foundStart = false;
      for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
        const slot = timeSlots[slotIndex];
        const [slotStartTime, slotEndTime] = slot.split(" - ");
        if (slotStartTime === startTime) foundStart = true;
        if (foundStart) {
          status[slotIndex][courtIndex] = "selected";
          if (slotEndTime === endTime) break;
        }
      }
    });
    setSlotStatus(status);
  };

  const initializeEmptySlotStatus = () => {
    if (timeSlots.length === 0 || courts.length === 0) return;
    const status: string[][] = timeSlots.map(() => courts.map(() => "available"));
    setSlotStatus(status);
  };

  const hasReservationsOnDate = (dateStr: string): boolean => {
    return reservations.some((reservation) => reservation.date === dateStr);
  };

  const handleSlotPress = (rowIdx: number, colIdx: number) => {
    const currentStatus = slotStatus[rowIdx]?.[colIdx];
    if (currentStatus !== "selected") return;
    const clickedSlot = timeSlots[rowIdx];
    const [clickedStartTime, clickedEndTime] = clickedSlot.split(" - ");
    const clickedCourtNumber = colIdx + 1;
    const reservation = reservations.find((res) => {
      if (res.courtNumber !== clickedCourtNumber) return false;
      const resStartTime = res.startTime;
      const resEndTime = res.endTime;
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };
      const clickedStartMinutes = timeToMinutes(clickedStartTime);
      const clickedEndMinutes = timeToMinutes(clickedEndTime);
      const resStartMinutes = timeToMinutes(resStartTime);
      const resEndMinutes = timeToMinutes(resEndTime);
      return (
        clickedStartMinutes >= resStartMinutes &&
        clickedEndMinutes <= resEndMinutes
      );
    });
    if (reservation) {
      setSelectedReservation(reservation);
      setModalVisible(true);
    }
  };

  const handleStatusChange = async (
    reservationId: number,
    newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) => {
    try {
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
      setTodayReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
      if (selectedStadium) {
        if (activeTab === "schedule") {
          await fetchReservationsForDate(true);
        } else {
          await fetchTodayReservations(true);
        }
      }
    } catch (error) {}
  };

  const handleStadiumSelect = (stadium: Stadium) => {
    setSelectedStadium(stadium);
    setShowStadiumDropdown(false);
    setSelectedDate(0);
    setReservations([]);
    setSlotStatus([]);
  };

  const handleFilterChange = (filter: "outdoor" | "indoor") => {
    setSelectedFilter(filter);
    setReservations([]);
    setTodayReservations([]);
    setSlotStatus([]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "schedule") {
      await fetchReservationsForDate(true);
    } else {
      await fetchTodayReservations(true);
    }
    setRefreshing(false);
  };

  return {
    user,
    profile,
    profileLoading,
    activeTab,
    setActiveTab,
    selectedFilter,
    setSelectedFilter,
    weekDates,
    selectedDate,
    setSelectedDate,
    stadiums,
    setStadiums,
    selectedStadium,
    setSelectedStadium,
    loadingStadiums,
    setLoadingStadiums,
    showStadiumDropdown,
    setShowStadiumDropdown,
    refreshing,
    setRefreshing,
    timeSlots,
    setTimeSlots,
    courts,
    setCourts,
    reservations,
    setReservations,
    todayReservations,
    setTodayReservations,
    slotStatus,
    setSlotStatus,
    loadingReservations,
    setLoadingReservations,
    loadingTodayReservations,
    setLoadingTodayReservations,
    modalVisible,
    setModalVisible,
    selectedReservation,
    setSelectedReservation,
    fetchUserStadiums,
    generateStadiumTimeSlots,
    generateStadiumCourts,
    fetchTodayReservations,
    fetchReservationsForDate,
    updateSlotStatus,
    initializeEmptySlotStatus,
    hasReservationsOnDate,
    handleSlotPress,
    handleStatusChange,
    handleStadiumSelect,
    handleFilterChange,
    formatPrice,
    onRefresh,
  };
} 