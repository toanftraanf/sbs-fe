import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

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
  const updateContact = (index: number, text: string) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = text;
    onContactsChange(updatedContacts);
  };

  const addContact = () => {
    onContactsChange([...contacts, ""]);
  };

  const removeContact = (index: number) => {
    const updatedContacts = contacts.filter((_, idx) => idx !== index);
    onContactsChange(updatedContacts);
  };

  return (
    <>
      {contacts.map((contact, idx) => (
        <View key={idx} className="flex-row items-center mb-3">
          <TextInput
            placeholder={placeholder}
            value={contact}
            onChangeText={(text) => updateContact(idx, text)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
            keyboardType="phone-pad"
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => {
              if (idx === contacts.length - 1) {
                addContact();
              } else {
                removeContact(idx);
              }
            }}
            className="ml-2"
          >
            <Ionicons
              name={
                idx === contacts.length - 1
                  ? "add-circle-outline"
                  : "remove-circle-outline"
              }
              size={28}
              color={idx === contacts.length - 1 ? "#4CAF50" : "#FF5252"}
            />
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}
