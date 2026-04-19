# --- Stage 1: build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (cache dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# --- Stage 2: runtime ---
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only the built JS + dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY .env ./

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.js"]
