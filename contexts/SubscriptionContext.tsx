import { Subscription } from "@/services/subscription";
import React, { createContext, useContext, useState } from "react";

interface SubscriptionContextType {
  selectedSubscription: Subscription | null;
  setSelectedSubscription: (subscription: Subscription | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  return (
    <SubscriptionContext.Provider
      value={{ selectedSubscription, setSelectedSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
