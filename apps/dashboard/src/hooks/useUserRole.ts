import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { api } from "../lib/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface UserRoleData {
  role: "owner" | "manager" | null;
  assignedVenueIds: string[];
}

export function useUserRole() {
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["user-role", user?.primaryEmailAddress?.emailAddress],
    queryFn: async () => {
      if (!user) return null;

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        const result = await api.get<ApiResponse<UserRoleData>>(
          `/api/v1/auth/user-role?email=${encodeURIComponent(email || "")}`
        );
        
        return result.data;
      } catch (error) {
        console.error("Failed to get user role:", error);
        return null;
      }
    },
    enabled: !!user && !!user.primaryEmailAddress?.emailAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { 
    role: data?.role ?? null, 
    assignedVenueIds: data?.assignedVenueIds ?? [],
    isLoading 
  };
}

