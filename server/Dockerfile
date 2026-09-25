FROM node:22-bookworm-slim AS base

WORKDIR /app

COPY package.json package-lock.json ./

FROM base AS development

ENV NODE_ENV=development
ENV PORT=8080

RUN npm ci && npm cache clean --force

COPY --chown=node:node . .

RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/ready',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]

FROM base AS production

ENV NODE_ENV=production
ENV PORT=8080

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/ready',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
