FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@8 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY packages/shared/types/package.json ./packages/shared/types/
COPY packages/shared/utils/package.json ./packages/shared/utils/
COPY packages/shared/config/package.json ./packages/shared/config/
COPY packages/core/hermes-core/package.json ./packages/core/hermes-core/
COPY packages/core/knowledge-hub/package.json ./packages/core/knowledge-hub/
COPY packages/core/voice-engine/package.json ./packages/core/voice-engine/
COPY packages/core/meeting-ai/package.json ./packages/core/meeting-ai/
COPY packages/core/whatsapp-ai/package.json ./packages/core/whatsapp-ai/
COPY packages/core/email-ai/package.json ./packages/core/email-ai/
COPY packages/core/vision-engine/package.json ./packages/core/vision-engine/
COPY packages/core/evolution-center/package.json ./packages/core/evolution-center/
COPY packages/business/business-suite/package.json ./packages/business/business-suite/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
