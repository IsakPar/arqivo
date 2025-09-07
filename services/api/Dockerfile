# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Monorepo manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/ packages/
COPY services/api/package.json services/api/package.json

# Install only API workspace deps (dev deps included for build)
RUN pnpm --filter @arqivo/api... install --frozen-lockfile

# Copy sources
COPY services/api/ services/api/

WORKDIR /app/services/api

# Build
RUN pnpm build

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app/services/api
ENV NODE_ENV=production
# copy both root and api node_modules to preserve pnpm symlink layout
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/services/api/node_modules ./node_modules
# copy built app
COPY --from=base /app/services/api/dist ./dist
COPY --from=base /app/services/api/package.json ./package.json
EXPOSE 3001
CMD ["node", "dist/index.js"]


