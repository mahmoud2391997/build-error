# Zenith Full-Stack Next.js Application

Multi-tenant management system built with Next.js 14 App Router and integrated API routes.

## Features

- 🏢 Multi-tenant architecture
- 📊 Modern dashboard with 2x2 grid layout
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Responsive design
- 🔄 Real-time updates
- 🗂️ Full-stack architecture (Frontend + API)
- 🚀 Server-side rendering
- 🔌 Integrated API routes

## Architecture

This is a **full-stack** Next.js application with:
- **Frontend**: React components with App Router
- **Backend**: API routes in `/app/api/` directory
- **Database**: Prisma with PostgreSQL
- **Deployment**: Single deployment for both frontend and backend

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the `next-app` directory:
```bash
# .env.local
# JWT Secret for authentication tokens
# Generate a secure random string using: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database URL
DATABASE_URL="postgresql://user:password@localhost:5432/zenith_db?schema=public"

# Direct URL for migrations (optional, same as DATABASE_URL if not using connection pooling)
DIRECT_URL="postgresql://user:password@localhost:5432/zenith_db?schema=public"

# Node Environment
NODE_ENV="development"

# Next.js Public API URL (leave empty for same-origin requests)
NEXT_PUBLIC_API_URL=""
```

**Important**: 
- Generate a secure JWT_SECRET for production: `openssl rand -base64 32`
- Update DATABASE_URL with your actual PostgreSQL connection string
- The `.env.local` file is gitignored and should not be committed

3. Run database migrations:
```bash
npx prisma generate
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Project Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page (redirects to dashboard)
├── dashboard/
│   └── page.tsx           # Dashboard page
├── api/                   # Backend API routes
│   ├── users/
│   │   └── route.ts       # User endpoints
│   ├── companies/
│   │   └── route.ts       # Company endpoints
│   ├── products/
│   │   └── route.ts       # Product endpoints
│   ├── payroll-records/
│   │   └── route.ts       # Payroll endpoints
│   └── health/
│       └── route.ts       # Health check
└── globals.css             # Global styles

components/                    # Reusable components
├── Sidebar.tsx
├── Header.tsx
└── ...

lib/                          # Utilities
├── api.ts                  # API client (uses internal routes)
└── ...

modules/                       # Feature modules
├── core/
│   └── Dashboard.tsx
├── accounting/
├── inventory/
└── hr/

types.ts                       # TypeScript types
prisma/                       # Database schema
```

## API Endpoints

All API endpoints are available at `/api/`:

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Register new user

### Companies
- `GET /api/companies` - Get all companies

### Products
- `GET /api/products?companyId=X` - Get products for company
- `POST /api/products` - Create new product

### Payroll
- `GET /api/payroll-records?companyId=X` - Get payroll records
- `POST /api/payroll-records` - Create payroll record

### Health
- `GET /api/health` - Health check

## API Integration

The app uses **internal API routes**:
- Base URL: `/api/` (no external server needed)
- API client: `lib/api.ts`
- Direct function calls to internal routes
- No external API dependencies

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t zenith-fullstack .
docker run -p 3000:3000 zenith-fullstack
```

### Traditional Hosting
```bash
./deploy.sh
# or manually:
npm run build
npm start
```

## Environment Variables

Required environment variables (create `.env.local` file):

- `JWT_SECRET` - Secret key for JWT token signing (required for authentication)
  - Generate with: `openssl rand -base64 32`
  - **Critical**: Use a strong, random secret in production
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database URL for migrations (optional, same as DATABASE_URL if not using pooling)
- `NEXT_PUBLIC_API_URL` - API base URL (leave empty for internal routes)
- `NODE_ENV` - Environment (development/production)

## Benefits of Full-Stack Architecture

### 🚀 Performance
- Server-side rendering (SSR)
- API routes in same application
- No network latency between frontend/backend
- Optimized bundle sizes

### 🔧 Development
- Single codebase for frontend and backend
- Shared types and utilities
- Hot reload for both frontend and API
- Simplified deployment

### 📦 Deployment
- Single deployment process
- No separate server management
- Vercel-ready with zero config
- Environment variable management

## Features

### Dashboard
- 📊 2x2 grid layout for stats
- 🎯 Module management
- 👤 User profile section
- 📱 Responsive design

### Modules
- 📈 Accounting (Chart of Accounts, Journal Entries)
- 📦 Inventory (Products, Warehouses)
- 👥 HR (Employees, Payroll)
- 🎯 Sales (Leads, Invoices)

### UI/UX
- 🎨 Modern design with gradients
- ✨ Smooth animations
- 📱 Mobile responsive
- 🌙 RTL support for Arabic
- 🎯 Interactive elements

## Development

- **Framework**: Next.js 14 with App Router
- **API**: Integrated API routes
- **Styling**: Tailwind CSS
- **Database**: Prisma with PostgreSQL
- **Language**: TypeScript
- **Deployment**: Full-stack ready
