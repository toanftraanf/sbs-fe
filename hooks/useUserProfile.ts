import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/auth';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  fullName?: string;
  email?: string;
  phoneNumber: string;
  dob?: string;
  sex?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  latitude?: number;
  longitude?: number;
  userType?: "PLAYER" | "COACH";
  level?: string;
  role: "OWNER" | "CUSTOMER";
  status?: string;
  isVerified?: boolean;
  avatarUrl?: string;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userProfile = await authService.getUserProfile(parseInt(user.id));
      setProfile(userProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      // Fallback to basic user data from context
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const refetch = async () => { 
    await fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    refetch,
  };
} 