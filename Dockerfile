# ===============================================================
# Origintra Exim - Multi-Stage Production Dockerfile
# Compatible with standard glibc & native binaries (sharp, etc.)
# ===============================================================

# Stage 1: Build the Vite & React Frontend
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build frontend and prerender static assets
RUN npm run build

# Stage 2: Production Runner
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies (includes sharp)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built distribution, server files, and public assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json

# Expose production port
EXPOSE 5000

# Start Express.js production server
CMD ["node", "server/index.js"]
