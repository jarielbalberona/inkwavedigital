# Base stage
FROM node:20-alpine AS base
# Install build dependencies for sharp
RUN apk add --no-cache python3 make g++ vips-dev
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Development stage
FROM base AS development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/utils/package.json ./packages/utils/package.json
# Install dependencies first (better caching)
RUN pnpm install --frozen-lockfile
# Copy source code after installation
COPY apps/api ./apps/api
COPY packages ./packages
WORKDIR /app/apps/api
CMD ["pnpm", "dev"]

# Build stage
FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/utils/package.json ./packages/utils/package.json
RUN pnpm install --frozen-lockfile
COPY apps/api ./apps/api
COPY packages ./packages
RUN pnpm -r build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/utils/package.json ./packages/utils/package.json
# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod
# Copy built files from build stage
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/types/dist ./packages/types/dist
COPY --from=build /app/packages/utils/dist ./packages/utils/dist
# Copy migrations for runtime
COPY --from=build /app/packages/db/migrations ./packages/db/migrations
COPY --from=build /app/packages/db/drizzle.config.ts ./packages/db/drizzle.config.ts
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/server.js"]
