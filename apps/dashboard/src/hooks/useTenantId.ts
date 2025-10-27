import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { api } from "../lib/api";

export function useTenantId() {
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-id", user?.primaryEmailAddress?.emailAddress],
    queryFn: async () => {
      if (!user) return null;

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        
        // The api.get returns response.data, so we need to type it correctly
        const result = await api.get<{ success: boolean; data: { tenantId: string | null } }>(
          `/api/v1/auth/tenant-id?email=${encodeURIComponent(email || "")}`
        );
        
        console.log("API result:", result);
        
        // api.get already extracts response.data from axios, so result IS the API response
        // result = { success: true, data: { tenantId: "..." } }
        return result?.data?.tenantId ?? null;
      } catch (error) {
        console.error("Failed to get tenant ID:", error);
        return null;
      }
    },
    enabled: !!user && !!user.primaryEmailAddress?.emailAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { tenantId: data ?? null, isLoading };
}

