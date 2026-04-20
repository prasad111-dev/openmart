# OpenMart MVP Implementation Plan

## 1. Project Overview
OpenMart is a hyperlocal B2B2C e-commerce platform serving pincode 442105 (Sindhi Railway area). It connects local shops (grocery, fruit, dairy, general stores) with customers through a marketplace model where each shop manages its own inventory and delivery using their own delivery personnel. The platform acts solely as a connector without providing delivery logistics.

**Core Objectives:**
- Enable local shops to establish online presence without technical overhead
- Provide customers convenient access to multiple local vendors through single platform
- Facilitate order placement, tracking, and communication via WhatsApp notifications
- Maintain shop autonomy over inventory, pricing, and delivery operations
- Ensure secure role-based access control for all stakeholders

## 2. Product Categories
- Grocery & Staples
- Fresh Fruits & Vegetables
- Dairy & Eggs
- Beverages & Snacks
- Personal Care
- Household Essentials
- Bakery & Confectionery
- General Store Items

## 3. Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind CSS + Shadcn + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Authentication | JWT-based |
| File Storage | Local (MVP) |
| Monorepo | Turborepo + Bun |
| Notifications | WhatsApp Business API |
| DevOps | Docker + Docker Compose |

## 4. System Design Architecture

### High-Level Architecture
OpenMart follows a monorepo-based microservice-inspired architecture with clear separation of concerns:
- **Client Layer**: React SPA served via Vite dev server (production: static build)
- **API Layer**: Node.js/Express server handling business logic and data persistence
- **Data Layer**: PostgreSQL managed via Prisma ORM with connection pooling
- **Integration Layer**: WhatsApp Business API for notifications
- **Deployment Layer**: Docker containers orchestrated via Docker Compose

### Component Breakdown
- **Frontend**: 
  - React components with TypeScript
  - Tailwind CSS for styling with Shadcn/ui primitives
  - Framer Motion for micro-interactions
  - State management via React Context/Zustand (MVP)
  - API communication via Axios/react-query
- **Backend**:
  - Express.js REST API controllers
  - Prisma service layer for database operations
  - JWT authentication middleware
  - WhatsApp notification service
  - Input validation via Joi/Zod
  - Centralized error handling middleware
- **Database**:
  - PostgreSQL schema with proper indexing
  - Prisma migrations for version control
  - Connection pooling configuration
- **Infrastructure**:
  - Docker containers for frontend, backend, and database
  - Nginx reverse proxy (production)
  - Environment-specific configuration
- **Integrations**:
  - WhatsApp Business API (official)
  - Local file storage (uploads/profile images)

### Data Flow

#### User Flow
1. Customer visits landing page → views featured shops
2. Authentication via email/phone + OTP (JWT issued)
3. Browses shops → selects products → adds to cart (shop-specific)
4. Selects delivery address during checkout
5. Places order → receives WhatsApp confirmation
6. Tracks order status → receives delivery updates via WhatsApp

#### Order Flow
1. Customer submits order → backend validates cart/inventory and stock availability
2. Order created with `PENDING` status and `PENDING` payment → notification to shop owner
3. Shop owner accepts/rejects order → updates order status
4. If accepted: shop assigns delivery boy from their team → status changes to `ASSIGNED`
5. Delivery boy updates status: `OUT_FOR_DELIVERY` → `DELIVERED` upon successful handover
6. Customer receives final WhatsApp notification with completion status
7. Payment status updated to `COMPLETED` upon delivery confirmation (COD)

#### Delivery Flow
1. Delivery boy logs in → views assigned deliveries from their shop only
2. Selects delivery → confirms pickup from shop
3. Updates status to `OUT_FOR_DELIVERY` upon leaving shop
4. Requires OTP verification from customer upon delivery attempt
5. Marks `DELIVERED` upon successful customer handover with OTP verification
6. Platform records completion timestamp and updates payment status
7. Failed delivery attempts can be rescheduled or marked as failed

#### Admin Flow
1. Admin logs in → dashboard shows platform metrics
2. Reviews pending shop approvals → approves/rejects based on documents
3. Monitors all orders in real-time → intervenes in disputes, can force cancel orders
4. Manages user roles/permissions → blocks abusive actors
5. Reviews system logs → configures platform settings
6. Views analytics and reports for business insights

