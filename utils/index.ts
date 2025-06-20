import { Reservation } from "@/types";
import { type ClassValue, clsx } from "clsx";
import * as Location from "expo-location";
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

// Format Vietnamese address from geocoding data
export interface AddressComponents {
  // Expo Location format
  street?: string | null;
  district?: string | null;
  city?: string | null;
  region?: string | null;
  name?: string | null;
  subregion?: string | null;
  country?: string | null;
  streetNumber?: string | null;
  
  // Goong API format  
  formatted_address?: string;
  formattedAddress?: string | null;
}

export const formatVietnameseAddress = (
  addressData: AddressComponents,
  options: {
    format?: 'full' | 'short' | 'stadium';
    fallbackCoords?: { latitude: number; longitude: number };
  } = {}
): string => {
  const { format = 'stadium', fallbackCoords } = options;
  
  // If we have a pre-formatted address (from Goong API), use it for full format
  if (format === 'full' && (addressData.formatted_address || addressData.formattedAddress)) {
    return addressData.formatted_address || addressData.formattedAddress || '';
  }
  
  // Stadium format: "P. [ward], [district], [city]" (most common format)
  if (format === 'stadium') {
    const parts = [];
    
    // Ward (phường) - usually in district field from Expo Location
    if (addressData.district) {
      parts.push(addressData.district);
    }
    
    // District (quận) - usually in subregion field from Expo Location  
    if (addressData.subregion) {
      parts.push(addressData.subregion);
    }
    
    // City (thành phố)
    if (addressData.city) {
      parts.push(addressData.city);
    }
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }
  
  // Short format: "[district] [city]"
  if (format === 'short') {
    const parts = [];
    if (addressData.district) parts.push(addressData.district);
    if (addressData.city || addressData.region) {
      parts.push(addressData.city || addressData.region);
    }
    
    if (parts.length > 0) {
      return parts.join(' ');
    }
  }
  
  // Full format: Try to build comprehensive address
  if (format === 'full') {
    const parts = [
      addressData.streetNumber,
      addressData.street,
      addressData.name,
      addressData.district,
      addressData.subregion,
      addressData.city || addressData.region,
      addressData.country,
    ].filter((part) => part && part.trim() !== '');
    
    if (parts.length > 0) {
      return parts.join(' ');
    }
  }
  
  // Fallback options
  if (addressData.formatted_address || addressData.formattedAddress) {
    return addressData.formatted_address || addressData.formattedAddress || '';
  }
  
  if (addressData.street || addressData.name) {
    return `${addressData.street || ''} ${addressData.name || ''}`.trim();
  }
  
  // Final fallback to coordinates if provided
  if (fallbackCoords) {
    return `${fallbackCoords.latitude.toFixed(6)}, ${fallbackCoords.longitude.toFixed(6)}`;
  }
  
  return 'Vị trí không xác định';
};

// Location utilities
export interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

export interface LocationPermissionResult {
  granted: boolean;
  status: Location.PermissionStatus;
}

/**
 * Request location permission from user
 * @returns Promise with permission status
 */
export const requestLocationPermission = async (): Promise<LocationPermissionResult> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      status,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return {
      granted: false,
      status: 'undetermined' as Location.PermissionStatus,
    };
  }
};

/**
 * Check current location permission status
 * @returns Promise with permission status
 */
export const checkLocationPermission = async (): Promise<LocationPermissionResult> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      status,
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return {
      granted: false,
      status: 'undetermined' as Location.PermissionStatus,
    };
  }
};

/**
 * Reverse geocode coordinates to address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate  
 * @param format - Address format type
 * @returns Formatted address string
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
  format: 'full' | 'short' | 'stadium' = 'stadium'
): Promise<string> => {
  try {
    const addressResults = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addressResults && addressResults.length > 0) {
      const addr = addressResults[0];
      return formatVietnameseAddress(addr, {
        format,
        fallbackCoords: { latitude, longitude },
      });
    }
    
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

/**
 * Get current device location with address
 * @param format - Address format type
 * @param accuracy - GPS accuracy level
 * @returns Promise with location data and formatted address
 */
export const getCurrentLocation = async (
  format: 'full' | 'short' | 'stadium' = 'stadium',
  accuracy: Location.Accuracy = Location.Accuracy.High
): Promise<LocationResult | null> => {
  try {
    // Check/request permission first
    const permission = await requestLocationPermission();
    if (!permission.granted) {
      console.log('Location permission denied');
      return null;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({ accuracy });
    const { latitude, longitude } = location.coords;

    // Get formatted address
    const address = await reverseGeocode(latitude, longitude, format);

    return {
      latitude,
      longitude,
      address,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Get location with loading state management
 * @param format - Address format type
 * @param onStart - Callback when location fetch starts
 * @param onComplete - Callback when location fetch completes
 * @param onError - Callback when location fetch fails
 * @returns Promise with location data
 */
export const getCurrentLocationWithLoading = async (
  format: 'full' | 'short' | 'stadium' = 'stadium',
  callbacks?: {
    onStart?: () => void;
    onComplete?: (location: LocationResult | null) => void;
    onError?: (error: any) => void;
  }
): Promise<LocationResult | null> => {
  const { onStart, onComplete, onError } = callbacks || {};
  
  try {
    onStart?.();
    const location = await getCurrentLocation(format);
    onComplete?.(location);
    return location;
  } catch (error) {
    onError?.(error);
    onComplete?.(null);
    return null;
  }
};
