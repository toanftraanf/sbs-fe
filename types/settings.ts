import { Ionicons } from "@expo/vector-icons";

export interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string | null;
  iconColor: string;
  isDestructive?: boolean;
}

// Owner menu items - Main features
export const OWNER_MAIN_ITEMS: MenuItem[] = [
  {
    id: "stadium-list",
    title: "Danh sách cụm sân",
    icon: "business-outline",
    route: "/stadium-list/stadium-list",
    iconColor: "#4CAF50",
  },
  {
    id: "staff-list",
    title: "Danh sách nhân viên",
    icon: "people-outline",
    route: null,
    iconColor: "#2196F3",
  },
  {
    id: "revenue-report",
    title: "Báo cáo doanh thu",
    icon: "bar-chart-outline",
    route: null,
    iconColor: "#9C27B0",
  },
];

// Owner menu items - App features
export const OWNER_APP_ITEMS: MenuItem[] = [
  {
    id: "share-app",
    title: "Chia sẻ ứng dụng",
    icon: "share-outline",
    route: null,
    iconColor: "#607D8B",
  },
  {
    id: "terms",
    title: "Điều khoản và điều kiện",
    icon: "document-text-outline",
    route: null,
    iconColor: "#795548",
  },
  {
    id: "about",
    title: "Về chúng tôi",
    icon: "information-circle-outline",
    route: null,
    iconColor: "#009688",
  },
  {
    id: "delete-account",
    title: "Xóa tài khoản",
    icon: "trash-outline",
    route: null,
    iconColor: "#F44336",
    isDestructive: true,
  },
  {
    id: "logout",
    title: "Đăng xuất",
    icon: "log-out-outline",
    route: null,
    iconColor: "#FF5722",
    isDestructive: true,
  },
];

// Customer menu items - Main features (Green section)
export const CUSTOMER_MAIN_ITEMS: MenuItem[] = [
  {
    id: "booking-history",
    title: "Lịch sử đặt sân của bạn",
    icon: "time",
    route: "/stadium-booking/booking-history",
    iconColor: "#5A983B",
  },
  {
    id: "event-history",
    title: "Lịch sử sự kiện của bạn",
    icon: "calendar",
    route: null,
    iconColor: "#5A983B",
  },
  {
    id: "promotions",
    title: "Ưu đãi cho bạn",
    icon: "gift",
    route: null,
    iconColor: "#5A983B",
  },
  {
    id: "account-management",
    title: "Tài khoản của bạn",
    icon: "shield-checkmark",
    route: null,
    iconColor: "#5A983B",
  },
];

// Customer menu items - App features (White section)
export const CUSTOMER_APP_ITEMS: MenuItem[] = [
  {
    id: "terms",
    title: "Điều khoản và điều kiện",
    icon: "document-text",
    route: null,
    iconColor: "#6B7280",
  },
  {
    id: "about",
    title: "Về chúng tôi",
    icon: "information-circle",
    route: null,
    iconColor: "#6B7280",
  },
  {
    id: "delete-account",
    title: "Xóa tài khoản",
    icon: "trash",
    route: null,
    iconColor: "#EF4444",
    isDestructive: true,
  },
  {
    id: "logout",
    title: "Đăng xuất",
    icon: "log-out",
    route: null,
    iconColor: "#EF4444",
    isDestructive: true,
  },
]; 