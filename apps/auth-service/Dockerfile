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

# ✔️ Копируем dist из auth-service
COPY --from=builder /app/dist ./dist

# ✔️ Prisma и скрипт тоже из auth-service
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/wait-for-db.sh ./wait-for-db.sh

RUN chmod +x ./wait-for-db.sh

EXPOSE 4001
CMD ["./wait-for-db.sh"]
