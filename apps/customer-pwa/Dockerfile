# Base stage
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/customer-pwa/package.json ./apps/customer-pwa/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/customer-pwa/node_modules ./apps/customer-pwa/node_modules
COPY --from=dependencies /app/packages ./packages
COPY . .
WORKDIR /app/apps/customer-pwa
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/customer-pwa/node_modules ./apps/customer-pwa/node_modules
COPY . .
WORKDIR /app/apps/customer-pwa
RUN pnpm build

# Production stage (nginx)
FROM nginx:alpine AS production
COPY --from=build /app/apps/customer-pwa/dist /usr/share/nginx/html
COPY apps/customer-pwa/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

