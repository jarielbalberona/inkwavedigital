import { z } from "zod";
// Health Check Response
export const HealthCheckResponseSchema = z.object({
    status: z.literal("ok"),
    timestamp: z.string(),
});
// API Response Wrapper
export const ApiResponseSchema = (dataSchema) => z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
});
