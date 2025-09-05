# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Install workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/api/package.json services/api/package.json
RUN pnpm -w install --frozen-lockfile

# Copy sources
COPY services/api/ services/api/

WORKDIR /app/services/api

# Build
RUN pnpm build

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/services/api/node_modules ./node_modules
COPY --from=base /app/services/api/dist ./dist
COPY --from=base /app/services/api/package.json ./package.json

EXPOSE 3001
CMD ["node", "dist/index.js"]


