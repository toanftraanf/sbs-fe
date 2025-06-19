import { gql, useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";
import { Alert } from "react-native";

export type Friend = {
  id: number;
  name: string;
  age: number;
  avatarUrl: string;
  location: string;
  schedule: string;
};

// ——— GraphQL documents ———
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      age
      avatarUrl
      location
      schedule
    }
  }
`;
const GET_MY_FRIENDS = gql`
  query MyFriends {
    myFriends {
      id
    }
  }
`;
const GET_INCOMING = gql`
  query IncomingFriendRequests {
    incomingFriendRequests {
      id
      requester {
        id
      }
    }
  }
`;
const SEND_REQUEST = gql`
  mutation SendFriendRequest($recipientId: Int!) {
    sendFriendRequest(input: { recipientId: $recipientId }) {
      id
    }
  }
`;
const RESPOND_REQUEST = gql`
  mutation RespondFriendRequest($requestId: Int!, $status: FriendRequestStatus!) {
    respondFriendRequest(requestId: $requestId, input: { status: $status }) {
      id
      status
    }
  }
`;

// ——— TypeScript interfaces for query results ———
interface GetUsersData {
  users: Friend[];
}
interface GetMyFriendsData {
  myFriends: { id: number }[];
}
interface GetIncomingData {
  incomingFriendRequests: {
    id: number;
    requester: { id: number };
  }[];
}

// ——— Hook: encapsulate all matching logic ———
export function useTeamMatching(currentUserId: number) {
  // 1) Fetch từ server, với generics để TS không dùng any
  const { data: allUsersData, loading: loadingUsers } = useQuery<GetUsersData>(GET_USERS);
  const { data: friendsData } = useQuery<GetMyFriendsData>(GET_MY_FRIENDS);
  const { data: incomingData, refetch: refetchIncoming } = useQuery<GetIncomingData>(GET_INCOMING);

  // 2) Mutations
  const [sendRequest] = useMutation(SEND_REQUEST, {
    onCompleted: () => {
      Alert.alert("Thành công", "Lời mời đã được gửi.");
      refetchIncoming();
    },
    onError: (e) => Alert.alert("Lỗi", e.message),
  });
  const [respondRequest] = useMutation(RESPOND_REQUEST, {
    onCompleted: () => {
      Alert.alert("Chúc mừng!", "Bạn vừa kết bạn thành công.");
      refetchIncoming();
    },
    onError: (e) => Alert.alert("Lỗi", e.message),
    refetchQueries: [{ query: GET_MY_FRIENDS }],
  });

  // 3) Tách ra id
  const users: Friend[] = allUsersData?.users || [];
  const friendIds: number[] = (friendsData?.myFriends || []).map((f) => f.id);
  const incomingReqs: { id: number; requesterId: number }[] =
    incomingData?.incomingFriendRequests.map((r) => ({
      id: r.id,
      requesterId: r.requester.id,
    })) || [];

  // 4) Danh sách cards (loại bỏ chính mình + bạn bè)
  const cards = users.filter(
    (u) => u.id !== currentUserId && !friendIds.includes(u.id)
  );

  // 5) Handler cho swipe right
  const handleSwipeRight = useCallback(
    (card: Friend) => {
      // nếu họ đã gửi invite cho mình → chấp nhận
      const incoming = incomingReqs.find((r) => r.requesterId === card.id);
      if (incoming) {
        return respondRequest({
          variables: { requestId: incoming.id, status: "ACCEPTED" },
        });
      }
      // ngược lại gửi invite
      return sendRequest({ variables: { recipientId: card.id } });
    },
    [incomingReqs, respondRequest, sendRequest]
  );

  return {
    loadingUsers,
    cards,
    handleSwipeRight,
  };
}
