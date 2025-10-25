import { z } from "zod";

// Health Check Response
export const HealthCheckResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// API Response Wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

