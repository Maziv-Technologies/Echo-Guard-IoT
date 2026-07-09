# Frontend build stage
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN npm run build

# Build server stage (compile native modules)
FROM node:20-alpine AS server-build
WORKDIR /app/server
RUN apk add --no-cache python3 make g++
COPY server/package*.json ./
RUN npm ci

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install only runtime dependencies (no build tools needed)
RUN apk add --no-cache dumb-init

# Copy server
COPY server ./server

# Copy pre-built server dependencies from build stage
COPY --from=server-build /app/server/node_modules ./server/node_modules

# Create data directory
RUN mkdir -p /app/server/data

# Copy built frontend
COPY --from=build /app/dist ./dist

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]
