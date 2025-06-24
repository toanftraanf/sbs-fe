import { Animated } from "react-native";
import { Stadium } from "./index";

export interface StadiumWithLocation extends Stadium {
  address?: string;
  rating?: number;
  price?: number;
  area?: number;
  numberOfFields?: number;
  status?: string;
  images?: string[];
  userId?: number;
  user?: {
    id: number;
    email?: string;
  };
  createdAt?: string;
}

export interface StadiumMapData {
  id: number;
  name: string;
  rating: number;
  address: string;
  image: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export interface StadiumCardProps {
  stadium: StadiumMapData;
  index: number;
  scrollX: Animated.Value;
  onPress: () => void;
  buttonText?: string;
}

export const CARD_WIDTH = 220;
export const CARD_SPACING = 16;
export const SNAP_TO = CARD_WIDTH + CARD_SPACING; 