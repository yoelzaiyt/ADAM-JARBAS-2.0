FROM node:20-slim AS base
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/types/package.json ./packages/shared/types/
COPY packages/shared/config/package.json ./packages/shared/config/
COPY packages/shared/utils/package.json ./packages/shared/utils/
COPY packages/core/ai-registry/package.json ./packages/core/ai-registry/
COPY packages/core/hermes-router/package.json ./packages/core/hermes-router/
COPY packages/core/memory-manager/package.json ./packages/core/memory-manager/
COPY packages/services/auth-service/package.json ./packages/services/auth-service/
COPY packages/services/api-gateway/package.json ./packages/services/api-gateway/
RUN pnpm install --frozen-lockfile
COPY packages/ ./packages/
RUN pnpm run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/packages/shared/types/dist ./packages/shared/types/dist
COPY --from=builder /app/packages/shared/config/dist ./packages/shared/config/dist
COPY --from=builder /app/packages/shared/utils/dist ./packages/shared/utils/dist
COPY --from=builder /app/packages/core/ai-registry/dist ./packages/core/ai-registry/dist
COPY --from=builder /app/packages/core/hermes-router/dist ./packages/core/hermes-router/dist
COPY --from=builder /app/packages/core/memory-manager/dist ./packages/core/memory-manager/dist
COPY --from=builder /app/packages/services/auth-service/dist ./packages/services/auth-service/dist
COPY --from=builder /app/packages/services/api-gateway/dist ./packages/services/api-gateway/dist
COPY --from=builder /app/node_modules ./node_modules
COPY packages/shared/types/package.json ./packages/shared/types/
COPY packages/shared/config/package.json ./packages/shared/config/
COPY packages/shared/utils/package.json ./packages/shared/utils/
COPY packages/core/ai-registry/package.json ./packages/core/ai-registry/
COPY packages/core/hermes-router/package.json ./packages/core/hermes-router/
COPY packages/core/memory-manager/package.json ./packages/core/memory-manager/
COPY packages/services/auth-service/package.json ./packages/services/auth-service/
COPY packages/services/api-gateway/package.json ./packages/services/api-gateway/

EXPOSE 3000
CMD ["node", "packages/services/api-gateway/dist/index.js"]
