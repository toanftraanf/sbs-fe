// app/team-matching.tsx
import AppHeader from '@/components/AppHeader';
import BackgroundDecor from '@/components/BackgroundDecor';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_WIDTH * 1.2;

// 1) Query đúng các field đang có trên User
const GET_CANDIDATES = gql`
  query GetCandidates {
    matchCandidates {
      id
      fullName
      dob
      avatar {
        url
      }
      address
    }
  }
`;

const SWIPE_USER = gql`
  mutation SwipeUser($targetId: Int!, $liked: Boolean!) {
    swipeUser(targetId: $targetId, liked: $liked) {
      isMatch
    }
  }
`;

export default function TeamMatchingScreen() {
  const { data, loading, refetch } = useQuery(GET_CANDIDATES);
  const [swipeUser] = useMutation(SWIPE_USER, {
    onCompleted: (res) => {
      if (res.swipeUser.isMatch) {
        Alert.alert("✨ It's a match!", 'Bạn và người này đã kết bạn rồi.');
      }
    },
    onError: console.error,
  });

  const cards = data?.matchCandidates ?? [];
  const swiperRef = useRef<Swiper<any>>(null);

  // overlay animation
  const dragX = useRef(new Animated.Value(0)).current;
  const heartOpacity = dragX.interpolate({
    inputRange: [0, 80, 150],
    outputRange: [0, 0.6, 0],
    extrapolate: 'clamp',
  });
  const nopeOpacity = dragX.interpolate({
    inputRange: [-150, -80, 0],
    outputRange: [0, 0.6, 0],
    extrapolate: 'clamp',
  });
  const heartScale = dragX.interpolate({
    inputRange: [0, 80],
    outputRange: [0.5, 1],
    extrapolate: 'clamp',
  });
  const nopeScale = dragX.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const handleSwiping = (x: number) => dragX.setValue(x);
  const handleSwiped = () =>
    Animated.timing(dragX, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

  const onSwipedLeft = async (i: number) => {
    const user = cards[i];
    await swipeUser({ variables: { targetId: user.id, liked: false } });
  };
  const onSwipedRight = async (i: number) => {
    const user = cards[i];
    await swipeUser({ variables: { targetId: user.id, liked: true } });
  };

  if (loading) return <Text style={styles.empty}>Loading...</Text>;
  if (cards.length === 0)
    return (
      <View style={styles.empty}>
        <Text>Hết bạn rồi! Quay lại lần tới nhé</Text>
        <Text onPress={() => refetch()} style={styles.reloadText}>
          Tải lại
        </Text>
      </View>
    );

  // helper: tính tuổi từ dob
  const calcAge = (dob?: string) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const renderCard = (card: any) => {
    const age = calcAge(card.dob);
    return (
      <View style={styles.card}>
        <Image source={{ uri: card.avatar?.url }} style={styles.avatar} />
        <View style={styles.infoPanel}>
          <View style={styles.infoHeader}>
            <Text style={styles.name}>{card.fullName || '—'}</Text>
            {age != null && <Text style={styles.ageText}>{age}t</Text>}
          </View>
          <View style={styles.infoLine}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{card.address || '—'}</Text>
          </View>
          {/* Không còn schedule */}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BackgroundDecor />

      <AppHeader title="Nguyễn Văn A" subtitle="Quận 9, TP. HCM" showSearch={false} />

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
    backgroundColor: '#E6F4EA',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadText: {
    marginTop: 8,
    color: '#5A983B',
    textDecorationLine: 'underline',
  },
  swiperWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  avatar: {
    width: '100%',
    height: '90%',
  },
  infoPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 84,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  ageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5A983B',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  overlayIcon: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.4,
    alignSelf: 'center',
    zIndex: 999,
    elevation: 999,
  },
});
