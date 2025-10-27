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
COPY packages ./packages
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/*/dist ./packages/
WORKDIR /app/apps/api
CMD ["node", "dist/server.js"]
