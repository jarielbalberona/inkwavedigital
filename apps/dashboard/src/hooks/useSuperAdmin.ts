import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { api } from "../lib/api";

export function useSuperAdmin() {
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-check", user?.primaryEmailAddress?.emailAddress],
    queryFn: async () => {
      if (!user) return false;

      try {
        const email = user.primaryEmailAddress?.emailAddress;

        // Check API to see if user is super admin
        const response = await api.get<{ success: boolean; data: { isSuperAdmin: boolean } }>(
          `/api/v1/auth/check-super-admin?email=${encodeURIComponent(email || "")}`
        );
        return response.data.isSuperAdmin;
      } catch (error) {
        console.error("Failed to check super admin status:", error);
        return false;
      }
    },
    enabled: !!user && !!user.primaryEmailAddress?.emailAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { isSuperAdmin: data ?? false, isLoading };
}

