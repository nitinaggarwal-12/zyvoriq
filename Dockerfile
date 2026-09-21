FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
ARG CACHEBUST=20260921_UI2
COPY . .
# Preview-safe: remove broken editor-only symlinks before Next.js scans the tree
RUN rm -f .cursorrules AGENTS.md
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache ffmpeg python3
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
RUN mkdir -p /app /app/scratch/yt /app/scratch/yt_logs /app/public/renders/yt /app/public/renders/edited && chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
RUN chown -R nextjs:nodejs /app/scratch /app/public/renders /app/scripts

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