### Key Architectural Decisions
- **Shop-Isolated Carts**: MVP implements shop-specific carts (one cart per shop) to simplify inventory management and avoid cross-shop coordination complexity
- **Local File Storage**: MVP uses local storage to avoid cloud costs; production will migrate to S3-compatible storage
- **JWT Stateless Auth**: Chosen for simplicity and horizontal scalability; refresh token rotation implemented
- **Monorepo with Turborepo**: Enables shared types/components between frontend/backend while maintaining independent deployments
- **WhatsApp Over SMS**: Higher delivery rates in India, rich media support, and lower cost for OTP/notifications
- **Inventory Validation**: Real-time stock validation during cart operations and order creation to prevent overselling
- **Address Management**: Separate addresses table allowing users to save multiple addresses and select during checkout

### Scalability Considerations
- **Horizontal Scaling**: Stateless backend services allow adding instances behind load balancer
- **Database Read Replicas**: Planned for order/query heavy operations
- **Caching Layer**: Redis integration planned for phase 2 (session/cache, product catalog)
- **CDN**: Static assets served via CDN in production
- **Database Indexing**: Strategic indexes on frequently queried fields (shop_id, status, timestamps, user_id)
- **Message Queue**: Future integration for notification bursts and order processing (RabbitMQ/AWS SQS)
- **Inventory Locking**: Basic inventory locking mechanism during order processing to prevent race conditions

### Security Aspects
- **Authentication**: JWT with role in payload, HTTP-only cookies, refresh token rotation, brute force protection
- **Authorization**: Role-based middleware protecting all API endpoints
- **JWT Token Structure**:
  ```json
  {
    "userId": "uuid",
    "email": "user@email.com",
    "role": "CUSTOMER | SHOP_OWNER | DELIVERY_BOY | ADMIN",
    "exp": "timestamp",
    "iat": "timestamp"
  }
  ```
- **Token Expiry**: Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- **Data Protection**: 
  - Passwords hashed with bcrypt
  - Sensitive data encrypted at rest (PII)
  - SQL injection prevented via Prisma ORM
- **Input Validation**: Strict schema validation on all endpoints
- **API Security**: Rate limiting, CORS policies, helmet.js headers
- **Secrets Management**: Environment variables via .env (vault in production)
- **Audit Logging**: Critical actions logged for compliance
- **Secure Headers**: Implementation of security best practices via helmet.js

## 5.1. Role-Based Access Control (RBAC)

### Overview
OpenMart implements a unified authentication system where users have a single identity with one of four roles. The role is determined at registration and cannot be changed without admin intervention. This design mirrors successful marketplace platforms like Zomato, Swiggy, and Uber Eats.

### User Roles
| Role | Description | Access Level |
|------|-------------|--------------|
| CUSTOMER | End consumers who browse shops, place orders, and track deliveries | Customer-only APIs |
| SHOP_OWNER | Local vendors managing their inventory and orders | Shop management APIs |
| DELIVERY_BOY | Delivery personnel assigned to specific shops | Delivery-only APIs |
| ADMIN | Platform administrators with full system control | Admin-only APIs |

