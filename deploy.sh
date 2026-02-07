#!/bin/bash

echo "🚀 Deploying Zenith Full-Stack Next.js Application..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "📝 Creating .env.local from template..."
    cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://your-database-url"

# API Configuration
NEXT_PUBLIC_API_URL=""

# Environment
NODE_ENV="production"
EOF
    echo "✅ Created .env.local - Please update with your values"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️  Building Next.js application..."
npm run build

# Start the production server
echo "🎯 Starting production server..."
npm start

echo "✅ Deployment complete!"
echo "🌐 Application running at: http://localhost:3000"
echo "📊 Health check: http://localhost:3000/api/health"
