import bankService, { Bank } from "@/services/bank";
import { useEffect, useState } from "react";

export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await bankService.getPopularBanks();
      setBanks(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  return { banks, loading, error, refetch: fetchBanks };
} 