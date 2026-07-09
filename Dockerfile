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

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy server with dependencies
COPY server ./server
RUN cd server && npm ci --omit=dev && mkdir -p data

# Copy built frontend
COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["node", "server/index.js"]
