#!/bin/bash

# Database initialization script
# This script sets up the database with proper migrations

echo "🗄️  Initializing HireSmart AI Database..."

# Check if we're in Docker
if [ -f /.dockerenv ]; then
    echo "Running in Docker container..."
    cd /app
else
    echo "Running locally..."
    cd "$(dirname "$0")/.."
fi

# Run migrations
echo "📦 Running database migrations..."
alembic upgrade head

# Seed initial data (optional)
if [ "$1" = "--seed" ]; then
    echo "🌱 Seeding database with sample data..."
    python scripts/seed_data.py
else
    echo "💡 Tip: Run with --seed to add sample data: ./scripts/init_db.sh --seed"
fi

echo "✅ Database initialization complete!"

