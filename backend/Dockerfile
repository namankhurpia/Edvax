FROM node:22-alpine

WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

# Migrations run on boot (additive, non-destructive). Then start the API.
CMD ["node", "src/server.js"]
