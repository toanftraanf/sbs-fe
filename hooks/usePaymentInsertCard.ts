import { useAuth } from "@/contexts/AuthContext";
import { Bank } from "@/services/bank";
import { createCard } from "@/services/card";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export default function usePaymentInsertCard() {
  const { user } = useAuth();
  const [form_data, set_form_data] = useState({
    cardholder_name: "",
    card_number: "",
    expiry: "",
    cvv: "",
    bank_name: "",
  });
  const [selected_bank, set_selected_bank] = useState<Bank | null>(null);
  const [save_card, set_save_card] = useState(true);
  const [errors, set_errors] = useState<Record<string, string>>({});
  const [loading, set_loading] = useState(false);

  const handle_input_change = (field: string, value: string) => {
    set_form_data((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) set_errors((prev) => ({ ...prev, [field]: "" }));
  };

  const handle_bank_selection = (bank: Bank) => {
    set_selected_bank(bank);
    set_form_data((prev) => ({ ...prev, bank_name: bank.name }));
    if (errors.bank_name) set_errors((prev) => ({ ...prev, bank_name: "" }));
  };

  const validate_form = () => {
    const new_errors: Record<string, string> = {};
    if (!form_data.cardholder_name.trim())
      new_errors.cardholder_name = "Tên chủ thẻ không được để trống";
    if (!form_data.card_number.replace(/\s/g, "").match(/^\d{16}$/))
      new_errors.card_number = "Số thẻ phải có 16 chữ số";
    if (!form_data.expiry.match(/^(0[1-9]|1[0-2])\/(\d{4})$/))
      new_errors.expiry = "Định dạng MM/YYYY";
    if (!form_data.cvv.match(/^\d{3,4}$/))
      new_errors.cvv = "CVV phải có 3-4 chữ số";
    if (!selected_bank)
      new_errors.bank_name = "Vui lòng chọn ngân hàng";
    if (!user)
      new_errors.general = "Vui lòng đăng nhập để thêm thẻ";
    set_errors(new_errors);
    return Object.keys(new_errors).length === 0;
  };

  const format_card_number = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const format_expiry = (text: string) => {
    // Auto-insert slash after MM
    let cleaned = text.replace(/[^\d]/g, "");
    if (cleaned.length > 2)
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 6);
    return cleaned.slice(0, 7);
  };

  const handle_submit = async () => {
    if (!validate_form()) return;
    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thêm thẻ");
      return;
    }
    
    set_loading(true);
    try {
      const last4 = form_data.card_number.replace(/\s/g, "").slice(-4);
      const newCard = await createCard({
        userId: parseInt(user.id),
        cardType: "VISA", // You can add a card type selector if needed
        bankName: selected_bank?.name || form_data.bank_name,
        last4,
        saveForNextPayment: save_card,
      });
      
      Alert.alert("Thành công", "Thẻ đã được lưu thành công!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to payment method screen
            router.push("payment/payment-method");
          },
        },
      ]);
    } catch (e) {
      console.error("Card creation error:", e);
      Alert.alert(
        "Lỗi",
        e instanceof Error ? e.message : "Không thể lưu thẻ. Vui lòng thử lại."
      );
    } finally {
      set_loading(false);
    }
  };

  return {
    form_data,
    selected_bank,
    save_card,
    errors,
    loading,
    handle_input_change,
    handle_bank_selection,
    handle_submit,
    set_save_card,
    format_card_number,
    format_expiry,
  };
} 