# Base stage
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/customer/package.json ./apps/customer/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/customer/package.json ./apps/customer/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile
ENV PNPM_STORE_PATH=/pnpm-store
WORKDIR /app
EXPOSE 5173
CMD ["pnpm", "-C", "apps/customer", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/customer/package.json ./apps/customer/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/customer/node_modules ./apps/customer/node_modules
COPY apps/customer ./apps/customer
COPY packages ./packages
WORKDIR /app/apps/customer
RUN pnpm build

# Production stage (nginx)
FROM nginx:alpine AS production
COPY --from=build /app/apps/customer/dist /usr/share/nginx/html
COPY apps/customer/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

