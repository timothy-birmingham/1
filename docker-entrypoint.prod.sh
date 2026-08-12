#!/bin/sh
set -e

DB_FILE="${DATABASE_URL#file:}"

if [ ! -f "$DB_FILE" ]; then
  echo "No existing database found -- applying migrations and seeding demo data..."
  npx prisma migrate deploy
  npm run db:seed
else
  echo "Existing database found -- applying any pending migrations..."
  npx prisma migrate deploy
fi

exec npm run start -- -H 0.0.0.0
