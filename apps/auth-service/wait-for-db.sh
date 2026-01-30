#!/bin/bash
echo "Waiting for database connection..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is up! Syncing schema with db push..."
echo "Using DATABASE_URL=$DATABASE_URL"
npx prisma generate
npx prisma db push
echo "Schema synced. Starting NestJS..."
exec node dist/src/main.js
