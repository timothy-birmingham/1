#!/bin/sh
set -e

npm install
npx prisma generate

if [ ! -f /app/data/dev.db ]; then
  echo "No existing database found -- applying migrations and seeding demo data..."
  npx prisma migrate deploy
  npm run db:seed
else
  echo "Existing database found -- applying any pending migrations..."
  npx prisma migrate deploy
fi

exec npm run dev -- --hostname 0.0.0.0
