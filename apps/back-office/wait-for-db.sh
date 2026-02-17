#!/bin/bash
echo "Waiting for database connection..."
while ! nc -z coworking-db 5432; do
  sleep 1
done
echo "Coworking-Database is up! Syncing schema with db push..."
env | grep DATABASE_URL
echo "Using DATABASE_URL=$DATABASE_URL"
export DATABASE_URL="$DATABASE_URL"
npx prisma db push
npx prisma studio --port 51213 --browser none &
echo "Schema synced. Starting NestJS..."
exec node dist/src/main.js
