import React from "react";
import DynamicInputList from "./DynamicInputList";

interface ContactInputListProps {
  contacts: string[];
  onContactsChange: (contacts: string[]) => void;
  placeholder?: string;
}

export default function ContactInputList({
  contacts,
  onContactsChange,
  placeholder = "Điện thoại khác",
}: ContactInputListProps) {
  return (
    <DynamicInputList
      items={contacts}
      onItemsChange={onContactsChange}
      placeholder={placeholder}
      keyboardType="phone-pad"
    />
  );
}