### Authentication Flow
1. **Registration**: User registers with role selection (CUSTOMER, SHOP_OWNER, or DELIVERY_BOY)
2. **Login**: Single unified login endpoint accepts phone/email + password or OTP
3. **Verification**: Backend validates credentials and determines user role from Users table
4. **Token Generation**: JWT issued with role included in payload
5. **Response**: 
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "uuid",
       "name": "John Doe",
       "email": "john@example.com",
       "phone": "+91xxxxxxxxxx",
       "role": "CUSTOMER"
     }
   }
   ```

### RBAC Middleware Implementation
- **authMiddleware**: Verifies JWT token validity and extracts user context
- **rbacMiddleware**: Validates user role against allowed roles for the endpoint

### API Protection Strategy
| Endpoint Category | Required Role | Examples |
|------------------|--------------|----------|
| Public APIs | None | `/api/shops`, `/api/products`, `/api/auth/login`, `/api/auth/register` |
| Customer APIs | CUSTOMER | `/api/cart/*`, `/api/orders/*`, `/api/addresses/*` |
| Shop APIs | SHOP_OWNER | `/api/shops/:id/products/*`, `/api/shops/:id/orders/*` |
| Delivery APIs | DELIVERY_BOY | `/api/delivery/assignments/*` |
| Admin APIs | ADMIN | `/api/admin/*` |

### Route Structure (Frontend)

#### Public Routes
- `/` - Landing page
- `/login` - Unified login page
- `/register` - Registration page with role selection
- `/shops` - Shop listing
- `/shops/:id` - Shop details
- `/products/:id` - Product details

#### Customer Routes (CUSTOMER role)
- `/home` - Home page with shops and categories
- `/cart` - Shopping cart (shop-specific)
- `/checkout` - Order checkout
- `/orders` - Order history
- `/orders/:id` - Order tracking
- `/profile` - Profile and address management

#### Shop Dashboard Routes (SHOP_OWNER role)
- `/shop/dashboard` - Overview and metrics
- `/shop/products` - Product management
- `/shop/products/add` - Add new product
- `/shop/products/:id/edit` - Edit product
- `/shop/orders` - Order management
- `/shop/delivery-boys` - Delivery team management
- `/shop/settings` - Shop settings and profile

#### Delivery Dashboard Routes (DELIVERY_BOY role)
- `/delivery/dashboard` - Assigned deliveries
- `/delivery/assignments` - Active deliveries
- `/delivery/profile` - Profile settings

#### Admin Panel Routes (ADMIN role)
- `/admin` - Admin dashboard
- `/admin/shops` - Shop approval management
- `/admin/users` - User management
- `/admin/orders` - All orders monitoring
- `/admin/analytics` - Platform analytics
- `/admin/settings` - System settings

## 5. Database Schema

### Users
```sql
id: UUID (PK)
email: String (unique)
phone: String (unique)
password: String (hashed)
role: ENUM(CUSTOMER, SHOP_OWNER, DELIVERY_BOY, ADMIN)
name: String
isVerified: Boolean
createdAt: DateTime
updatedAt: DateTime
```

### Addresses
```sql
id: UUID (PK)
userId: UUID (FK → Users.id)
label: String (e.g., "Home", "Office")
street: String
city: String
state: String
pincode: String
isDefault: Boolean
createdAt: DateTime
updatedAt: DateTime
```

### Shops
```sql
id: UUID (PK)
ownerId: UUID (FK → Users.id)
name: String
description: Text
address: String
pincode: String
phone: String
email: String
isApproved: Boolean (default false)
isOpen: Boolean (default true)  // Shop open/close status
deliveryRadius: Integer  // in kilometers
createdAt: DateTime
updatedAt: DateTime
```

### Products
```sql
id: UUID (PK)
shopId: UUID (FK → Shops.id)
name: String
description: Text
price: Decimal
category: String
stock: Integer
imageUrl: String
isActive: Boolean
createdAt: DateTime
updatedAt: DateTime
```

### Orders
```sql
id: UUID (PK)
customerId: UUID (FK → Users.id)
shopId: UUID (FK → Shops.id)
deliveryBoyId: UUID (FK → Users.id, nullable)
deliveryAddressId: UUID (FK → Addresses.id)
status: ENUM(PENDING, ACCEPTED, REJECTED, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
paymentMethod: ENUM(COD)  // MVP only
paymentStatus: ENUM(PENDING, COMPLETED, FAILED)  // For future online payment integration
totalAmount: Decimal
specialInstructions: Text
createdAt: DateTime
updatedAt: DateTime
```

### OrderItems
```sql
id: UUID (PK)
orderId: UUID (FK → Orders.id)
productId: UUID (FK → Products.id)
quantity: Integer
price: Decimal  // snapshot at order time
createdAt: DateTime
```

### Delivery
```sql
id: UUID (PK)
orderId: UUID (FK → Orders.id)
deliveryBoyId: UUID (FK → Users.id)
shopId: UUID (FK → Shops.id)  // Explicitly links delivery boy to shop
status: ENUM(ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, FAILED)
pickupTime: DateTime
deliveredTime: DateTime
otpVerified: Boolean
createdAt: DateTime
updatedAt: DateTime
```

### Notifications
```sql
id: UUID (PK)
userId: UUID (FK → Users.id)
type: ENUM(ORDER_CONFIRMATION, ORDER_STATUS_UPDATE, DELIVERY_UPDATE, PROMOTIONAL)
channel: ENUM(WHATSAPP, SMS, EMAIL)  // MVP: WHATSAPP only
content: Text
status: ENUM(SENT, FAILED, PENDING)
providerResponse: JSON  // Store response from WhatsApp API
attempts: Integer  // For retry mechanism
createdAt: DateTime
updatedAt: DateTime
```

### Cart (Session-based in MVP, but conceptually)
*Note: In MVP, cart is managed client-side with shopId association*
- shopId: UUID (FK → Shops.id)  // Enforces one cart per shop
- items: Array of {productId, quantity, price}
- updatedAt: DateTime

## 6. API Endpoints

### Auth APIs (Unified System)
- POST `/api/auth/register` - User registration (role determined by user type selection)
- POST `/api/auth/login` - **Single unified login** (phone/email + OTP or password)
- POST `/api/auth/otp/send` - Send OTP for login/verification
- POST `/api/auth/verify-otp` - Verify OTP and issue tokens
- POST `/api/auth/refresh` - Refresh access token
- POST `/api/auth/logout` - Invalidate session

### Address APIs
- GET `/api/addresses` - Get user's addresses
- POST `/api/addresses` - Add new address
- PUT `/api/addresses/:id` - Update address
- DELETE `/api/addresses/:id` - Delete address
- PUT `/api/addresses/:id/set-default` - Set default address

### Shop APIs
- GET `/api/shops` - List shops (with filters)
- GET `/api/shops/:id` - Get shop details
- POST `/api/shops` - Create shop (owner)
- PUT `/api/shops/:id` - Update shop
- GET `/api/shops/:id/products` - Get shop products
- POST `/api/shops/:id/products` - Add product
- PUT `/api/shops/:id/products/:productId` - Update product
- DELETE `/api/shops/:id/products/:productId` - Delete product
- GET `/api/shops/:id/orders` - Get shop orders
- PUT `/api/orders/:orderId/status` - Update order status
- POST `/api/orders/:orderId/assign-delivery` - Assign delivery boy
- PUT `/api/shops/:id/toggle-open` - Toggle shop open/close status

### Product APIs
- GET `/api/products` - List products (with filters/search)
- GET `/api/products/:id` - Get product details

### Cart APIs
- GET `/api/cart` - Get current cart (requires shop context)
- POST `/api/cart/add` - Add item to cart (validates shopId consistency)
- PUT `/api/cart/update` - Update item quantity
- DELETE `/api/cart/remove` - Remove item from cart
- DELETE `/api/cart/clear` - Clear cart
- POST `/api/cart/validate` - Validate cart stock and pricing

### Order APIs
- GET `/api/orders` - Get user orders (with filters)
- GET `/api/orders/:id` - Get order details
- POST `/api/orders` - Create order from cart (includes shopId and address validation)
- PUT `/api/orders/:id/cancel` - Cancel order
- PUT `/api/admin/orders/:id/force-cancel` - Admin force cancel order
- POST `/api/orders/:id/payment-status` - Update payment status (for future online payments)

### Delivery APIs
- GET `/api/delivery/assignments` - Get assigned deliveries (delivery boy)
- GET `/api/delivery/shop-assignments` - Get deliveries needing assignment (shop owner)
- PUT `/api/delivery/:id/update-status` - Update delivery status
- POST `/api/delivery/:id/verify-otp` - Verify OTP for delivery
- POST `/api/delivery/:id/reschedule` - Reschedule failed delivery

### Admin APIs
- GET `/api/admin/shops` - List shops (pending approval)
- PUT `/api/admin/shops/:id/approve` - Approve shop
- PUT `/api/admin/shops/:id/reject` - Reject shop
- GET `/api/admin/users` - List all users
- PUT `/api/admin/users/:id/role` - Update user role
- GET `/api/admin/orders` - List all orders (with filters)
- GET `/api/admin/stats` - Get platform-wide analytics
- POST `/api/admin/orders/:id/dispute` - Handle order dispute
- GET `/api/admin/notifications/failed` - Get failed notifications for retry

### Notification APIs
- POST `/api/notifications` - Create notification (internal use)
- GET `/api/notifications` - Get user notifications
- PUT `/api/notifications/:id/mark-read` - Mark notification as read

## 7. Pages

### Customer Pages
- Landing/Home Page
- Shop List Page
- Shop Detail Page
- Product Detail Page
- Cart Page
- Checkout Page (with address selection)
- Order History Page
- Order Tracking Page
- Profile Page (with address management)
- Login/Register Pages

### Shop Owner Dashboard Pages
- Dashboard Overview
- Product Management (List/Add/Edit)
- Order Management (New/Processing/Completed)
- Delivery Boy Management
- Delivery Assignment Panel
- Profile/Settings
- Earnings/Analytics
- Shop Status (Open/Close Toggle)

### Delivery Boy Pages
- Login Page
- Assigned Deliveries List
- Delivery Detail Page
- Profile/Settings

### Admin Panel Pages
- Login Page
- Dashboard Overview
- Shop Management (Pending/Approved/Rejected)
- User Management
- Order Management (All Orders)
- Dispute Resolution Center
- Analytics & Reports
- Notification Management
- System Settings

## 8. End-to-End Flow Pages

### Browse → Order → Delivery Flow
1. **Home Page** → Featured shops carousel + category filters
2. **Shop List** → Grid view with ratings, distance, open status
3. **Shop Detail** → Shop info + product grid with add-to-cart
4. **Product Detail** → Images, description, price, stock, add-to-cart
5. **Cart** → Items list, quantity adjustment, special instructions (shop-specific)
6. **Checkout** → 
   - Address selection (new/saved)
   - Order summary
   - Place order button
7. **Order Confirmation** → Order ID, estimated time, WhatsApp notification sent
8. **Order Tracking** → Real-time status updates (preparing → out for delivery → delivered)
9. **Delivery Completion** → Rating prompt + reorder option + payment confirmation (for COD)

### Shop → Accept → Assign Delivery Flow
1. **Shop Dashboard** → New orders tab with count badge
2. **Order Detail** → Customer info, items, total, accept/reject buttons
3. **Accept Order** → Status changes to ACCEPTED, triggers WhatsApp notification
4. **Assign Delivery Boy** → List of available delivery boys from shop's team
5. **Order Processing** → Status: ASSIGNED, shows delivery boy details
6. **Out for Delivery** → Status update when delivery boy confirms pickup
7. **Delivered** → Final status update + earnings calculation + payment completion
8. **Failed Delivery** → Option to reschedule or mark as failed with reason

### Admin → Monitor → Control Flow
1. **Admin Dashboard** → Key metrics: pending shops, active orders, revenue, failed notifications
2. **Shop Management** → List of shops with approval status, action buttons
3. **Approve/Reject Shop** → Modal with verification checklist, notes field
4. **Order Monitoring** → Real-time order list with filters (status, shop, date, payment status)
5. **Order Detail View** → Complete order lifecycle, customer/shop/delivery info
6. **Dispute Handling** → View dispute details, communicate with parties, resolve
7. **User Management** → Search/filter users, role modification, ban/unban
8. **Analytics Tab** → Daily/weekly/metrics charts, export functionality, shop performance
9. **Notification Center** → View failed notifications, trigger retry mechanism

## 9. Implementation Phases

### Phase 0: Setup & Environment (Week 1)
- Monorepo setup with Turborepo + Bun
- Docker Compose configuration for dev environment
- Base frontend (React + Vite + TypeScript + Tailwind)
- Base backend (Node.js + Express + TypeScript)
- Prisma ORM initialization with PostgreSQL
- CI/CD pipeline foundation (linting, type checking)
- Basic project structure and documentation

### Phase 1: Foundation & Authentication (Week 2-3)
- JWT-based auth system with refresh tokens
- Email/phone verification via WhatsApp OTP
- Role-based access control middleware
- User profile management APIs
- Address management system (CRUD operations)
- Login/register pages for all roles
- Password reset functionality
- Basic error handling middleware

### Phase 2: Core Marketplace (Week 4-5)
- Shop registration & approval workflow
- Product catalog management (CRUD)
- Shop-specific cart implementation (enforcing one cart per shop)
- Order creation from cart with stock validation
- Basic order listing for customers/shops
- Product browsing/filtering UI
- Inventory validation during cart operations

### Phase 3: Order & Delivery System (Week 6-7)
- Order status management workflow
- Delivery boy assignment system (shop-specific)
- Real-time status update APIs
- Delivery tracking UI for customers
- Delivery boy assignment & status update UI
- WhatsApp integration for order notifications
- Notification system with status tracking
- Basic retry mechanism for failed notifications

### Phase 4: Admin Panel & Enhancements (Week 8)
- Admin authentication & authorization
- Shop approval workflow
- User management interface
- Order monitoring dashboard
- Basic analytics & reporting
- Dispute handling capabilities
- Force cancel order functionality
- System settings management
- Shop open/close status toggle

### Phase 5: Optimization & QA (Week 9-10)
- Edge case handling (out of stock, cancellations)
- Payment simulation (COD only for MVP)
- Performance optimization (lazy loading, caching)
- Security audit & penetration testing
- Cross-browser/responsive testing
- Documentation & knowledge transfer
- MVP optimization review (remove over-engineering)
- Load testing preparation

### Phase 6: Deployment & Launch (Week 11)
- Production Docker Compose configuration
- Environment-specific configuration management
- Load testing & performance benchmarking
- Final QA & bug bash
- Soft launch to limited user group
- Full launch & monitoring
- Observability setup (logging basics)

## 10. Acceptance Criteria

### Functional Requirements
- [ ] Customers can browse shops/products without authentication
- [ ] Authentication required for cart/order operations
- [ ] Shop owners can manage their inventory and orders
- [ ] Delivery boys can view/update assigned deliveries from their shop only
- [ ] Admin can approve shops, force cancel orders, handle disputes, and monitor all activities
- [ ] Orders are shop-specific (no multi-shop cart in MVP)
- [ ] All order status transitions trigger WhatsApp notifications
- [ ] Cash on Delivery is the only payment method (with structure for future online payments)
- [ ] Role-based access control prevents unauthorized actions
- [ ] Cart enforces one cart per shop rule
- [ ] Address management allows users to save and select addresses
- [ ] Stock validation prevents overselling during cart operations and order creation
- [ ] Delivery boys are linked to specific shops
- [ ] Notification system tracks status and implements retry mechanism

### User Experience Requirements
- [ ] Page load time < 3s on 3G connection
- [ ] Mobile-responsive design across all pages
- [ ] Intuitive navigation with < 3 clicks to core actions
- [ ] Clear error messages and validation feedback
- [ ] Accessible color contrast and keyboard navigation
- [ ] Consistent UI components using Shadcn primitives
- [ ] Smooth animations for state transitions (Framer Motion)
- [ ] Empty states with helpful guidance
- [ ] Address selection during checkout is intuitive
- [ ] Order tracking provides clear status updates

### System Performance
- [ ] API response time < 500ms for 95% of requests
- [ ] Database query optimization with proper indexing
- [ ] Concurrent user support: 100+ simultaneous users
- [ ] Efficient cart operations (< 100ms add/update/remove)
- [ ] Order processing completes within 2s
- [ ] Image serving optimized for mobile networks
- [ ] Memory leaks addressed in frontend components
- [ ] Proper error boundaries and loading states
- [ ] Stock validation adds minimal latency (< 50ms)
- [ ] Notification processing is asynchronous

### Security Validation
- [ ] All endpoints protected by authentication middleware
- [ ] Role-based authorization verified for all resources
- [ ] Input validation prevents injection/XSS attacks
- [ ] Passwords hashed with bcrypt (min 12 rounds)
- [ ] JWT tokens have short expiry (15m) with rotation
- [ ] Rate limiting on auth endpoints (5 attempts/min)
- [ ] CORS policies restrict to approved domains
- [ ] Helmet.js security headers implemented
- [ ] Regular dependency vulnerability scanning
- [ ] Secure handling of OTP verification
- [ ] Protection against timing attacks in validation

### Error Handling & Observability
- [ ] Centralized error handling middleware catches all errors
- [ ] Standard API response format for success and error cases
- [ ] Distinction between validation errors (400) and system errors (500)
- [ ] Logging captures essential information for debugging
- [ ] Failed notifications are tracked and can be retried
- [ ] Error rates are monitored and alerted on thresholds

### End-to-End Flow Validation
- [ ] Complete customer journey: browse → order → track → receive
- [ ] Complete shop workflow: register → approve → manage inventory → process orders
- [ ] Complete delivery workflow: login → accept assignment → update status → complete
- [ ] Complete admin workflow: login → monitor shops/orders → intervene when needed
- [ ] WhatsApp notifications sent at all critical junctures
- [ ] Data consistency maintained across all flows
- [ ] Error handling and recovery paths validated
- [ ] Performance under peak load conditions tested
- [ ] Backup and recovery procedures validated