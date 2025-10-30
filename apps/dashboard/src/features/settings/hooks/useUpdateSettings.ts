import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settingsApi";
import type { UpdateSettingsInput } from "../types/settings.types";

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => settingsApi.updateSettings(input),
    onSuccess: (_, variables) => {
      // Invalidate tenant info query to refresh settings
      queryClient.invalidateQueries({ queryKey: ["tenantInfo", variables.tenantId] });
    },
  });
};

