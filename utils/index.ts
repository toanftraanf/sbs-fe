import { Reservation } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Group consecutive reservations by user, court, and date.
 */
export function groupConsecutiveReservations(reservations: Reservation[]) {
  if (!reservations.length) return [];
  // Group by user and court first
  const groupedByUserAndCourt: { [key: string]: Reservation[] } = {};
  reservations.forEach((reservation) => {
    const key = `${reservation.userId}-${reservation.courtNumber}-${reservation.date}`;
    if (!groupedByUserAndCourt[key]) {
      groupedByUserAndCourt[key] = [];
    }
    groupedByUserAndCourt[key].push(reservation);
  });
  const displayGroups: {
    reservations: Reservation[];
    startTime: string;
    endTime: string;
    representative: Reservation;
  }[] = [];
  // For each user-court group, find consecutive time slots
  Object.values(groupedByUserAndCourt).forEach((userCourtReservations) => {
    // Sort by start time
    const sorted = [...userCourtReservations].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    let currentGroup: Reservation[] = [];
    sorted.forEach((reservation, index) => {
      if (currentGroup.length === 0) {
        currentGroup = [reservation];
      } else {
        const lastReservation = currentGroup[currentGroup.length - 1];
        // Check if current reservation starts when the last one ends
        if (lastReservation.endTime === reservation.startTime) {
          currentGroup.push(reservation);
        } else {
          // Not consecutive, finalize current group
          displayGroups.push({
            reservations: currentGroup,
            startTime: currentGroup[0].startTime,
            endTime: currentGroup[currentGroup.length - 1].endTime,
            representative: currentGroup[0],
          });
          currentGroup = [reservation];
        }
      }
      // If this is the last reservation, finalize the group
      if (index === sorted.length - 1) {
        displayGroups.push({
          reservations: currentGroup,
          startTime: currentGroup[0].startTime,
          endTime: currentGroup[currentGroup.length - 1].endTime,
          representative: currentGroup[0],
        });
      }
    });
  });
  return displayGroups;
}

/**
 * Format a number as VND currency.
 */
export function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

/**
 * Transform API stadiums to StadiumMapData for map display.
 */
export function transformStadiums(apiStadiums: any[]): {
  id: number;
  name: string;
  rating: number;
  address: string;
  image: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}[] {
  return apiStadiums.map((stadium: any) => {
    return {
      id: stadium.id,
      name: stadium.name,
      rating: stadium.rating ?? 4.0,
      address: stadium.address ?? stadium.googleMap ?? "Địa chỉ không có",
      image:
        stadium.avatarUrl ??
        (stadium.images && stadium.images[0]) ??
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      coordinate: {
        latitude: stadium.latitude || 21.026745,
        longitude: stadium.longitude || 105.801982,
      },
    };
  });
}
