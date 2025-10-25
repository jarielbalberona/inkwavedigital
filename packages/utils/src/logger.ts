import { pino } from "pino";

export const createLogger = (name: string) => {
  return (pino as any)({
    name,
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  });
};

export type Logger = ReturnType<typeof createLogger>;

