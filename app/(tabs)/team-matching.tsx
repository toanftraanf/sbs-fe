// app/team-matching.tsx
import AppHeader from "@/components/AppHeader";
import BackgroundDecor from "@/components/BackgroundDecor";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swiper from "react-native-deck-swiper";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_WIDTH * 1.2;

type Friend = {
  id: number;
  name: string;
  age: number;
  avatarUrl: string;
  location: string;
  schedule: string;
};
const mockData: Friend[] = [
  { id: 1, name: "Văn B", age: 24, avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. Long Thạnh Mỹ, Thủ Đức, TP. HCM", schedule: "T2, T4, T6 từ 06:30–09:00 và 15:00–18:00" },
  { id: 2, name: "Huy C", age: 30, avatarUrl: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. Bến Nghé, Quận 1, TP. HCM", schedule: "T2, T4 từ 07:00–10:00 và 17:00–19:00" },
  { id: 3, name: "Lan D", age: 28, avatarUrl: "https://images.unsplash.com/photo-1531891437562-331a99a7fd47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. Phú Mỹ, Quận 7, TP. HCM", schedule: "T3, T5 từ 08:00–11:00 và 14:00–16:00" },
  { id: 4, name: "Minh E", age: 26, avatarUrl: "https://images.unsplash.com/photo-1544725176-7c40e5a2c314?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. 15, Quận 10, TP. HCM", schedule: "T2, T6 từ 06:30–09:30 và 16:00–18:00" },
  { id: 5, name: "Trang F", age: 25, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. Tân Thuận Đông, Quận 7, TP. HCM", schedule: "T4, T7 từ 07:30–10:30 và 15:00–17:30" },
  { id: 6, name: "Quang G", age: 29, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. 12, Quận Gò Vấp, TP. HCM", schedule: "T3, T5, CN từ 06:00–09:00" },
  { id: 7, name: "Thảo H", age: 23, avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. 6, Quận 3, TP. HCM", schedule: "T2–T6 từ 18:00–20:00" },
  { id: 8, name: "Nam I", age: 27, avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. 2, Quận Bình Thạnh, TP. HCM", schedule: "T4, T7 từ 07:00–10:00" },
  { id: 9, name: "Vy K", age: 22, avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. 9, Quận Phú Nhuận, TP. HCM", schedule: "T3, T6 từ 08:00–11:00 và 16:00–18:00" },
  { id: 10, name: "Long L", age: 31, avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. 5, Quận 8, TP. HCM", schedule: "T2, T5 từ 06:30–09:30" },
  { id: 11, name: "Nga M", age: 24, avatarUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60", location: "P. 4, Quận 4, TP. HCM", schedule: "T4, T7 từ 17:00–20:00 và CN từ 08:00–11:00" },
];

export default function TeamMatchingScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const cards = mockData.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const swiperRef = useRef<Swiper<Friend>>(null);

  const dragX = useRef(new Animated.Value(0)).current;
  const heartOpacity = dragX.interpolate({
    inputRange: [0, 80, 150],
    outputRange: [0, 0.6, 0],
    extrapolate: "clamp",
  });
  const nopeOpacity = dragX.interpolate({
    inputRange: [-150, -80, 0],
    outputRange: [0, 0.6, 0],
    extrapolate: "clamp",
  });
  const heartScale = dragX.interpolate({
    inputRange: [0, 80],
    outputRange: [0.5, 1],
    extrapolate: "clamp",
  });
  const nopeScale = dragX.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0.5],
    extrapolate: "clamp",
  });

  const handleSwiping = (x: number) => dragX.setValue(x);
  const handleSwiped = () => {
    Animated.timing(dragX, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const onSwipedLeft = (i: number) => console.log("❌", cards[i]?.name);
  const onSwipedRight = (i: number) => console.log("❤️", cards[i]?.name);

  const renderCard = (card: Friend | null) => {
    if (!card) return null;
    return (
      <View style={styles.card}>
        <Image source={{ uri: card.avatarUrl }} style={styles.avatar} />
        <View style={styles.infoPanel}>
          <View style={styles.infoHeader}>
            <Text style={styles.name}>{card.name}</Text>
            <Text style={styles.ageText}>{card.age}t</Text>
          </View>
          <View style={styles.infoLine}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{card.location}</Text>
          </View>
          <View style={styles.infoLine}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{card.schedule}</Text>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <Ionicons name="close-outline" size={28} color="#D32F2F" />
          <Ionicons name="star-outline" size={28} color="#FBC02D" />
          <View style={styles.mainAction}>
            <Ionicons name="hand-left-outline" size={24} color="#fff" />
          </View>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#4CAF50" />
          <Ionicons name="chevron-forward-outline" size={28} color="#4CAF50" />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
       <BackgroundDecor />

      <AppHeader
        title="Nguyễn Văn A"
        subtitle="Quận 9, TP. HCM"
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => {}}
        onDocPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
      />

      <View style={styles.swiperWrapper}>
        <Swiper
          ref={swiperRef}
          cards={cards}
          renderCard={renderCard}
          onSwiping={handleSwiping}
          onSwiped={handleSwiped}
          onSwipedLeft={onSwipedLeft}
          onSwipedRight={onSwipedRight}
          cardIndex={0}
          stackSize={3}
          stackSeparation={12}
          verticalSwipe={false}
          backgroundColor="transparent"
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.overlayIcon,
            { opacity: heartOpacity, transform: [{ scale: heartScale }] },
          ]}
        >
          <Ionicons name="heart-outline" size={120} color="#5A983B" />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.overlayIcon,
            { opacity: nopeOpacity, transform: [{ scale: nopeScale }] },
          ]}
        >
          <Ionicons name="close-outline" size={120} color="red" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4EA",
  },
  decorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorIcon: {
    position: "absolute",
    color: "#5A983B",
    opacity: 0.12,
  },
  swiperWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  avatar: {
    width: "100%",
    height: "90%",
  },
  infoPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 84,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  ageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5A983B",
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#666",
  },
  actionsRow: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  mainAction: {
    backgroundColor: "#5A983B",
    padding: 16,
    borderRadius: 32,
    marginTop: -24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  overlayIcon: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.4,
    alignSelf: "center",
    zIndex: 999,
    elevation: 999,
  },
});
