# ---------- BUILD STAGE ----------
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:20-slim AS production
WORKDIR /app

RUN apt-get update && \
    apt-get install -y bash netcat-openbsd openssl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4002
CMD ["sh", "-c", "sleep 15 && node dist/main.js"]