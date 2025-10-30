import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { api } from "../lib/api";
import { applyTenantTheme } from "../lib/themeLoader";
import type { TenantSettings } from "@inkwave/types";
import { useEffect } from "react";

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  settings?: TenantSettings | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: TenantInfo | null;
}

export function useTenantInfo() {
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-info", user?.primaryEmailAddress?.emailAddress],
    queryFn: async () => {
      if (!user) return null;

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        const result = await api.get<ApiResponse>(
          `/api/v1/auth/tenant-info?email=${encodeURIComponent(email || "")}`
        );
        return result.data;
      } catch (error) {
        console.error("Failed to get tenant info:", error);
        return null;
      }
    },
    enabled: !!user && !!user.primaryEmailAddress?.emailAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Apply tenant theme when tenant info is loaded
  useEffect(() => {
    if (data?.settings) {
      applyTenantTheme(data.settings);
    }
  }, [data]);

  return { 
    tenantInfo: data ?? null, 
    isLoading 
  };
}

