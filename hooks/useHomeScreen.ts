import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  getCurrentWeekDateRange,
  getOwnerStadiumReservationsByDateRange,
  getUserReservationsByDateRange,
} from "@/services/reservation";
import { Reservation } from "@/types";
import { groupConsecutiveReservations } from "@/utils";
import { getTodayLocalDate, getWeekDatesLocal } from "@/utils/dateUtils";
import { useEffect, useState } from "react";

export function useHomeScreen() {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stadiumReservations, setStadiumReservations] = useState<Reservation[]>([]);
  const [weekDates, setWeekDates] = useState(getWeekDatesLocal());
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Function to check if a date has user reservations (for customers)
  const hasReservationOnDate = (dateStr: string) => {
    return reservations.some((reservation) => reservation.date === dateStr);
  };

  // Function to check if a date has stadium reservations (for owners)
  const hasStadiumReservationOnDate = (dateStr: string) => {
    return stadiumReservations.some((reservation) => reservation.date === dateStr);
  };

  // Get today's reservations count for customers
  const getTodayReservationsCount = () => {
    const today = getTodayLocalDate();
    return reservations.filter((reservation) => reservation.date === today).length;
  };

  // Get today's reservations for customers (all statuses)
  const getTodayCustomerReservations = () => {
    const today = getTodayLocalDate();

    const filteredReservations = reservations.filter(
      (reservation) => reservation.date === today
    );

    return filteredReservations;
  };

  // Get today's stadium reservations count for owners
  const getTodayStadiumReservationsCount = () => {
    const today = getTodayLocalDate();
    return stadiumReservations.filter((reservation) => reservation.date === today).length;
  };

  // Get today's confirmed reservations for owners
  const getTodayReservations = () => {
    const today = getTodayLocalDate();
    return stadiumReservations.filter((reservation) => reservation.date === today);
  };

  // Get pending reservations for owners (all dates)
  const getPendingReservations = () => {
    return stadiumReservations.filter((reservation) => reservation.status === "PENDING");
  };

  // Function to fetch user reservations for the current week
  const fetchUserReservations = async (forceRefresh: boolean = false) => {
    try {
      setIsLoadingReservations(true);
      const userId = parseInt(user?.id || "0");

      const { startDate, endDate } = getCurrentWeekDateRange();

      if (!userId || userId <= 0) {
        setReservations([]);
        return;
      }

      const userReservations = await getUserReservationsByDateRange(
        userId,
        startDate,
        endDate,
        forceRefresh
      );

      setReservations(userReservations);
    } catch (error) {
      setReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // Function to fetch stadium reservations for owners for the current week
  const fetchStadiumReservations = async (forceRefresh: boolean = false) => {
    try {
      setIsLoadingReservations(true);
      const ownerId = parseInt(user?.id || "0");
      const { startDate, endDate } = getCurrentWeekDateRange();

      const ownerStadiumReservations = await getOwnerStadiumReservationsByDateRange(
        ownerId,
        startDate,
        endDate,
        forceRefresh
      );

      setStadiumReservations(ownerStadiumReservations);
    } catch (error) {
      setStadiumReservations([]);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh week dates in case the date has changed
      setWeekDates(getWeekDatesLocal());

      // Refresh reservations based on user role with forceRefresh = true
      if (user?.role === "CUSTOMER") {
        await fetchUserReservations(true);
      } else if (user?.role === "OWNER") {
        await fetchStadiumReservations(true);
      }
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  // Handle modal actions
  const handleReservationPress = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedReservation(null);
  };

  const handleStatusChange = async (reservationId: number, newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    try {
      // Update the reservation status in the local state
      if (user?.role === "OWNER") {
        setStadiumReservations((prev) =>
          prev.map((reservation) =>
            reservation.id === reservationId
              ? { ...reservation, status: newStatus }
              : reservation
          )
        );
        // Refresh owner data with forceRefresh
        await fetchStadiumReservations(true);
      } else {
        setReservations((prev) =>
          prev.map((reservation) =>
            reservation.id === reservationId
              ? { ...reservation, status: newStatus }
              : reservation
          )
        );
        // Refresh customer data with forceRefresh
        await fetchUserReservations(true);
      }

      // Close the modal
      setModalVisible(false);
      setSelectedReservation(null);
    } catch (error) {
    }
  };

  // Effects
  useEffect(() => {
    setWeekDates(getWeekDatesLocal());

    // Fetch reservations when user is available
    if (user?.id) {
      if (user.role === "CUSTOMER") {
        fetchUserReservations();
      } else if (user.role === "OWNER") {
        fetchStadiumReservations();
      }
    }
  }, [user]);

  return {
    // State
    user,
    profile,
    loading,
    reservations,
    stadiumReservations,
    weekDates,
    isLoadingReservations,
    refreshing,
    modalVisible,
    selectedReservation,

    // Data helper functions
    hasReservationOnDate,
    hasStadiumReservationOnDate,
    getTodayReservationsCount,
    getTodayCustomerReservations,
    getTodayStadiumReservationsCount,
    getTodayReservations,
    getPendingReservations,
    groupConsecutiveReservations,

    // Actions
    fetchUserReservations,
    fetchStadiumReservations,
    onRefresh,
    handleReservationPress,
    handleModalClose,
    handleStatusChange,
  };
} 