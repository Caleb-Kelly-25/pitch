# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies temporarily
RUN apk add --no-cache --virtual .build-deps make g++ python3

COPY package*.json ./
RUN npm ci

# Remove build dependencies to keep image lean
RUN apk del .build-deps

COPY . .
RUN npm run build

# Prune dev dependencies
RUN npm prune --omit=dev

# Stage 2: runtime (unchanged)
FROM node:20-alpine AS runtime

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]