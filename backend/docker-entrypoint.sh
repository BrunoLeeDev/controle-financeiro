#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Running seed..."
npx prisma db seed 2>/dev/null || echo "Seed skipped"

exec "$@"
