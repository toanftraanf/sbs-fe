import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import AppButton from "./AppButton";

interface LogoutButtonProps {
  title?: string;
  filled?: boolean;
}

export default function LogoutButton({
  title = "Đăng xuất",
  filled = false,
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Xác nhận đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/onboarding");
          } catch (error) {
            console.error("Logout failed:", error);
          }
        },
      },
    ]);
  };

  return <AppButton title={title} filled={filled} onPress={handleLogout} />;
}
