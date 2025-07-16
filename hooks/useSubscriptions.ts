import { getAllSubscriptions, Subscription } from "@/services/subscription";
import { useEffect, useState } from "react";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const subs = await getAllSubscriptions();
        setSubscriptions(subs);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { subscriptions, loading, error };
} 