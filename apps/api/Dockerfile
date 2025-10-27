# Base stage
FROM node:20-alpine AS base
# Install build dependencies for sharp
RUN apk add --no-cache python3 make g++ vips-dev
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Development stage
FROM base AS development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages ./packages
# Install dependencies and rebuild sharp
RUN pnpm install --frozen-lockfile
RUN pnpm rebuild sharp
WORKDIR /app/apps/api
CMD ["pnpm", "dev"]

# Build stage
FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm -r build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/utils/package.json ./packages/utils/package.json
# Install all dependencies including workspace packages
RUN pnpm install --frozen-lockfile --prod
# Rebuild sharp for production
RUN pnpm rebuild sharp
# Copy built files
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/types/dist ./packages/types/dist
COPY --from=build /app/packages/utils/dist ./packages/utils/dist
# Copy migrations for runtime
COPY packages/db/migrations ./packages/db/migrations
COPY packages/db/drizzle.config.ts ./packages/db/drizzle.config.ts
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/server.js"]
