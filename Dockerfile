# syntax=docker/dockerfile:1

# --- deps -----------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# --- builder ----------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma config validates DATABASE_URL is set even for `generate` (no DB connection made);
# the real value is supplied at container runtime via env_file.
ENV DATABASE_URL="file:./build-placeholder.db"
RUN npx prisma generate
RUN npm run build

# --- runner -----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY docker-entrypoint.prod.sh ./docker-entrypoint.prod.sh

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
USER nextjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["sh", "docker-entrypoint.prod.sh"]
