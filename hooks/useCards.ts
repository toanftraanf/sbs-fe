import { useAuth } from "@/contexts/AuthContext";
import { Card, getUserSavedCard } from "@/services/card";
import { useEffect, useState } from "react";

export function useCards() {
  const { user } = useAuth();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCard = async () => {
    if (!user) {
      setCard(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getUserSavedCard(parseInt(user.id));
      setCard(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, [user?.id]);

  return { card, loading, error, refetch: fetchCard };
} 