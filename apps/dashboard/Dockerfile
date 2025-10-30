# Base stage
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile
ENV PNPM_STORE_PATH=/pnpm-store
WORKDIR /app
EXPOSE 5174
CMD ["pnpm", "-C", "apps/dashboard", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/dashboard/node_modules ./apps/dashboard/node_modules
COPY apps/dashboard ./apps/dashboard
COPY packages ./packages
WORKDIR /app/apps/dashboard
RUN pnpm build

# Production stage (nginx)
FROM nginx:alpine AS production
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

