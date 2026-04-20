# OpenMart - Local Marketplace Platform

A hyperlocal B2B2C e-commerce platform serving pincode 442105 (Sindhi Railway area). Built with React, Node.js, PostgreSQL, and follows the architecture specified in the plan.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Shadcn + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT-based
- **Monorepo**: Turborepo

## Project Structure

```
openmart/
├── apps/
│   ├── web/          # React frontend (Vite)
│   └── api/          # Express backend
├── packages/
│   └── shared/       # Shared types and utilities
├── turbo.json        # Turborepo configuration
└── package.json      # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Update DATABASE_URL and JWT_SECRET

# Frontend
# Configure Vite as needed in apps/web/vite.config.ts
```

3. Setup database:
```bash
cd apps/api
npx prisma migrate dev
```

4. Start development servers:
```bash
# From root
npm run dev

# Or individually:
npm run dev:web    # Frontend on http://localhost:5173
npm run dev:api    # Backend on http://localhost:3001
```

### Build for Production

```bash
npm run build
```

## Features

### Customer Features
- Browse shops and products
- Add to cart and checkout
- Order tracking
- Address management
- Profile management

### Shop Owner Features
- Shop dashboard with analytics
- Product management (CRUD)
- Order management
- Delivery boy assignment
- Shop open/close toggle

### Delivery Boy Features
- View assigned deliveries
- Update delivery status
- OTP verification for delivery

### Admin Features
- Shop approval/rejection
- User management
- Order monitoring
- Platform analytics

## Design

The frontend uses a distinctive dark theme with:
- **Typography**: Outfit (sans) + Space Mono (mono)
- **Color**: Slate dark background with emerald green accents
- **Effects**: Gradient mesh backgrounds, glass morphism, noise textures
- **Animations**: Framer Motion for smooth transitions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Shops
- `GET /api/shops` - List shops
- `GET /api/shops/:id` - Get shop details
- `POST /api/shops` - Create shop
- `GET /api/shops/:id/products` - Get shop products
- `POST /api/shops/:id/products` - Add product

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/assign-delivery` - Assign delivery boy

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add item
- `PUT /api/cart/update` - Update quantity
- `DELETE /api/cart/remove` - Remove item

### Addresses
- `GET /api/addresses` - List addresses
- `POST /api/addresses` - Add address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Delivery
- `GET /api/delivery/assignments` - Get assigned deliveries
- `PUT /api/delivery/:id/update-status` - Update status
- `POST /api/delivery/:id/verify-otp` - Verify OTP

### Admin
- `GET /api/admin/shops` - List shops
- `PUT /api/admin/shops/:id/approve` - Approve shop
- `GET /api/admin/stats` - Get platform stats

## License

MIT# openmart
