FROM node:20-alpine AS base
WORKDIR /app

# Server
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Client build
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# Production server
COPY server/ ./server/
RUN cd server && npm ci --production

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server/src/index.js"]
